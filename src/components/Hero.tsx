"use client";

import { useRef, useLayoutEffect, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = "/videos/ForeverWaterIntro2.mp4";
const LOOP_START = 3.06;

/* Split text into word spans for GSAP stagger */
function WordSpan({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={i} className="word inline-block" style={{ opacity: 0 }}>
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  /* ── GSAP entrance animation ──
     0-1.0s: video only
     1.0-2.5s: text staggers in
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

    gsap.set(targets, { opacity: 0, y: 28 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      delay: 1.0,
    });

    tl.to(labels,   { opacity: 1, y: 0, duration: 0.6 }, 0)
      .to(allWords, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 }, 0.15)
      .to(bodies,   { opacity: 1, y: 0, duration: 0.6 }, 0.55)
      .to(allBtns,  { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.8)
      .to(scrolls,  { opacity: 1, y: 0, duration: 0.5 }, 1.1);

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

  /* ── Single video: play intro 0-3.04s once, then loop 3.04s-end forever ── */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleEnded = () => {
      vid.currentTime = LOOP_START;
      vid.play();
    };

    vid.addEventListener("ended", handleEnded);
    return () => vid.removeEventListener("ended", handleEnded);
  }, []);

  return (
    <div ref={wrapperRef} className="relative" style={{ height: "150vh" }}>
      <motion.div
        style={{ opacity, scale }}
        className="sticky top-0 z-[1] h-svh w-full overflow-hidden"
      >
        <div className="relative h-full w-full">
          {/* Single video element — intro once, then loop segment */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />

          {/* Content */}
          <div ref={textLayerRef} className="absolute inset-0 flex">
            <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col justify-between px-6 py-16 md:px-10 md:py-20">
              {/* Mobile */}
              <div className="flex flex-col items-center text-center pt-[2vh] md:hidden">
                <span
                  data-animate="label"
                  className="label-water mb-3 block"
                  style={{ opacity: 0, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
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
                  className="mt-4 max-w-[42ch] text-base leading-relaxed text-paper/70"
                  style={{ opacity: 0, textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
                >
                  Custom glass bottles for restaurants, hotels, and events.
                  Quietly branded. Calmly placed.
                </p>

                <div
                  data-animate="buttons"
                  className="mt-8 flex w-full flex-col items-center gap-3"
                  style={{ opacity: 0 }}
                >
                  <a href="#collection" className="btn-primary w-full text-center">
                    View Collection
                  </a>
                  <a href="#contact" className="btn-outline w-full text-center">
                    Start a Project
                  </a>
                </div>
              </div>

              {/* Desktop */}
              <div className="hidden flex-col items-start text-left md:flex md:pt-[10vh]">
                <span
                  data-animate="label"
                  className="label-water mb-5 block"
                  style={{ opacity: 0, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
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
                  className="mt-5 max-w-[42ch] text-base leading-relaxed text-paper/70 md:text-lg"
                  style={{ opacity: 0, textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
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
                  className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
                  style={{ opacity: 0 }}
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
                  className="ml-auto flex flex-wrap justify-end gap-4"
                  style={{ opacity: 0 }}
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
