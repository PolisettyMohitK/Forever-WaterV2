"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

const navLinks = [
  { label: "Collection", href: "#collection" },
  { label: "Approach", href: "#approach" },
  { label: "Contact", href: "#contact" },
];

/* Easing */
const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeInOutQuart: [number, number, number, number] = [0.76, 0, 0.24, 1];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const overlayVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { opacity: 1, backdropFilter: "blur(16px)", transition: { duration: 0.5, ease: easeInOutQuart } },
    exit: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.35, ease: easeInOutQuart } },
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.6, delay: 0.15, ease: easeOutExpo } },
    exit: { scaleX: 0, transition: { duration: 0.3, ease: easeInOutQuart } },
  };

  const linkContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
    exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  };

  const linkItem = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: easeOutExpo } },
    exit: { y: 20, opacity: 0, transition: { duration: 0.3, ease: easeInOutQuart } },
  };

  const ctaItem = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, delay: 0.5, ease: easeOutExpo } },
    exit: { y: 15, opacity: 0, transition: { duration: 0.25, ease: easeInOutQuart } },
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          scrolled ? "bg-ink/70 backdrop-blur-sm" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <Logo variant="light" className="h-8 w-auto" />
            <span className="hidden h-px w-6 bg-water opacity-0 transition-opacity group-hover:opacity-100 sm:inline-block" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="label transition-colors hover:text-paper"
              >
                {link.label}
              </a>
            ))}
            <a href="#contact" className="btn-primary text-xs py-3 px-5">
              Inquire
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: easeInOutQuart }}
              className="block h-px w-6 bg-paper origin-center"
            />
            <motion.span
              animate={menuOpen ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.25, ease: easeInOutQuart }}
              className="block h-px w-6 bg-paper origin-center"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: easeInOutQuart }}
              className="block h-px w-6 bg-paper origin-center"
            />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink/90 md:hidden"
          >
            {/* Decorative horizontal rule */}
            <motion.div
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-[30%] left-0 right-0 mx-auto h-px w-[60%] max-w-[300px] origin-center"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(107,155,138,0.4), transparent)",
              }}
            />

            <motion.nav
              variants={linkContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center gap-10"
            >
              {navLinks.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  variants={linkItem}
                  className="group relative font-serif text-4xl text-paper md:text-5xl"
                  style={{
                    textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                  }}
                >
                  <span className="relative">
                    {link.label}
                    {/* Animated underline on hover */}
                    <span
                      className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-water transition-transform duration-300 ease-out group-hover:scale-x-100"
                    />
                  </span>
                </motion.a>
              ))}

              <motion.a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                variants={ctaItem}
                className="btn-primary mt-6"
              >
                Inquire
              </motion.a>
            </motion.nav>

            {/* Decorative horizontal rule bottom */}
            <motion.div
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute bottom-[25%] left-0 right-0 mx-auto h-px w-[60%] max-w-[300px] origin-center"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(107,155,138,0.4), transparent)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
