"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const counterEl = root.current?.querySelector("[data-counter]");
      const tl = gsap.timeline({
        onComplete: () => setDone(true),
      });

      tl.to(counter, {
        v: 100,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterEl)
            counterEl.textContent = String(Math.round(counter.v)).padStart(3, "0");
        },
      })
        .to("[data-name]", { yPercent: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 0.1)
        .to("[data-bar]", { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0.1)
        .to("[data-preloader-inner]", {
          yPercent: -100,
          duration: 0.9,
          ease: "power4.inOut",
          delay: 0.15,
        })
        .set(root.current, { display: "none" })
        .add(() => window.dispatchEvent(new Event("bk:ready")));
    }, root);
    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]"
    >
      <div
        data-preloader-inner
        className="flex w-full flex-col items-center justify-center gap-6 px-6"
      >
        <div
          data-name
          className="translate-y-8 font-display text-4xl font-bold tracking-tight text-foreground opacity-0 sm:text-6xl"
        >
          BOKOVI<span className="text-accent">.</span>
        </div>
        <div className="text-xs uppercase tracking-[0.4em] text-dim">
          Photographe &amp; Vidéaste
        </div>
        <div className="h-px w-56 overflow-hidden bg-white/10">
          <div data-bar className="h-full w-full origin-left scale-x-0 bg-accent" />
        </div>
        <div data-counter className="font-display text-sm text-accent">
          000
        </div>
      </div>
    </div>
  );
}