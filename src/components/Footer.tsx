"use client";

import { useEffect, useState } from "react";
import { PROFILE } from "@/lib/content";
import { ArrowUpRight, Heart } from "lucide-react";

export default function Footer() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const year = new Date().getFullYear();

  useEffect(() => {
    const handler = (e: Event) => setLang((e as CustomEvent).detail as "fr" | "en");
    document.addEventListener("lang-change", handler);
    return () => document.removeEventListener("lang-change", handler);
  }, []);

  const links = {
    fr: [
      { label: "Accueil", target: "hero" },
      { label: "À propos", target: "about" },
      { label: "Travaux", target: "works" },
      { label: "Services", target: "services" },
      { label: "Contact", target: "contact" },
    ],
    en: [
      { label: "Home", target: "hero" },
      { label: "About", target: "about" },
      { label: "Works", target: "works" },
      { label: "Services", target: "services" },
      { label: "Contact", target: "contact" },
    ],
  };

  const scrollTo = (target: string) => {
    if (target === "hero") window.scrollTo({ top: 0, behavior: "smooth" });
    else document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/5 bg-black/60 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <button
              onClick={() => scrollTo("hero")}
              className="font-display text-2xl font-extrabold tracking-tight"
            >
              BOKOVI<span className="text-accent">.</span>
            </button>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-dim">
              {lang === "fr" ? PROFILE.role : PROFILE.roleEn} · {PROFILE.studio}
            </p>
            <p className="mt-1 text-xs text-dim">{PROFILE.location}</p>

            <div className="mt-5 flex gap-3">
              <a
                href={`https://wa.me/${PROFILE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                id="footer-whatsapp"
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-dim transition-colors hover:border-accent hover:text-accent"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:${PROFILE.email}`}
                id="footer-email"
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-dim transition-colors hover:border-accent hover:text-accent"
              >
                Email
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-dim">
              {lang === "fr" ? "Navigation" : "Navigation"}
            </p>
            <ul className="space-y-2">
              {links[lang].map((l) => (
                <li key={l.target}>
                  <button
                    id={`footer-nav-${l.target}`}
                    onClick={() => scrollTo(l.target)}
                    className="text-sm text-dim transition-colors hover:text-accent"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-dim">
              Contact
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:${PROFILE.email}`}
                  id="footer-contact-email"
                  className="text-sm text-dim transition-colors hover:text-accent"
                >
                  {PROFILE.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${PROFILE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="footer-contact-phone"
                  className="text-sm text-dim transition-colors hover:text-accent"
                >
                  {PROFILE.phone}
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  id="footer-dashboard"
                  className="flex items-center gap-1 text-xs text-dim/50 transition-colors hover:text-dim"
                >
                  Dashboard Pro
                  <ArrowUpRight size={11} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-dim">
            © {year} {PROFILE.name} — {PROFILE.studio}.{" "}
            {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-dim">
            {lang === "fr" ? "Fait avec" : "Made with"}
            <Heart size={11} className="text-accent" fill="currentColor" />
            {lang === "fr" ? "à Lomé, Togo" : "in Lomé, Togo"}
          </p>
        </div>
      </div>
    </footer>
  );
}