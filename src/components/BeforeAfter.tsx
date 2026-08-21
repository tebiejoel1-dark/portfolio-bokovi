"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { HERO_SLIDES } from "@/lib/content";

const SOURCE = HERO_SLIDES[5];

export default function BeforeAfter() {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-ba-title]", {
        opacity: 0,
        y: 60,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.from("[data-ba-frame]", {
        opacity: 0,
        y: 80,
        scale: 0.96,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 60%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const update = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, p)));
  };

  return (
    <section
      id="grading"
      ref={root}
      className="relative overflow-hidden bg-surface py-28 sm:py-36"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-accent/5 blur-[140px]" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-12 text-center">
          <p data-ba-title className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-accent">
            Étalonnage
          </p>
          <h2
            data-ba-title
            className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            LOG brut <span className="text-accent">vs</span> étalonnage final
          </h2>
          <p data-ba-title className="mx-auto mt-4 max-w-xl text-sm text-dim">
            Fais glisser le curseur pour révéler la magie de la
            post-production : de l’image LOG caméra à la color grade finale.
          </p>
        </div>

        <div
          data-ba-frame
          ref={trackRef}
          className="relative aspect-[16/10] w-full touch-none select-none overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
          data-cursor
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            update(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && update(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerLeave={() => (dragging.current = false)}
        >
          <img
            src={SOURCE}
            alt="Étalonnage final"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          >
            <img
              src={SOURCE}
              alt="Log brut"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                filter:
                  "saturate(0.45) contrast(0.75) brightness(1.15) hue-rotate(-8deg)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
              LOG brut
            </div>
          </div>

          <div
            className="absolute inset-y-0 z-10 w-0.5 bg-accent shadow-[0_0_20px_rgba(212,243,74,0.8)]"
            style={{ left: `${pos}%` }}
          >
            <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-black shadow-[0_0_30px_rgba(212,243,74,0.6)]">
              <ChevronsLeftRight size={20} />
            </div>
          </div>

          <div className="absolute right-4 top-4 rounded-full bg-accent/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black backdrop-blur-md">
            Grade final
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] text-foreground/80 backdrop-blur-md">
            ← Glisse →&nbsp;&nbsp;{Math.round(pos)}%
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-dim">
          <span className="glass rounded-full px-4 py-2">Saturation &amp; contraste sculptés</span>
          <span className="glass rounded-full px-4 py-2">Balance des blancs affinée</span>
          <span className="glass rounded-full px-4 py-2">Sélectif : peau / lumière de scène</span>
        </div>
      </div>
    </section>
  );
}