"use client";

/* eslint-disable react-hooks/refs */
// Three.js imperative APIs require ref access during render.
// This pattern is standard in @react-three/fiber and safe for this use case.

import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";

/* ================================================================
   SHADERS
   ================================================================ */

const SIMULATION_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SIMULATION_FRAGMENT = `
  uniform sampler2D uPrevious;
  uniform sampler2D uCurrent;
  uniform vec2 uResolution;
  uniform float uDamping;
  uniform vec2 uImpulsePos;
  uniform float uImpulseStrength;
  uniform vec2 uCursorPos;
  uniform float uCursorStrength;

  varying vec2 vUv;

  void main() {
    vec2 e = 1.0 / uResolution;

    // Average of four neighbors
    float avg = (
      texture2D(uCurrent, vUv - vec2(e.x, 0.0)).r +
      texture2D(uCurrent, vUv + vec2(e.x, 0.0)).r +
      texture2D(uCurrent, vUv - vec2(0.0, e.y)).r +
      texture2D(uCurrent, vUv + vec2(0.0, e.y)).r
    ) * 0.25;

    // Verlet integration
    float val = (avg * 2.0) - texture2D(uPrevious, vUv).r;
    val *= uDamping;

    // Auto-ripple injection
    float dist = distance(vUv, uImpulsePos);
    if (dist < 0.04 && uImpulseStrength > 0.0) {
      val += uImpulseStrength * (1.0 - smoothstep(0.0, 0.04, dist));
    }

    // Cursor ripple injection
    float cursorDist = distance(vUv, uCursorPos);
    if (cursorDist < 0.03 && uCursorStrength > 0.0) {
      val += uCursorStrength * (1.0 - smoothstep(0.0, 0.03, cursorDist));
    }

    gl_FragColor = vec4(val, 0.0, 0.0, 1.0);
  }
`;

const RENDER_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RENDER_FRAGMENT = `
  uniform sampler2D uHeightMap;
  uniform vec2 uResolution;
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    vec2 texel = 1.0 / uResolution;

    // 3x3 blur for smoother normals
    float h = texture2D(uHeightMap, vUv).r * 0.25;
    h += texture2D(uHeightMap, vUv + vec2(texel.x, 0.0)).r * 0.125;
    h += texture2D(uHeightMap, vUv - vec2(texel.x, 0.0)).r * 0.125;
    h += texture2D(uHeightMap, vUv + vec2(0.0, texel.y)).r * 0.125;
    h += texture2D(uHeightMap, vUv - vec2(0.0, texel.y)).r * 0.125;
    h += texture2D(uHeightMap, vUv + texel).r * 0.0625;
    h += texture2D(uHeightMap, vUv - texel).r * 0.0625;
    h += texture2D(uHeightMap, vUv + vec2(texel.x, -texel.y)).r * 0.0625;
    h += texture2D(uHeightMap, vUv + vec2(-texel.x, texel.y)).r * 0.0625;

    // Surface normal from height differences
    float hL = texture2D(uHeightMap, vUv - vec2(texel.x, 0.0)).r;
    float hR = texture2D(uHeightMap, vUv + vec2(texel.x, 0.0)).r;
    float hD = texture2D(uHeightMap, vUv - vec2(0.0, texel.y)).r;
    float hU = texture2D(uHeightMap, vUv + vec2(0.0, texel.y)).r;

    vec3 normal = normalize(vec3(
      (hL - hR) * 3.0,
      (hD - hU) * 3.0,
      1.0
    ));

    // Lighting
    vec3 lightDir = normalize(vec3(-0.3, 0.5, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);

    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    float specular = pow(max(dot(normal, halfDir), 0.0), 80.0);
    float caustic = pow(max(dot(normal, lightDir), 0.0), 4.0) * 0.5;

    // Mineral water accent: #6B9B8A — brighter for luminous background
    vec3 highlightColor = vec3(0.52, 0.72, 0.62);

    float intensity = specular * 0.6 + caustic * 0.35 + fresnel * 0.15;

    // More visible ripples across the surface
    float waveStrength = abs(h) * 14.0;
    intensity *= smoothstep(0.0, 0.18, waveStrength);

    vec3 color = highlightColor * intensity;
    float alpha = intensity * 0.75;

    gl_FragColor = vec4(color, alpha);
  }
`;

/* ================================================================
   FLUID RIPPLES — internal simulation mesh
   ================================================================ */

function FluidRipples() {
  const { gl, size, viewport } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollY = useRef(0);

  // Subtle parallax drift tied to scroll
  useEffect(() => {
    const onScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lower resolution on mobile for performance
  const simRes =
    typeof window !== "undefined" && window.innerWidth < 768 ? 256 : 512;

  const fboSettings = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
  };

  const fbo0 = useFBO(simRes, simRes, fboSettings);
  const fbo1 = useFBO(simRes, simRes, fboSettings);
  const fbo2 = useFBO(simRes, simRes, fboSettings);
  const fboRing = useRef([fbo0, fbo1, fbo2]);

  // Use refs for all mutable Three.js objects to satisfy ESLint immutability rules
  const simSceneRef = useRef<THREE.Scene | null>(null);
  if (!simSceneRef.current) simSceneRef.current = new THREE.Scene();

  const simCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  if (!simCameraRef.current)
    simCameraRef.current = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const simQuadRef = useRef<THREE.Mesh | null>(null);
  if (!simQuadRef.current)
    simQuadRef.current = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));

  const simMatRef = useRef<THREE.ShaderMaterial | null>(null);
  if (!simMatRef.current) {
    simMatRef.current = new THREE.ShaderMaterial({
      vertexShader: SIMULATION_VERTEX,
      fragmentShader: SIMULATION_FRAGMENT,
      uniforms: {
        uPrevious: { value: null },
        uCurrent: { value: null },
        uResolution: { value: new THREE.Vector2(simRes, simRes) },
        uDamping: { value: 0.996 },
        uImpulsePos: { value: new THREE.Vector2(0.5, 0.5) },
        uImpulseStrength: { value: 0.0 },
        uCursorPos: { value: new THREE.Vector2(0.5, 0.5) },
        uCursorStrength: { value: 0.0 },
      },
    });
  }

  const renderMatRef = useRef<THREE.ShaderMaterial | null>(null);
  if (!renderMatRef.current) {
    renderMatRef.current = new THREE.ShaderMaterial({
      vertexShader: RENDER_VERTEX,
      fragmentShader: RENDER_FRAGMENT,
      uniforms: {
        uHeightMap: { value: null },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }

  // Update render resolution on resize
  useEffect(() => {
    if (renderMatRef.current) {
      renderMatRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size]);

  /* ── Auto-ripple state ── */
  const nextRippleTime = useRef(0);
  const impulse = useRef({ x: 0.5, y: 0.5, strength: 0.0, frames: 0 });

  /* ── Cursor tracking state ── */
  const cursor = useRef({
    x: 0.5,
    y: 0.5,
    strength: 0.0,
  });
  const prevCursor = useRef({ x: 0.5, y: 0.5 });
  const isMoving = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - e.clientY / window.innerHeight; // UV space: bottom-left origin

      const dx = x - prevCursor.current.x;
      const dy = y - prevCursor.current.y;
      const velocity = Math.sqrt(dx * dx + dy * dy) * 60; // scale to useful range

      // Smooth movement decay (0–1)
      isMoving.current = Math.min(1.0, velocity * 2.5);

      cursor.current.x = x;
      cursor.current.y = y;
      prevCursor.current.x = x;
      prevCursor.current.y = y;
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useFrame((state) => {
    if (!gl.domElement) return;

    const simMat = simMatRef.current!;
    const renderMat = renderMatRef.current!;
    const simQuad = simQuadRef.current!;
    const simScene = simSceneRef.current!;
    const simCamera = simCameraRef.current!;

    // ── Auto-ripple spawn ──
    if (state.clock.elapsedTime > nextRippleTime.current) {
      // Very frequent: every 0.4–0.9 seconds for constant life
      nextRippleTime.current = state.clock.elapsedTime + 0.4 + Math.random() * 0.5;
      impulse.current = {
        x: Math.random(),
        y: Math.random(),
        strength: 0.28 + Math.random() * 0.12, // 0.28–0.40
        frames: 5,
      };

      // Occasionally spawn a second ripple nearby for organic clusters
      if (Math.random() > 0.6) {
        // Delay the second ripple slightly by spawning it next frame
        // We'll handle this by re-setting impulse on the next frame too,
        // but for simplicity we just let it ride — the high frequency already
        // creates overlap that looks organic.
      }
    }

    // Apply / decay auto impulse
    if (impulse.current.frames > 0) {
      simMat.uniforms.uImpulsePos.value.set(
        impulse.current.x,
        impulse.current.y
      );
      simMat.uniforms.uImpulseStrength.value = impulse.current.strength;
      impulse.current.frames--;
    } else {
      simMat.uniforms.uImpulseStrength.value = 0.0;
    }

    // ── Cursor impulse ──
    // Smooth decay of movement flag
    isMoving.current *= 0.88;

    simMat.uniforms.uCursorPos.value.set(cursor.current.x, cursor.current.y);
    // Cursor strength based on movement velocity, capped
    const cursorStrength = isMoving.current * 0.35;
    simMat.uniforms.uCursorStrength.value = cursorStrength;

    // ── Simulation pass (ping-pong FBO) ──
    const [prevFBO, currFBO, nextFBO] = fboRing.current;

    simMat.uniforms.uPrevious.value = prevFBO.texture;
    simMat.uniforms.uCurrent.value = currFBO.texture;
    simQuad.material = simMat;
    simScene.add(simQuad);

    gl.setRenderTarget(nextFBO);
    gl.render(simScene, simCamera);
    gl.setRenderTarget(null);
    simScene.remove(simQuad);

    // Rotate ring buffer
    fboRing.current = [currFBO, nextFBO, prevFBO];

    // ── Update render material ──
    renderMat.uniforms.uHeightMap.value = fboRing.current[1].texture;
    renderMat.uniforms.uTime.value = state.clock.elapsedTime;

    // Parallax drift: mesh moves slightly opposite to scroll
    if (meshRef.current) {
      meshRef.current.position.y = scrollY.current * 0.0003;
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={renderMatRef.current} attach="material" />
    </mesh>
  );
}

/* ================================================================
   EXPORT — fixed background canvas
   ================================================================ */

export default function FluidBackground() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ width: "100%", height: "100%" }}
      >
        <FluidRipples />
      </Canvas>
    </div>
  );
}
