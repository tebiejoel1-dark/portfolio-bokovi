"use client";

import { useEffect, useRef, useState } from "react";

export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const leave = () => {
      el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "translate(0, 0)";
      setTimeout(() => {
        el.style.transition = "";
      }, 600);
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [strength]);

  return ref;
}

export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useMagnetic<HTMLDivElement>(strength);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}