"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { PROFILE } from "@/lib/content";
import { saveQuote } from "@/lib/store";
import Magnetic from "./Magnetic";

function InstagramIcon({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.22V8.25a6.34 6.34 0 0 0-5.11 6.19A6.34 6.34 0 0 0 10.7 20.8a6.34 6.34 0 0 0 6.34-6.34V9.3a8.16 8.16 0 0 0 4.77 1.52V7.37a4.85 4.85 0 0 1-2.22-.68z" />
    </svg>
  );
}

function YoutubeIcon({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
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
    }, root);
    return () => ctx.revert();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setSending(true);

    // Save to backend
    try {
      await saveQuote({
        name: form.name,
        email: form.email,
        message: form.message,
        type: "contact",
        location: "",
        services: [],
        budget: 0,
      });
    } catch {
      // ignore
    }

    // Open mail client
    window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
      lang === "fr" ? `Message de ${form.name}` : `Message from ${form.name}`,
    )}&body=${encodeURIComponent(form.message)}`;

    setSent(true);
    setSending(false);
  };

  const contacts = [
    {
      icon: MessageCircle,
      label: lang === "fr" ? "WhatsApp" : "WhatsApp",
      value: PROFILE.phone,
      href: `https://wa.me/${PROFILE.whatsapp}`,
      badge: "WhatsApp",
    },
    {
      icon: Phone,
      label: lang === "fr" ? "Téléphone" : "Phone",
      value: PROFILE.phone,
      href: `tel:${PROFILE.phone.replace(/\s/g, "")}`,
    },
    {
      icon: Mail,
      label: "Email",
      value: PROFILE.email,
      href: `mailto:${PROFILE.email}`,
    },
    {
      icon: MapPin,
      label: lang === "fr" ? "Studio" : "Studio",
      value: `${PROFILE.studio} — ${PROFILE.location}`,
      href: undefined,
    },
  ];

  return (
    <section id="contact" ref={root} className="relative overflow-hidden py-28 sm:py-40">
      {/* Ambient */}
      <div className="pointer-events-none absolute -right-60 top-20 h-[500px] w-[500px] rounded-full bg-accent/4 blur-[180px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Left */}
          <div>
            <p data-reveal className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-accent">
              Contact
            </p>
            <h2
              data-reveal
              className="font-display text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl"
            >
              {lang === "fr" ? (
                <>Donnons vie à<br /><span className="text-gradient">ton projet</span></>
              ) : (
                <>Let's bring your<br /><span className="text-gradient">vision to life</span></>
              )}
            </h2>
            <p data-reveal className="mt-6 max-w-md text-base leading-relaxed text-dim">
              {lang === "fr"
                ? "Un mariage, un concert, une campagne, un clip ? Discutons de ton image et de ta vision."
                : "A wedding, concert, campaign, music video? Let's talk about your image and vision."}
            </p>

            {/* Contact list */}
            <div data-reveal className="mt-10 space-y-4">
              {contacts.map((c) => (
                <a
                  key={c.label}
                  id={`contact-${c.label.toLowerCase().replace(/\s/g, "-")}`}
                  href={c.href}
                  target={c.href?.startsWith("https") ? "_blank" : undefined}
                  rel={c.href?.startsWith("https") ? "noopener noreferrer" : undefined}
                  className={`group flex items-center gap-4 ${c.href ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full glass text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-black">
                    <c.icon size={17} />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-widest text-dim">{c.label}</span>
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      {c.value}
                      {c.badge && (
                        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                          {c.badge}
                        </span>
                      )}
                    </span>
                  </span>
                </a>
              ))}
            </div>

            {/* Socials */}
            <div data-reveal className="mt-10 flex flex-wrap gap-3">
              {[
                {
                  id: "contact-facebook",
                  label: "Facebook",
                  Icon: FacebookIcon,
                  href: PROFILE.facebook,
                },
                {
                  id: "contact-tiktok",
                  label: "TikTok",
                  Icon: TikTokIcon,
                  href: PROFILE.tiktok,
                },
              ].map((s) => (
                <Magnetic key={s.label}>
                  <a
                    id={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-dim transition-all duration-300 hover:border-accent hover:text-accent"
                  >
                    <s.Icon size={17} />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <form
            onSubmit={submit}
            data-reveal
            className="glass-strong flex flex-col gap-4 rounded-3xl p-6 sm:p-10"
          >
            <h3 className="font-display text-xl font-bold">
              {lang === "fr" ? "Envoyer un message" : "Send a message"}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-dim">
                  {lang === "fr" ? "Nom" : "Name"} *
                </label>
                <input
                  id="contact-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={lang === "fr" ? "Ton nom" : "Your name"}
                  className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-dim">
                  Email *
                </label>
                <input
                  id="contact-email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  type="email"
                  placeholder={lang === "fr" ? "Ton email" : "Your email"}
                  className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-dim">
                {lang === "fr" ? "Message" : "Message"}
              </label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                placeholder={
                  lang === "fr"
                    ? "Décris ton projet, tes dates, ton lieu…"
                    : "Describe your project, dates, location…"
                }
                className="resize-none rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>

            <button
              id="contact-submit"
              type="submit"
              disabled={sent || sending}
              className="group flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-sm font-bold text-black transition-all hover:shadow-[0_0_30px_-4px_rgba(212,243,74,0.5)] disabled:opacity-60"
            >
              {sent
                ? (lang === "fr" ? "✓ Message envoyé !" : "✓ Message sent!")
                : sending
                ? "..."
                : (lang === "fr" ? "Envoyer le message" : "Send message")}
              {!sent && !sending && (
                <Send size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              )}
            </button>

            <p className="text-center text-xs text-dim">
              {lang === "fr"
                ? "Réponse sous 24–48h · Discrétion garantie"
                : "Reply within 24–48h · Full discretion guaranteed"}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}