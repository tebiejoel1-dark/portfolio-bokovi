"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Clapperboard, X, ChevronLeft, ChevronRight, Plus, Heart } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { getEvents } from "@/lib/store";
import type { EventItem } from "@/lib/types";

type Filter = "all" | "photo" | "video";

const CATEGORIES = [
  "all",
  "Miss Togo",
  "Mode",
  "Portrait",
  "Mariage",
  "Corporate",
  "Concert",
  "Sport",
  "Musique",
] as const;

const LABELS: Record<string, { fr: string; en: string }> = {
  all: { fr: "Tout", en: "All" },
  "Miss Togo": { fr: "Miss Togo", en: "Miss Togo" },
  Mode: { fr: "Mode", en: "Fashion" },
  Portrait: { fr: "Portrait", en: "Portrait" },
  Mariage: { fr: "Mariage", en: "Wedding" },
  Corporate: { fr: "Corporate", en: "Corporate" },
  Concert: { fr: "Concert", en: "Concert" },
  Sport: { fr: "Sport", en: "Sport" },
  Musique: { fr: "Musique", en: "Music" },
};

export default function Works() {
  const root = useRef<HTMLElement>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [mediaFilter, setMediaFilter] = useState<Filter>("all");
  const [active, setActive] = useState<EventItem | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    const handler = (e: Event) => setLang((e as CustomEvent).detail as "fr" | "en");
    document.addEventListener("lang-change", handler);
    return () => document.removeEventListener("lang-change", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getEvents().then((list) => {
      if (!cancelled) setEvents(list);
    });

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-work-card]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 60, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: (i % 3) * 0.12,
            scrollTrigger: { trigger: el, start: "top 88%" },
          },
        );
      });
    }, root);
    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);



  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  const filtered = useMemo(() => {
    let list = events;
    if (filter !== "all") {
      list = list.filter((e) => e.category === filter);
    }
    if (mediaFilter === "video") {
      list = list.filter((e) => e.media.some((m) => m.kind === "video"));
    } else if (mediaFilter === "photo") {
      list = list.filter((e) => e.media.some((m) => m.kind === "photo"));
    }
    return list;
  }, [events, filter, mediaFilter]);

  const openLightbox = (e: EventItem) => {
    setActive(e);
    setMediaIndex(0);
  };

  const media = active?.media ?? [];
  const currentMedia = media[mediaIndex];

  // Keyboard nav in lightbox
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setMediaIndex((i) => (i + 1) % media.length);
      if (e.key === "ArrowLeft") setMediaIndex((i) => (i - 1 + media.length) % media.length);
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, media.length]);

  return (
    <section id="works" ref={root} className="relative py-28 sm:py-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-14">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-accent">
            {lang === "fr" ? "Œuvres" : "Works"}
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              {lang === "fr" ? (
                <>Galerie des <span className="text-stroke">événements</span></>
              ) : (
                <>Events <span className="text-stroke">gallery</span></>
              )}
            </h2>
            <p className="text-sm text-dim max-w-xs">
              {events.length} {lang === "fr" ? "projets réalisés" : "projects completed"}
            </p>
          </div>
        </div>

        {/* Filters row */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const exists = cat === "all" || events.some((e) => e.category === cat);
              if (!exists) return null;
              return (
                <button
                  key={cat}
                  id={`filter-cat-${cat}`}
                  onClick={() => setFilter(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
                    filter === cat
                      ? "bg-accent text-black"
                      : "glass text-dim hover:text-foreground"
                  }`}
                >
                  {LABELS[cat]?.[lang] ?? cat}
                </button>
              );
            })}
          </div>

          {/* Media type filter */}
          <div className="glass flex rounded-full p-1.5 self-start sm:self-auto">
            {(["all", "photo", "video"] as const).map((f) => (
              <button
                key={f}
                id={`filter-media-${f}`}
                onClick={() => setMediaFilter(f)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
                  mediaFilter === f ? "bg-accent text-black" : "text-dim hover:text-foreground"
                }`}
              >
                {f === "photo" && <Camera size={13} />}
                {f === "video" && <Clapperboard size={13} />}
                {f === "all" && (lang === "fr" ? "Tout" : "All")}
                {f === "photo" && (lang === "fr" ? "Photo" : "Photo")}
                {f === "video" && (lang === "fr" ? "Vidéo" : "Video")}
              </button>
            ))}
          </div>
        </div>

        {/* Grid — Asymmetric bento layout */}
        {filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-dim">
            {lang === "fr" ? "Aucun résultat" : "No results"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
            {filtered.map((event, i) => {
              // Vary card sizes for bento grid
              const isWide = i % 5 === 0;
              const isTall = i % 7 === 3;
              const colSpan = isWide ? "lg:col-span-8" : "lg:col-span-4";
              const aspect = isWide ? "aspect-[16/9]" : isTall ? "aspect-[3/4]" : "aspect-[4/3]";

              return (
                <button
                  key={event.id}
                  data-work-card
                  id={`work-card-${event.id}`}
                  onClick={() => openLightbox(event)}
                  className={`media-card group text-left hover-halo ${colSpan} ${aspect}`}
                >
                  <div className="relative h-full w-full">
                    <img
                      src={event.cover}
                      alt={event.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                    />
                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                    {/* Featured badge */}
                    {event.featured && (
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-black">
                        <Heart size={9} fill="currentColor" />
                        {lang === "fr" ? "À la une" : "Featured"}
                      </div>
                    )}

                    {/* Info */}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
                      <div>
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-accent/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                            {event.category}
                          </span>
                          {event.media.some((m) => m.kind === "video") && (
                            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-md">
                              <Clapperboard size={9} />
                              {lang === "fr" ? "Vidéo" : "Video"}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-bold text-foreground leading-tight sm:text-xl">
                          {event.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-dim">
                          {event.location} · {event.date} · {event.media.length} {lang === "fr" ? "médias" : "media"}
                        </p>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full glass opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        <Plus size={15} className="rotate-45" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {active && currentMedia && (
        <div
          className="fixed inset-0 z-[96] flex flex-col bg-black/97 backdrop-blur-2xl"
          data-cursor-hide
          onClick={(e) => { if (e.target === e.currentTarget) setActive(null); }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <div className="font-display text-base font-bold sm:text-lg">{active.title}</div>
              <div className="text-xs text-dim">{active.category} · {active.location} · {active.date}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-dim">{mediaIndex + 1} / {media.length}</span>
              <button
                id="lightbox-close"
                onClick={() => setActive(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-foreground transition-colors hover:border-red-500/50 hover:text-red-400"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Media viewer */}
          <div className="relative flex flex-1 items-center justify-center px-4 py-4">
            {media.length > 1 && (
              <button
                id="lightbox-prev"
                onClick={() => setMediaIndex((i) => (i - 1 + media.length) % media.length)}
                className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full glass text-foreground transition-all hover:scale-110 hover:bg-accent hover:text-black sm:left-4 sm:h-12 sm:w-12"
                aria-label={lang === "fr" ? "Précédent" : "Previous"}
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div className="relative h-full max-h-[70vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/8 bg-black">
              {currentMedia.kind === "video" ? (
                <video
                  src={currentMedia.src}
                  poster={currentMedia.poster}
                  controls
                  autoPlay
                  loop
                  className="h-full w-full object-contain"
                />
              ) : (
                <img
                  src={currentMedia.src}
                  alt={currentMedia.caption || active.title}
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            {media.length > 1 && (
              <button
                id="lightbox-next"
                onClick={() => setMediaIndex((i) => (i + 1) % media.length)}
                className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full glass text-foreground transition-all hover:scale-110 hover:bg-accent hover:text-black sm:right-4 sm:h-12 sm:w-12"
                aria-label={lang === "fr" ? "Suivant" : "Next"}
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-white/5 px-5 py-4">
            {active.description && (
              <p className="mx-auto mb-3 max-w-3xl text-center text-sm text-dim">{active.description}</p>
            )}
            {/* Thumbnail strip */}
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1">
              {media.map((m, i) => (
                <button
                  key={m.id}
                  id={`lightbox-thumb-${i}`}
                  onClick={() => setMediaIndex(i)}
                  className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                    i === mediaIndex ? "border-accent opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                  }`}
                >
                  {m.kind === "video" ? (
                    <div className="flex h-full items-center justify-center bg-white/5">
                      <Clapperboard size={14} className="text-dim" />
                    </div>
                  ) : (
                    <img src={m.src} alt={`Miniature ${i + 1}`} className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}