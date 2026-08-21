"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Mail, ArrowUpRight, Award, Camera, Video, Sparkles, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { PROFILE, PORTRAITS } from "@/lib/content";
import Magnetic from "./Magnetic";

export default function About() {
  const root = useRef<HTMLElement>(null);
  const [portraitIndex, setPortraitIndex] = useState(0);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    const handler = (e: Event) => setLang((e as CustomEvent).detail as "fr" | "en");
    document.addEventListener("lang-change", handler);
    return () => document.removeEventListener("lang-change", handler);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%" },
          },
        );
      });

      // Stagger skills
      gsap.utils.toArray<HTMLElement>("[data-skill-pill]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.85, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.4)",
            delay: i * 0.06,
            scrollTrigger: { trigger: el, start: "top 90%" },
          },
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const nextPortrait = () => setPortraitIndex((i) => (i + 1) % PORTRAITS.length);
  const prevPortrait = () => setPortraitIndex((i) => (i - 1 + PORTRAITS.length) % PORTRAITS.length);

  const services = [
    { icon: Camera, label: lang === "fr" ? "Photographie" : "Photography" },
    { icon: Video, label: lang === "fr" ? "Vidéographie" : "Videography" },
    { icon: Sparkles, label: lang === "fr" ? "Direction artistique" : "Art Direction" },
    { icon: Award, label: lang === "fr" ? "Événementiel" : "Events" },
  ];

  return (
    <section id="about" ref={root} className="relative overflow-hidden py-28 sm:py-40">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-60 top-0 h-[500px] w-[500px] rounded-full bg-accent/4 blur-[160px]" />
      <div className="pointer-events-none absolute -right-60 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/3 blur-[140px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Official Badge Banner */}
        <div data-reveal className="mb-10 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-bold text-accent">
          <CheckCircle2 size={16} className="text-accent" />
          {lang === "fr"
            ? "Photographe & Vidéaste Officiel de Moov Africa Togo"
            : "Official Photographer & Videographer of Moov Africa Togo"}
        </div>

        {/* Section header */}
        <div className="mb-16 sm:mb-20" data-reveal>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-accent">
            {lang === "fr" ? "À propos — L'Artiste" : "About — The Artist"}
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            {lang === "fr" ? (
              <>Capturer l'instant,<br /><span className="text-stroke">sculpter la lumière</span></>
            ) : (
              <>Capturing the moment,<br /><span className="text-stroke">sculpting light</span></>
            )}
          </h2>
        </div>

        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Left — Interactive Portrait Slider (tof du vidéaste) */}
          <div className="relative" data-reveal>
            {/* Double-bezel outer shell */}
            <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.02] p-2">
              {/* Inner core */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(2rem-0.5rem)] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                {PORTRAITS.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`${PROFILE.name} - Portrait ${i + 1}`}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                      i === portraitIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                    }`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Top Badge: Moov Africa */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="glass rounded-full px-3 py-1 text-[11px] font-bold text-accent">
                    {PROFILE.studio}
                  </span>
                  <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold text-black uppercase tracking-wider">
                    Moov Africa Togo
                  </span>
                </div>

                {/* Bottom info & controls */}
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div>
                    <div className="font-display text-2xl font-extrabold">{PROFILE.name}</div>
                    <div className="mt-0.5 text-xs text-accent font-semibold">
                      {lang === "fr" ? PROFILE.role : PROFILE.roleEn}
                    </div>
                  </div>

                  {/* Slider controls */}
                  <div className="flex items-center gap-1.5 glass rounded-full p-1">
                    <button
                      onClick={prevPortrait}
                      aria-label="Portrait précédent"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-accent hover:text-black transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-1 text-[11px] font-bold text-dim">
                      {portraitIndex + 1}/{PORTRAITS.length}
                    </span>
                    <button
                      onClick={nextPortrait}
                      aria-label="Portrait suivant"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-accent hover:text-black transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail dots below */}
            <div className="mt-3 flex items-center justify-center gap-2">
              {PORTRAITS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPortraitIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === portraitIndex ? "w-8 bg-accent" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>

            {/* Floating stat card */}
            <div className="glass absolute -bottom-4 -right-4 flex items-center gap-4 rounded-2xl px-5 py-4 sm:-right-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent font-display text-lg font-extrabold text-black">
                +100
              </div>
              <div className="text-xs leading-relaxed text-dim">
                <span className="block font-semibold text-foreground">
                  {lang === "fr" ? "+100 événements" : "+100 events"}
                </span>
                {lang === "fr" ? "couverts au Togo" : "covered in Togo"}
              </div>
            </div>
          </div>

          {/* Right — Content */}
          <div className="flex flex-col justify-center">
            {/* Bio */}
            <p data-reveal className="mt-2 text-base leading-relaxed text-dim max-w-lg">
              {lang === "fr" ? PROFILE.bio : PROFILE.bioEn}
            </p>

            {/* Services grid */}
            <div data-reveal className="mt-10 grid grid-cols-2 gap-3">
              {services.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <s.icon size={18} className="shrink-0 text-accent" />
                  <span className="text-sm font-medium text-foreground/90">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div data-reveal className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-dim">
                {lang === "fr" ? "Outils & compétences" : "Tools & skills"}
              </p>
              <div className="flex flex-wrap gap-2">
                {PROFILE.skills.map((s) => (
                  <div
                    key={s.name}
                    data-skill-pill
                    className="glass rounded-full px-4 py-1.5 text-xs font-medium text-foreground/85"
                  >
                    {s.name}
                    <span className="ml-1.5 text-accent opacity-80">· {s.level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div data-reveal className="mt-8 space-y-4">
              {PROFILE.experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-accent/40 pl-4">
                  <p className="text-sm font-bold text-foreground">
                    {lang === "fr" ? exp.role : (exp.roleEn || exp.role)}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-accent">{exp.period}</p>
                  <p className="mt-1 text-xs leading-relaxed text-dim">{exp.detail}</p>
                </div>
              ))}
            </div>

            {/* Contact info */}
            <div data-reveal className="mt-8 space-y-3 text-sm text-dim">
              <div className="flex items-center gap-3">
                <MapPin size={15} className="shrink-0 text-accent" />
                {PROFILE.location} — {PROFILE.studio}
              </div>
              <a
                href={`https://wa.me/${PROFILE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-colors hover:text-accent"
              >
                <Phone size={15} className="shrink-0 text-accent" />
                {PROFILE.phone}
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  WhatsApp
                </span>
              </a>
              <a
                href={`mailto:${PROFILE.email}`}
                className="flex items-center gap-3 transition-colors hover:text-accent"
              >
                <Mail size={15} className="shrink-0 text-accent" />
                {PROFILE.email}
              </a>
            </div>

            {/* CTA */}
            <div data-reveal className="mt-10">
              <Magnetic>
                <a
                  id="about-cta"
                  href={`mailto:${PROFILE.email}?subject=${lang === "fr" ? "Projet%20photo%20%2F%20vid%C3%A9o" : "Photo%20%2F%20Video%20Project"}`}
                  className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-black transition-all duration-500 hover:shadow-[0_0_40px_-8px_rgba(212,243,74,0.6)]"
                >
                  {lang === "fr" ? "Démarrer un projet" : "Start a project"}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={14} />
                  </span>
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}