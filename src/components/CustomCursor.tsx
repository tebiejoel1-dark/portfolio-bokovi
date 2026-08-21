"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const raf = requestAnimationFrame(() => setEnabled(true));
    document.body.classList.add("cursor-none");

    const xTo = gsap.quickTo(dotRef.current, "x", { duration: 0.08, ease: "power2.out" });
    const yTo = gsap.quickTo(dotRef.current, "y", { duration: 0.08, ease: "power2.out" });
    const rxTo = gsap.quickTo(ringRef.current, "x", { duration: 0.45, ease: "power3.out" });
    const ryTo = gsap.quickTo(ringRef.current, "y", { duration: 0.45, ease: "power3.out" });

    const move = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      rxTo(e.clientX);
      ryTo(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setHovered(
        target.closest("a, button, [data-cursor]") !== null &&
          !target.closest("input, textarea, select"),
      );
      setHidden(target.closest("[data-cursor-hide]") !== null);
    };

    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => gsap.set([dotRef.current, ringRef.current], { opacity: 0 });

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("cursor-none");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
      <div
        ref={ringRef}
        className={`absolute -ml-6 -mt-6 h-12 w-12 rounded-full border transition-[background-color,border-color,opacity,scale] duration-300 ${
          hovered
            ? "scale-125 border-accent bg-accent/15"
            : "border-white/40"
        } ${pressed ? "scale-90" : ""} ${hidden ? "opacity-0" : ""}`}
      />
      <div
        ref={dotRef}
        className={`absolute -ml-1 -mt-1 h-2 w-2 rounded-full bg-accent transition-opacity duration-300 ${
          hidden ? "opacity-0" : ""
        }`}
      />
    </div>
  );
}