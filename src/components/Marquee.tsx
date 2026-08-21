"use client";

export default function Marquee() {
  const items = [
    "Photographie",
    "Videography",
    "Événementiel",
    "Studio Shooting",
    "Direction Artistique",
    "Color Grading",
    "Branding",
    "Licht-Frame Studio",
    "Lomé · Togo",
  ];
  const row = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-white/[0.05] bg-surface py-5 sm:py-6">
      {/* Left fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-surface to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-surface to-transparent" />

      <div
        className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap"
      >
        {row.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-10 font-display text-xl font-extrabold uppercase tracking-widest text-foreground/[0.15] sm:text-2xl"
          >
            {item}
            <span className="text-accent/60 text-lg">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}