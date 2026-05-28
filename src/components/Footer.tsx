"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "./Logo";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        footer,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: footer,
            start: "top 95%",
            end: "top 75%",
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="border-t border-paper/5" style={{ opacity: 0 }}>
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10 md:py-16">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          {/* Left */}
          <div>
            <Logo variant="light" className="h-6 w-auto" />
            <p className="mt-3 text-sm text-slate">
              Premium branded water, quietly placed.
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-wrap gap-8 text-sm text-slate">
            <a href="#collection" className="transition-colors hover:text-paper">
              Collection
            </a>
            <a href="#approach" className="transition-colors hover:text-paper">
              Approach
            </a>
            <a href="#contact" className="transition-colors hover:text-paper">
              Contact
            </a>
          </div>
        </div>

        <div className="rule mt-10" />

        <div className="mt-6 flex flex-wrap justify-between gap-4 text-xs text-slate-dim">
          <span>Forever Water. All rights reserved.</span>
          <span>Designed to extend the space.</span>
        </div>
      </div>
    </footer>
  );
}
