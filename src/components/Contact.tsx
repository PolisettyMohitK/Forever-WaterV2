"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedText } from "@/hooks/useScrollReveal";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Left block: slides from left
      if (left) {
        gsap.fromTo(
          left,
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "top 40%",
              scrub: 1,
            },
          }
        );
      }

      // Right block: slides from right
      if (right) {
        gsap.fromTo(
          right,
          { x: 50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "top 40%",
              scrub: 1,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" ref={sectionRef}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-16 md:grid-cols-2 md:gap-24">
          {/* Left — text floats */}
          <div ref={leftRef} style={{ opacity: 0 }}>
            <span className="label mb-4 block">Start a project</span>
            <AnimatedText
              as="h2"
              className="headline-lg mb-8 max-w-[14ch] text-paper"
              stagger={0.07}
              y={25}
              start="top 80%"
              end="top 50%"
            >
              Ready when you are
            </AnimatedText>
            <p className="body-editorial mb-10 max-w-[45ch]">
              Tell us about your venue, your timeline, and your budget. We will
              come back with a format recommendation, pricing, and a mockup
              direction within 24 hours.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <span className="label mb-1 block text-paper/40">Minimum order</span>
                <span className="font-serif text-2xl text-paper">500 bottles</span>
              </div>
              <div>
                <span className="label mb-1 block text-paper/40">Typical response</span>
                <span className="font-serif text-2xl text-paper">24 hours</span>
              </div>
            </div>
          </div>

          {/* Right — form floats over fluid */}
          <div ref={rightRef} style={{ opacity: 0 }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="label mb-2 block">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border-b border-paper/10 bg-transparent py-3 text-paper outline-none transition-colors focus:border-water"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="label mb-2 block">Business</label>
                  <input
                    type="text"
                    required
                    className="w-full border-b border-paper/10 bg-transparent py-3 text-paper outline-none transition-colors focus:border-water"
                    placeholder="Business name"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="label mb-2 block">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full border-b border-paper/10 bg-transparent py-3 text-paper outline-none transition-colors focus:border-water"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="label mb-2 block">Volume</label>
                  <select
                    required
                    className="w-full border-b border-paper/10 bg-transparent py-3 text-paper outline-none transition-colors focus:border-water"
                    defaultValue=""
                  >
                    <option value="" disabled className="bg-ink text-slate">
                      Estimated volume
                    </option>
                    <option value="500-2000" className="bg-ink text-paper">
                      500 — 2,000
                    </option>
                    <option value="2000-10000" className="bg-ink text-paper">
                      2,000 — 10,000
                    </option>
                    <option value="10000+" className="bg-ink text-paper">
                      10,000+
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label mb-2 block">Message</label>
                <textarea
                  rows={4}
                  className="w-full resize-none border-b border-paper/10 bg-transparent py-3 text-paper outline-none transition-colors focus:border-water"
                  placeholder="Tell us about your venue, event, or rollout timeline..."
                />
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={submitted}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitted ? "Sent — we will be in touch" : "Send inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
