"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  y?: number;
  x?: number;
  scale?: number;
  opacity?: number;
  duration?: number;
  stagger?: number;
  scrub?: boolean | number;
  start?: string;
  end?: string;
  ease?: string;
  delay?: number;
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      y = 40,
      x = 0,
      scale = 1,
      opacity = 0,
      duration = 1,
      stagger = 0,
      scrub = 1,
      start = "top 85%",
      end = "bottom 15%",
      ease = "none",
      delay = 0,
    } = options;

    const fromVars: gsap.TweenVars = {
      y,
      x,
      opacity,
      scale,
      duration,
      ease,
      delay,
    };

    const toVars: gsap.TweenVars = {
      y: 0,
      x: 0,
      opacity: 1,
      scale: 1,
      duration,
      ease,
      stagger,
      scrollTrigger: {
        trigger: el,
        start,
        end,
        scrub,
      },
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(el, fromVars, toVars);
    });

    return () => ctx.revert();
  }, [options]);

  return ref;
}

/* ================================================================
   ANIMATED TEXT — word-by-word reveal with GSAP ScrollTrigger
   ================================================================ */

export function AnimatedText({
  children,
  className = "",
  as: Tag = "span",
  stagger = 0.08,
  y = 30,
  start = "top 85%",
  end = "bottom 60%",
  scrub = 1,
}: {
  children: string;
  className?: string;
  as?: React.ElementType;
  stagger?: number;
  y?: number;
  start?: string;
  end?: string;
  scrub?: boolean | number;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const words = container.querySelectorAll(".word");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          stagger,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start,
            end,
            scrub,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [children, stagger, y, start, end, scrub]);

  const words = children.split(" ").map((word, i) => (
    <span key={i} className="word inline-block" style={{ opacity: 0 }}>
      {word}
      {i < children.split(" ").length - 1 ? "\u00A0" : ""}
    </span>
  ));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Tag as any;

  return (
    <Comp ref={containerRef} className={className}>
      {words}
    </Comp>
  );
}
