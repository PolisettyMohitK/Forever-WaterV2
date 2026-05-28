"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedText } from "@/hooks/useScrollReveal";

gsap.registerPlugin(ScrollTrigger);

const principles = [
  {
    num: "01",
    title: "Quiet presence",
    body: "The bottle should feel like it was already there. No loud colors, no competing messages. Just calm, considered branding that respects the room.",
  },
  {
    num: "02",
    title: "Material first",
    body: "Borosilicate glass. Full-wrap ceramic print. Weight in the hand. These material choices do more than any graphic treatment could.",
  },
  {
    num: "03",
    title: "Scalable craft",
    body: "From 500 bottles for a boutique hotel to 50,000 for a national rollout. Same quality, same attention, same quiet confidence.",
  },
];

function PrincipleItem({
  principle,
}: {
  principle: (typeof principles)[0];
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    const line = lineRef.current;
    if (!row) return;

    const ctx = gsap.context(() => {
      // Rule line draws first
      if (line) {
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: row,
              start: "top 80%",
              end: "top 60%",
              scrub: 1,
            },
          }
        );
      }

      // Row content follows
      gsap.fromTo(
        row,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: row,
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rowRef} style={{ opacity: 0 }}>
      <div className="grid gap-6 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-2">
          <span className="label-water">{principle.num}</span>
        </div>
        <div className="md:col-span-4">
          <h3 className="font-serif text-2xl text-paper md:text-3xl">
            {principle.title}
          </h3>
        </div>
        <div className="md:col-span-6">
          <p className="body-editorial max-w-[50ch]">{principle.body}</p>
        </div>
      </div>
      <div
        ref={lineRef}
        className="mt-8 h-px w-full origin-left"
        style={{
          background:
            "linear-gradient(90deg, rgba(107,155,138,0.3), transparent)",
        }}
      />
    </div>
  );
}

export default function Approach() {
  const headerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const divider = dividerRef.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      // Header slides from left
      gsap.fromTo(
        header,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
            end: "top 50%",
            scrub: 1,
          },
        }
      );

      // Divider line draws
      if (divider) {
        gsap.fromTo(
          divider,
          { scaleX: 0, transformOrigin: "center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: divider,
              start: "top 80%",
              end: "top 60%",
              scrub: 1,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="approach">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Header — slides from left */}
        <div
          ref={headerRef}
          className="mb-20 grid gap-8 md:mb-28 md:grid-cols-2 md:gap-16"
          style={{ opacity: 0 }}
        >
          <div>
            <span className="label mb-4 block">Approach</span>
            <AnimatedText
              as="h2"
              className="headline-lg max-w-[16ch] text-paper"
              stagger={0.07}
              y={25}
              start="top 85%"
              end="top 55%"
            >
              Designed to extend the space
            </AnimatedText>
          </div>
          <div className="flex items-end">
            <p className="body-editorial max-w-[45ch]">
              We believe branded water should feel like part of the architecture.
              Not an advertisement. Not an afterthought. An object that belongs.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          ref={dividerRef}
          className="rule mb-16 origin-center md:mb-20"
          style={{ transform: "scaleX(0)" }}
        />

        {/* Principles */}
        <div className="flex flex-col gap-16 md:gap-20">
          {principles.map((p) => (
            <PrincipleItem key={p.num} principle={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
