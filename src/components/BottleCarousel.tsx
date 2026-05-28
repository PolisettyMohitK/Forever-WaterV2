"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ================================================================
   SLIDE DATA — five bottles, five voices
   ================================================================ */

const slides = [
  {
    id: 1,
    name: "FOREVER",
    bottle: "/images/bottles/bottle-01.png",
    eyebrow: "EDITION 01 · OF FIVE",
    title: "The Forever",
    body: "Drawn from snowmelt that took a thousand years to reach the surface. Bottled the moment it remembered the sky. This is water that has been patient — and now waits for your name on its label.",
  },
  {
    id: 2,
    name: "GLACIAL",
    bottle: "/images/bottles/bottle-02.png",
    eyebrow: "EDITION 02 · OF FIVE",
    title: "The Glacial",
    body: "Clarity carved by sub-zero stillness. Every drop filtered through ancient ice, emerging with an edge that cuts the silence of a dining room.",
  },
  {
    id: 3,
    name: "PURIST",
    bottle: "/images/bottles/bottle-03.png",
    eyebrow: "EDITION 03 · OF FIVE",
    title: "The Purist",
    body: "Nothing added. Nothing taken. The bottle speaks only for the water inside it — minimal, restrained, entirely itself.",
  },
  {
    id: 4,
    name: "SOMMELIER",
    bottle: "/images/bottles/bottle-04.png",
    eyebrow: "EDITION 04 · OF FIVE",
    title: "The Sommelier",
    body: "A bottle that earns its place at the table. Designed for ceremony, for pairing, for the moment when the glass is lifted and conversation pauses.",
  },
  {
    id: 5,
    name: "HEIR",
    bottle: "/images/bottles/bottle-05.png",
    eyebrow: "EDITION 05 · OF FIVE",
    title: "The Heir",
    body: "Legacy in glass. A vessel meant to be passed down, to mark rituals, to hold water that carries memory from one generation to the next.",
  },
];

/* ================================================================
   EASING — GSAP power4 approximations
   ================================================================ */

const easeInOut: [number, number, number, number] = [0.76, 0, 0.24, 1];
const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ================================================================
   ENHANCED CHEVRON SVG
   ================================================================ */

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className={className}
    >
      <path
        d="M16 6L8 14L16 22"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className={className}
    >
      <path
        d="M12 6L20 14L12 22"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ================================================================
   BOTTLE CAROUSEL
   ================================================================ */

export default function BottleCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goNext = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % slides.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, []);

  /* Keyboard navigation */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  /* Native touch swipe — only horizontal, never blocks vertical scroll */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const start = touchStart.current;
      const end = e.changedTouches[0];
      const dx = end.clientX - start.x;
      const dy = end.clientY - start.y;
      touchStart.current = null;

      // Only act if horizontal movement dominates vertical
      if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 50) {
        if (dx < 0) goNext();
        else goPrev();
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [goNext, goPrev]);

  const current = slides[index];

  /* Framer Motion variants */
  const bottleVariants = {
    enter: (dir: number) => ({
      x: `${dir * 60}vw`,
      scale: 1.08,
      opacity: 0,
      filter: "blur(12px)",
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) => ({
      x: `${dir * -60}vw`,
      scale: 0.92,
      opacity: 0,
      filter: "blur(8px)",
    }),
  };

  const textVariants = {
    enter: (dir: number) => ({
      x: `${dir * 40}vw`,
      opacity: 0,
      filter: "blur(6px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) => ({
      x: `${dir * -40}vw`,
      opacity: 0,
      filter: "blur(4px)",
    }),
  };

  const copyVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Bottle collection carousel"
    >
      {/* ── PLANE 01 — Background: fluid ripples (inherited from fixed canvas) ── */}

      {/* ── PLANE 02 — Mid-ground typography (behind bottle) ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.h2
            key={`word-${current.id}`}
            custom={direction}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.75,
              ease: easeInOut,
            }}
            className="bottle-carousel-word whitespace-nowrap"
          >
            {current.name}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* ── PLANE 03 — Foreground: bottle + copy block ── */}
      <div className="relative z-20 flex w-full max-w-[1400px] flex-col items-center px-6 md:px-10">
        {/* Bottle with subtle caustic glow behind it */}
        <div className="relative flex h-[55vh] w-full items-center justify-center md:h-[62vh]">
          {/* Caustic pool — ties the bottle to the fluid background */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <div
              className="h-[40%] w-[60%] rounded-full opacity-30 blur-[80px] md:w-[40%]"
              style={{
                background:
                  "radial-gradient(circle, rgba(107,155,138,0.25) 0%, rgba(107,155,138,0.05) 60%, transparent 100%)",
              }}
            />
          </div>

          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={`bottle-${current.id}`}
              custom={direction}
              variants={bottleVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.7,
                ease: easeInOut,
              }}
              className="relative flex items-center justify-center"
              style={{
                willChange: "transform, opacity, filter",
                filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.bottle}
                alt={current.title}
                loading="eager"
                className="img-bottle h-full w-auto max-w-[55vw] object-contain md:max-w-[32vw] lg:max-w-[26vw]"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Copy block */}
        <div className="relative z-20 mt-6 w-full max-w-[520px] text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${current.id}`}
              variants={copyVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.5,
                delay: 0.15,
                ease: easeOut,
              }}
            >
              <span
                className="label mb-3 block tracking-[0.3em]"
                style={{
                  color: "rgba(245,245,240,0.55)",
                  textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                }}
              >
                {current.eyebrow}
              </span>
              <h3
                className="font-serif font-light italic leading-tight text-paper md:text-[56px]"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.25)",
                }}
              >
                {current.title}
              </h3>
              <p
                className="mx-auto mt-4 max-w-[45ch] text-[17px] leading-[1.7]"
                style={{
                  color: "rgba(200,200,195,0.85)",
                  textShadow: "0 1px 6px rgba(0,0,0,0.45)",
                }}
              >
                {current.body}
              </p>

              {/* CTA row */}
              <div className="mt-8 flex items-center justify-center gap-8">
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-2 text-sm uppercase tracking-widest text-paper transition-colors hover:text-water"
                >
                  <span>Customise This Bottle</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
                <span className="font-mono text-sm text-paper/40">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Navigation chevrons — visible on all sizes ── */}
      <button
        onClick={goPrev}
        aria-label="Previous bottle"
        className="group absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-full p-2 text-paper/40 transition-all hover:bg-paper/5 hover:text-paper md:left-8 md:p-3"
      >
        <ChevronLeft className="transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        onClick={goNext}
        aria-label="Next bottle"
        className="group absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-full p-2 text-paper/40 transition-all hover:bg-paper/5 hover:text-paper md:right-8 md:p-3"
      >
        <ChevronRight className="transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* ── Bottom gradient fade into next section ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
    </section>
  );
}
