"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { HERO_SLIDES } from "@/lib/content";

const COLS = 4;
const ROWS = 3;

function Cell({
  index,
  cols,
  rows,
  base,
  target,
}: {
  index: number;
  cols: number;
  rows: number;
  base: string;
  target: string;
}) {
  const col = index % cols;
  const row = Math.floor(index / cols);
  const xPct = (col / (cols - 1)) * 100;
  const yPct = (row / (rows - 1)) * 100;

  return (
    <div
      data-cell
      data-index={index}
      className="relative h-full w-full"
      style={{ perspective: 1200 }}
    >
      <div
        data-cell-face
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${base})`,
          backgroundSize: `${cols * 100}% ${rows * 100}%`,
          backgroundPosition: `${xPct}% ${yPct}%`,
          transformStyle: "preserve-3d",
        }}
      />
      <div
        data-cell-target
        className="absolute inset-0 opacity-0"
        style={{
          backgroundImage: `url(${target})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}

export default function Deconstruction() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cells = gsap.utils.toArray<HTMLElement>("[data-cell]");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      tl.fromTo(
        "[data-title-decon]",
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1 },
      )
        .fromTo(
          "[data-title-recomp]",
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1 },
          2.2,
        )
        .to(
          "[data-title-decon]",
          { opacity: 0, y: -60, duration: 1 },
          2.2,
        )
        .fromTo(
          "[data-intro]",
          { opacity: 0 },
          { opacity: 1, duration: 1 },
          0.6,
        )
        .to("[data-intro]", { opacity: 0, duration: 0.8 }, 1.8);

      cells.forEach((cell, i) => {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const dirX = col < COLS / 2 ? -1 : 1;
        const dirY = row < ROWS / 2 ? -1 : 1;

        tl.fromTo(
          cell.querySelector("[data-cell-face]"),
          { xPercent: 0, yPercent: 0, rotateX: 0, rotateY: 0, scale: 1, z: 0 },
          {
            xPercent: (col - (COLS - 1) / 2) * 34 * dirX,
            yPercent: (row - (ROWS - 1) / 2) * 30 * dirY,
            rotateX: gsap.utils.random(-30, 30),
            rotateY: gsap.utils.random(-40, 40),
            rotateZ: gsap.utils.random(-14, 14),
            z: gsap.utils.random(-260, 60),
            scale: 0.7,
            opacity: 0.55,
            duration: 1.4,
            ease: "power3.in",
          },
          1,
        );

        tl.to(
          cell.querySelector("[data-cell-face]"),
          {
            xPercent: 0,
            yPercent: 0,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            z: 0,
            scale: 1,
            opacity: 1,
            duration: 1.6,
            ease: "expo.out",
          },
          3.4,
        );

        tl.to(
          cell.querySelector("[data-cell-target]"),
          { opacity: 1, duration: 0.4 },
          3.7 + i * 0.02,
        );

        tl.fromTo(
          cell,
          { borderRadius: 0 },
          { borderRadius: 18, duration: 1.2 },
          3.2,
        );
        tl.fromTo(
          cell,
          { boxShadow: "0 0 0 rgba(0,0,0,0)" },
          { boxShadow: "0 24px 60px -20px rgba(0,0,0,0.8)", duration: 1.2 },
          3.4,
        );
      });

      tl.to(
        "[data-cell]",
        {
          scale: 0.86,
          duration: 1,
          ease: "power2.in",
        },
        4.8,
      );
      tl.to(
        "[data-recomp-meta]",
        { opacity: 1, y: 0, duration: 0.8 },
        5.2,
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="deconstruction"
      ref={sectionRef}
      className="relative"
      style={{ height: "420vh" }}
    >
      <div
        ref={viewportRef}
        className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
          <h2
            data-title-decon
            className="font-display text-4xl font-extrabold uppercase tracking-tight text-foreground drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)] sm:text-7xl"
          >
            Déconstruction
          </h2>
          <h2
            data-title-recomp
            className="font-display text-4xl font-extrabold uppercase tracking-tight text-accent opacity-0 drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)] sm:text-7xl"
          >
            Recomposition
          </h2>
        </div>

        <div
          data-intro
          className="pointer-events-none absolute bottom-8 left-1/2 z-20 w-full max-w-xl -translate-x-1/2 px-6 text-center text-sm text-foreground/80 opacity-0"
        >
          Un même instant, éclaté en fragments, puis recomposé en une
          galerie. L’image vit dans l’espace — continue de défiler.
        </div>

        <div
          className="absolute inset-0 grid gap-1.5 p-3 sm:gap-3 sm:p-8"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          }}
        >
          {Array.from({ length: COLS * ROWS }, (_, i) => (
            <Cell
              key={i}
              index={i}
              cols={COLS}
              rows={ROWS}
              base={HERO_SLIDES[2]}
              target={HERO_SLIDES[(i * 3 + 5) % HERO_SLIDES.length]}
            />
          ))}
        </div>

        <div
          data-recomp-meta
          className="absolute bottom-8 left-1/2 z-20 w-full max-w-xl -translate-x-1/2 px-6 text-center text-sm uppercase tracking-[0.25em] text-dim opacity-0"
        >
          Galerie recomposée — continuez pour explorer les œuvres
        </div>
      </div>
    </section>
  );
}