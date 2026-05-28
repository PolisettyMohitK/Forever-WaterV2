"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedText } from "@/hooks/useScrollReveal";

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    name: "Hospitality",
    size: "750 ml",
    description:
      "Full-wrap branding on borosilicate glass. Designed for suites, dining rooms, and welcome service where the bottle becomes part of the room.",
    image: "/images/Bottle_1.jpeg",
    tag: "01",
  },
  {
    name: "Events",
    size: "500 ml",
    description:
      "Compact footprint, easy event handling. A quieter object on the table that still carries the full brand signal.",
    image: "/images/Aesthetic_bottle_shot.jpeg",
    tag: "02",
  },
  {
    name: "Corporate",
    size: "1 L",
    description:
      "Generous capacity with a calm silhouette. For lounges, meeting rooms, and long-table service where presence matters.",
    image: "/images/bottle_TrueBlack.jpeg",
    tag: "03",
  },
];

function ProductItem({
  product,
  isEven,
}: {
  product: (typeof products)[0];
  isEven: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    const img = imgRef.current;
    if (!row) return;

    const ctx = gsap.context(() => {
      // Row entrance: scale up + fade in
      gsap.fromTo(
        row,
        { scale: 0.96, y: 60, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: row,
            start: "top 90%",
            end: "top 40%",
            scrub: 1,
          },
        }
      );

      // Image parallax: drifts slightly slower than scroll
      if (img) {
        gsap.fromTo(
          img,
          { y: 40 },
          {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: row,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rowRef} style={{ opacity: 0 }}>
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16 lg:gap-24">
        {/* Image */}
        <div className={isEven ? "md:order-1" : "md:order-2"}>
          <div ref={imgRef} className="group relative aspect-[4/5] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover img-editorial"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <span className="absolute left-4 top-4 label-water">
              {product.tag}
            </span>
          </div>
        </div>

        {/* Text */}
        <div className={isEven ? "md:order-2" : "md:order-1"}>
          <div className="max-w-md">
            <span className="label mb-3 block text-paper/50">
              {product.size}
            </span>
            <AnimatedText
              as="h3"
              className="headline-md mb-6 text-paper"
              stagger={0.06}
              y={25}
              start="top 80%"
              end="top 50%"
            >
              {product.name}
            </AnimatedText>
            <AnimatedText
              as="p"
              className="body-editorial mb-8"
              stagger={0.04}
              y={15}
              start="top 75%"
              end="top 55%"
            >
              {product.description}
            </AnimatedText>
            <a
              href="#contact"
              className="group inline-flex items-center gap-3 text-sm uppercase tracking-widest text-paper transition-colors hover:text-water"
            >
              <span className="h-px w-8 bg-paper/30 transition-all group-hover:w-12 group-hover:bg-water" />
              Customize this format
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Collection() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        header,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
            end: "top 55%",
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="collection">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Section header */}
        <div ref={headerRef} className="mb-20 md:mb-28" style={{ opacity: 0 }}>
          <span className="label mb-4 block">Collection</span>
          <AnimatedText
            as="h2"
            className="headline-lg max-w-[20ch] text-paper"
            stagger={0.08}
            y={30}
            start="top 85%"
            end="top 55%"
          >
            Three formats, three contexts
          </AnimatedText>
        </div>

        {/* Editorial product grid */}
        <div className="flex flex-col gap-24 md:gap-32">
          {products.map((product, i) => (
            <ProductItem key={product.name} product={product} isEven={i % 2 === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
