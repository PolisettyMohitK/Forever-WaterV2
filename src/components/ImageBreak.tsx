"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ImageBreak() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    const line = lineRef.current;
    if (!section || !img) return;

    const ctx = gsap.context(() => {
      // Decorative line draws across first
      if (line) {
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: "center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "top 50%",
              scrub: 1,
            },
          }
        );
      }

      // Image parallax + scale
      gsap.fromTo(
        img,
        { scale: 1.1, y: 30 },
        {
          scale: 1,
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef}>
      <div className="relative mx-auto max-w-[1400px] overflow-hidden">
        {/* Decorative line above image */}
        <div
          ref={lineRef}
          className="mx-auto mb-8 h-px w-[40%] max-w-[200px] origin-center"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(107,155,138,0.5), transparent)",
            transform: "scaleX(0)",
          }}
        />
        <div ref={imgRef} className="relative aspect-[21/9] w-full md:aspect-[21/8]">
          <Image
            src="/images/Bottle_in_ice.jpeg"
            alt="Branded water bottle in ice"
            fill
            className="img-break object-cover"
            sizes="100vw"
          />
          {/* Subtle mineral-water tint overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(107,155,138,0.08) 50%, rgba(0,0,0,0.45) 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
