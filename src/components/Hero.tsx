"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { HERO_SLIDES, PROFILE } from "@/lib/content";
import { fetchPortfolioItems } from "@/lib/supabase";
import Magnetic from "./Magnetic";

export default function Hero({ onPlay }: { onPlay: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState<string[]>(HERO_SLIDES);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    let cancelled = false;
    fetchPortfolioItems().then((items) => {
      if (cancelled) return;
      const heroItems = items.filter((i) => i.section === "hero");
      if (heroItems.length > 0) {
        setSlides(heroItems.map((i) => i.url));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Listen for lang changes from Navbar
  useEffect(() => {
    const handler = (e: Event) => {
      setLang((e as CustomEvent).detail as "fr" | "en");
    };
    document.addEventListener("lang-change", handler);
    return () => document.removeEventListener("lang-change", handler);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      let started = false;
      const play = () => {
        if (started) return;
        started = true;
        gsap.from("[data-hero-title-line] > span", {
          yPercent: 120,
          duration: 1.6,
          stagger: 0.14,
          ease: "power4.out",
          delay: 0.1,
        });
        gsap.from("[data-hero-meta]", {
          opacity: 0,
          y: 40,
          duration: 1.2,
          stagger: 0.15,
          delay: 0.9,
          ease: "power3.out",
        });
        gsap.from("[data-hero-scroll]", {
          opacity: 0,
          duration: 1.2,
          delay: 1.8,
        });
        gsap.from("[data-hero-counter]", {
          opacity: 0,
          duration: 1,
          delay: 1.2,
        });
      };
      window.addEventListener("bk:ready", play);
      setTimeout(play, 3200);

      gsap.to("[data-hero-bg]", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to("[data-hero-content]", {
        yPercent: -22,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "80% top",
          scrub: true,
        },
      });
    }, root);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  useEffect(() => {
    if (!playing || slides.length === 0) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4800);
    return () => clearInterval(t);
  }, [playing, slides.length]);

  useEffect(() => {
    const slideElem = slidesRef.current;
    if (!slideElem) return;
    const kids = Array.from(slideElem.children) as HTMLElement[];
    kids.forEach((k, i) => {
      k.style.opacity = i === index ? "1" : "0";
      if (i === index) {
        gsap.fromTo(
          k,
          { scale: 1.06 },
          { scale: 1, duration: 7, ease: "power2.out" },
        );
      }
    });
  }, [index, slides]);

  const stats = [
    { value: "+100", label: lang === "fr" ? "Événements" : "Events" },
    { value: "83", label: lang === "fr" ? "Photos Kara" : "Kara Photos" },
    { value: "2+", label: lang === "fr" ? "Ans d'exp." : "Years exp." },
  ];

  return (
    <section
      id="hero"
      ref={root}
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden"
      data-cursor
    >
      {/* Background slides */}
      <div data-hero-bg className="absolute inset-0">
        <div ref={slidesRef} className="absolute inset-0">
          {slides.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <img
                src={src}
                alt={`Slide ${i + 1} — ${PROFILE.name}`}
                className="h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 grain-vignette" />
      </div>

      {/* Main content */}
      <div
        data-hero-content
        className="relative z-10 flex h-full flex-col justify-end px-5 pb-24 sm:px-8 sm:pb-32"
      >
        {/* Stats — top right */}
        <div
          data-hero-counter
          className="absolute right-5 top-24 z-10 hidden flex-col gap-4 sm:right-8 sm:flex"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-right">
              <div className="font-display text-2xl font-extrabold text-accent">{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-dim">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Slide dots */}
        <div className="absolute right-5 bottom-28 z-10 flex flex-col items-end gap-1.5 sm:right-8">
          {slides.map((_, i) => (
            <button
              key={i}
              id={`hero-dot-${i}`}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-500 ${
                i === index ? "h-6 w-1.5 bg-accent" : "h-1.5 w-1.5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>


        {/* Title */}
        <div className="mb-6 overflow-hidden">
          <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.4em] text-accent">
            {lang === "fr" ? "Portfolio Officiel" : "Official Portfolio"}
          </p>
          <h1 className="font-display text-[14vw] font-extrabold leading-[0.88] tracking-tight sm:text-[10vw] lg:text-[8vw]">
            <span className="block overflow-hidden" data-hero-title-line>
              <span className="block text-gradient">BOKOVI</span>
            </span>
            <span className="block overflow-hidden" data-hero-title-line>
              <span className="block">
                A.V. <span className="text-accent">ANGE</span>
              </span>
            </span>
          </h1>
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div data-hero-meta className="max-w-sm space-y-2">
            <p className="text-base font-semibold text-foreground/95">
              {lang === "fr" ? PROFILE.role : PROFILE.roleEn}
            </p>
            <p className="text-xs uppercase tracking-[0.28em] text-dim">
              {PROFILE.studio} — {PROFILE.location}
            </p>
          </div>

          {/* Play Reel button */}
          <div data-hero-meta>
            <Magnetic strength={0.4}>
              <button
                id="hero-play-reel"
                onClick={() => {
                  setPlaying((p) => !p);
                  onPlay();
                }}
                data-cursor
                className="group relative flex h-20 w-20 items-center justify-center rounded-full border border-accent/30 bg-accent/10 backdrop-blur-md transition-all duration-500 hover:bg-accent hover:border-transparent sm:h-24 sm:w-24"
              >
                {/* Pulsing ring */}
                <span className="absolute inset-0 rounded-full border border-accent/20 animate-ping" />
                {playing ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <Play size={22} className="ml-0.5 text-accent transition-colors group-hover:text-black" fill="currentColor" />
                    <span className="text-[8px] uppercase tracking-widest text-accent group-hover:text-black transition-colors">
                      Reel
                    </span>
                  </div>
                ) : (
                  <Pause size={22} className="text-accent transition-colors group-hover:text-black" />
                )}
              </button>
            </Magnetic>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          data-hero-scroll
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        >
          <span className="text-[10px] uppercase tracking-[0.35em] text-dim">
            {lang === "fr" ? "Défiler" : "Scroll"}
          </span>
          <span className="h-14 w-px animate-pulse bg-gradient-to-b from-accent/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}