"use client";

import { useRef, useLayoutEffect, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  Both ForeverWaterIntro files are identical content exported from DaVinci Resolve.
  - .mov = ProRes 422 HQ (178 Mbps) — massive, not web-friendly
  - .mp4 = H.264 (21 Mbps) — web-optimised, universally supported
  We use the MP4 for both intro and loop to guarantee a zero-jump cutover
  because both elements source the exact same pixels.
*/
const VIDEO_SRC = "/videos/ForeverWaterIntro2.mp4";
const LOOP_START = 3.04; // seconds — intro ends here, loop begins here

/* Split text into word spans for GSAP stagger animation */
function WordSpan({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className={`word inline-block opacity-0 ${className || ""}`}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const introRef = useRef<HTMLVideoElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  /* ── Intro load animation ──
     Timeline starts at 1.0 s so the video plays solo for the first second.
     All text entrance finishes by 2.5 s (1.5 s window).
  */
  useLayoutEffect(() => {
    const container = textLayerRef.current;
    if (!container) return;

    const labels = container.querySelectorAll('[data-animate="label"]');
    const headlines = container.querySelectorAll('[data-animate="headline"]');
    const bodies = container.querySelectorAll('[data-animate="body"]');
    const buttonsWraps = container.querySelectorAll('[data-animate="buttons"]');
    const scrolls = container.querySelectorAll('[data-animate="scroll"]');

    const allWords: Element[] = [];
    headlines.forEach((h) => {
      h.querySelectorAll(".word").forEach((w) => allWords.push(w));
    });

    const allBtns: Element[] = [];
    buttonsWraps.forEach((b) => {
      b.querySelectorAll("a").forEach((a) => allBtns.push(a));
    });

    const targets = [...labels, ...allWords, ...bodies, ...allBtns, ...scrolls];
    if (targets.length === 0) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      delay: 1.0,
    });

    // Reset positions before animating
    gsap.set(targets, { opacity: 0, y: 20 });

    // 1.0s → 1.45s  label
    // 1.15s → ~1.75s headline words (staggered)
    // 1.55s → 1.95s  body
    // 1.85s → ~2.25s buttons
    // 2.1s  → 2.5s   scroll indicator
    tl.to(labels,   { opacity: 1, y: 0, duration: 0.45 }, 0)
      .to(allWords, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04 }, 0.15)
      .to(bodies,   { opacity: 1, y: 0, duration: 0.4 }, 0.55)
      .to(allBtns,  { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, 0.85)
      .to(scrolls,  { opacity: 1, y: 0, duration: 0.4 }, 1.1);

    return () => { tl.kill(); };
  }, []);

  /* ── Scroll parallax on text layer ── */
  useEffect(() => {
    const textLayer = textLayerRef.current;
    if (!textLayer) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        textLayer,
        { y: 0 },
        {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.55, 0.85], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.55, 0.85], [1, 1, 0.97]);

  /* ── Loop video: preload and prime decoder at LOOP_START ── */
  useEffect(() => {
    const loop = loopRef.current;
    if (!loop) return;
    loop.load();
    loop.currentTime = LOOP_START;
  }, []);

  /* ── Loop video: custom loop segment 3.04 s → end ── */
  useEffect(() => {
    const loop = loopRef.current;
    if (!loop) return;

    const handleTime = () => {
      // When within 100 ms of the end, snap back to LOOP_START
      if (loop.duration && loop.currentTime >= loop.duration - 0.1) {
        loop.currentTime = LOOP_START;
      }
    };

    loop.addEventListener("timeupdate", handleTime);
    return () => loop.removeEventListener("timeupdate", handleTime);
  }, []);

  const handleIntroEnded = () => {
    const loop = loopRef.current;
    const intro = introRef.current;
    if (!loop || !intro) return;

    // Only hide the intro once the loop has actually started rendering,
    // preventing a black frame between the two videos.
    const onPlaying = () => {
      loop.removeEventListener("playing", onPlaying);
      intro.style.opacity = "0";
    };

    loop.addEventListener("playing", onPlaying);
    loop.currentTime = LOOP_START;
    loop.play();
  };

  return (
    <div ref={wrapperRef} className="relative" style={{ height: "150vh" }}>
      <motion.div
        style={{ opacity, scale }}
        className="sticky top-0 z-[1] h-svh w-full overflow-hidden"
      >
        <div className="relative h-full w-full">
          {/* Loop video — bottom layer, same source, starts at 3.04 s */}
          <video
            ref={loopRef}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ willChange: "opacity" }}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>

          {/* Intro video — top layer, plays 0 → 3.04 s, instant cut on end */}
          <video
            ref={introRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleIntroEnded}
            className="absolute inset-0 z-10 h-full w-full object-cover"
            style={{ willChange: "opacity" }}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />

          {/* ── Content ── */}
          <div ref={textLayerRef} className="absolute inset-0 flex">
            <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col justify-between px-6 py-16 md:px-10 md:py-20">
              {/*
                MOBILE (< md): text top-center, buttons bottom-center
              */}
              <div className="flex flex-col items-center text-center pt-[2vh] md:hidden">
                <span
                  data-animate="label"
                  className="label-water mb-3 block opacity-0"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
                >
                  Premium Branded Water
                </span>
                <h1
                  data-animate="headline"
                  className="font-serif font-light text-paper leading-[0.92] tracking-[-0.03em]"
                  style={{
                    fontSize: "clamp(2rem, 9vw, 2.8rem)",
                    maxWidth: "12ch",
                    textShadow:
                      "0 1px 2px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.45), 0 12px 30px rgba(0,0,0,0.3)",
                  }}
                >
                  <WordSpan text="Water, designed into the room" />
                </h1>
                <p
                  data-animate="body"
                  className="mt-4 max-w-[42ch] text-base leading-relaxed text-paper/70 opacity-0"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
                >
                  Custom glass bottles for restaurants, hotels, and events.
                  Quietly branded. Calmly placed.
                </p>

                <div
                  data-animate="buttons"
                  className="mt-8 flex w-full flex-col items-center gap-3 opacity-0"
                >
                  <a href="#collection" className="btn-primary w-full text-center">
                    View Collection
                  </a>
                  <a href="#contact" className="btn-outline w-full text-center">
                    Start a Project
                  </a>
                </div>
              </div>

              {/*
                DESKTOP (md+): diagonal composition
              */}
              <div className="hidden flex-col items-start text-left md:flex md:pt-[10vh]">
                <span
                  data-animate="label"
                  className="label-water mb-5 block opacity-0"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
                >
                  Premium Branded Water
                </span>
                <h1
                  data-animate="headline"
                  className="headline-xl max-w-[12ch] text-paper"
                  style={{
                    textShadow:
                      "0 1px 2px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.45), 0 12px 40px rgba(0,0,0,0.35), 0 24px 80px rgba(0,0,0,0.25), 0 0 60px rgba(0,0,0,0.15)",
                  }}
                >
                  <WordSpan text="Water, designed into the room" />
                </h1>
                <p
                  data-animate="body"
                  className="mt-5 max-w-[42ch] text-base leading-relaxed text-paper/70 md:text-lg opacity-0"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
                >
                  Custom glass bottles for restaurants, hotels, and events.
                  Quietly branded. Calmly placed.
                </p>
              </div>

              {/* Bottom row — desktop only */}
              <div className="hidden w-full items-end justify-between md:flex">
                {/* Scroll indicator */}
                <div
                  data-animate="scroll"
                  className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 opacity-0"
                >
                  <span
                    className="label"
                    style={{
                      color: "rgba(245,245,240,0.35)",
                      letterSpacing: "0.2em",
                    }}
                  >
                    Scroll
                  </span>
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <svg
                      width="16"
                      height="24"
                      viewBox="0 0 16 24"
                      fill="none"
                      stroke="rgba(245,245,240,0.35)"
                      strokeWidth="1"
                      strokeLinecap="round"
                    >
                      <path d="M8 4v16M3 15l5 5 5-5" />
                    </svg>
                  </motion.div>
                </div>

                {/* Buttons — bottom-right */}
                <div
                  data-animate="buttons"
                  className="ml-auto flex flex-wrap justify-end gap-4 opacity-0"
                >
                  <a href="#collection" className="btn-primary">
                    View Collection
                  </a>
                  <a href="#contact" className="btn-outline">
                    Start a Project
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
