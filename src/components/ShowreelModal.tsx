"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, Pause, Images, Film } from "lucide-react";
import { KARA_GALLERY } from "@/lib/kara-gallery";

type Mode = "video" | "photos";

export default function ShowreelModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return <ModalContent onClose={onClose} />;
}

function ModalContent({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("video");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [kenburns, setKenburns] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && mode === "photos")
        setIndex((i) => (i + 1) % KARA_GALLERY.length);
      if (e.key === "ArrowLeft" && mode === "photos")
        setIndex((i) => (i - 1 + KARA_GALLERY.length) % KARA_GALLERY.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const next = useCallback(() => setIndex((i) => (i + 1) % KARA_GALLERY.length), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + KARA_GALLERY.length) % KARA_GALLERY.length),
    [],
  );

  useEffect(() => {
    if (!playing || mode !== "photos") return;
    timerRef.current = window.setTimeout(next, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, mode, index, next]);

  const src = KARA_GALLERY[index];

  return (
    <div
      className="fixed inset-0 z-[95] flex flex-col bg-black/95 backdrop-blur-xl"
      data-cursor-hide
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="font-display text-sm uppercase tracking-[0.3em] text-dim">
          Showreel — BOKOVI
        </div>
        <div className="flex items-center gap-2">
          <div className="glass mr-2 flex rounded-full p-1">
            <button
              onClick={() => setMode("video")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                mode === "video" ? "bg-accent text-black" : "text-dim"
              }`}
            >
              <Film size={12} /> Vidéo
            </button>
            <button
              onClick={() => setMode("photos")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                mode === "photos" ? "bg-accent text-black" : "text-dim"
              }`}
            >
              <Images size={12} /> Photos
            </button>
          </div>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground transition-colors hover:border-accent/50"
            aria-label={playing ? "Pause" : "Lecture"}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground transition-colors hover:border-accent/50"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4">
        {mode === "photos" && (
          <button
            onClick={prev}
            className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full glass text-foreground transition-all hover:scale-110 hover:bg-accent hover:text-black"
            aria-label="Précédent"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {mode === "video" ? (
          <div className="relative h-full max-h-[78vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-black">
            <video
              src="/media/video/showreel.mp4"
              poster={KARA_GALLERY[2]}
              controls
              autoPlay
              loop
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div
            key={src}
            className="relative h-full max-h-[78vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10"
          >
            <img
              src={src}
              alt="Showreel — photos"
              className="h-full w-full object-contain"
              style={{
                animation: kenburns ? "kenburns 9s ease-out forwards" : undefined,
              }}
            />
          </div>
        )}

        {mode === "photos" && (
          <button
            onClick={next}
            className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full glass text-foreground transition-all hover:scale-110 hover:bg-accent hover:text-black"
            aria-label="Suivant"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm text-accent">
            {mode === "video" ? (
              "Film — Miss Togo Régionale Kara"
            ) : (
              <>
                {String(index + 1).padStart(2, "0")}
                <span className="text-dim">
                  {" "}
                  / {String(KARA_GALLERY.length).padStart(2, "0")}
                </span>
              </>
            )}
          </span>
          {mode === "photos" && (
            <div className="flex gap-1.5">
              {KARA_GALLERY.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === index ? "w-6 bg-accent" : "w-1 bg-white/25"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}