"use client";

import { useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  ArrowUpDown,
  Star,
  Upload,
  Save,
  X,
  Clapperboard,
} from "lucide-react";
import {
  saveEvent,
  deleteEvent,
  createEventId,
  mediaToEventMedia,
  getCustomMedia,
  saveCustomMedia,
  removeCustomMedia,
} from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import type { EventItem, EventMedia, Category } from "@/lib/types";

export default function EventManager({
  events,
  bump,
}: {
  events: EventItem[];
  bump: () => void;
}) {
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold">Gestion des événements</h3>
          <p className="text-sm text-dim">
            Crée un événement, ajoute photos & vidéos : tout est publié
            directement sur le site.
          </p>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setEditing({
              id: createEventId(),
              title: "Nouvel événement",
              category: CATEGORIES[0],
              location: "Lomé, Togo",
              date: new Date().getFullYear().toString(),
              description: "",
              cover: "",
              media: [],
            });
          }}
          className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
        >
          <Plus size={16} /> Nouvel événement
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {events.map((event) => (
          <div key={event.id} className="glass-strong overflow-hidden rounded-3xl">
            <div className="relative h-40">
              <img
                src={event.cover}
                alt={event.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                  {event.category}
                </span>
                {event.featured && (
                  <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-md">
                    <Star size={10} className="text-accent" /> Vedette
                  </span>
                )}
              </div>
              <div className="absolute right-3 top-3 flex gap-2">
                <ToggleFeatured
                  event={event}
                  bump={bump}
                />
                <button
                  onClick={() => {
                    setEditing(event);
                    setCreating(false);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full glass text-foreground transition-transform hover:scale-110"
                  aria-label="Modifier"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Supprimer « ${event.title} » ?`)) {
                      deleteEvent(event.id).then(bump);
                    }
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full glass text-foreground transition-colors hover:bg-red-500/80"
                  aria-label="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-5">
              <h4 className="font-display text-lg font-bold">{event.title}</h4>
              <p className="text-xs text-dim">
                {event.location} · {event.date} · {event.media.length} médias (
                {event.media.filter((m) => m.kind === "photo").length} photos ·{" "}
                {event.media.filter((m) => m.kind === "video").length} vidéos)
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-dim/80">
                {event.description || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EventEditor
          event={editing}
          creating={creating}
          onClose={() => setEditing(null)}
          onSave={() => {
            setEditing(null);
            bump();
          }}
          bump={bump}
        />
      )}
    </div>
  );
}

function ToggleFeatured({ event, bump }: { event: EventItem; bump: () => void }) {
  return (
    <button
      onClick={() => {
        saveEvent({ ...event, featured: !event.featured }).then(bump);
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-full glass transition-colors ${
        event.featured ? "text-accent" : "text-foreground hover:text-accent"
      }`}
      aria-label={event.featured ? "Retirer des vedettes" : "Mettre en vedette"}
    >
      <Star size={14} />
    </button>
  );
}

function EventEditor({
  event,
  creating,
  onClose,
  onSave,
  bump,
}: {
  event: EventItem;
  creating: boolean;
  onClose: () => void;
  onSave: () => void;
  bump: () => void;
}) {
  const [draft, setDraft] = useState<EventItem>(event);
  const [uploads, setUploads] = useState<{ pending: EventMedia[]; error: string }>({
    pending: [],
    error: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const custom = getCustomMedia();

  const set = (patch: Partial<EventItem>) => setDraft((d) => ({ ...d, ...patch }));

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const pending: EventMedia[] = [];
    for (const file of Array.from(files)) {
      const limit = file.type.startsWith("video") ? 8 : 6;
      if (file.size > limit * 1024 * 1024) {
        setUploads((u) => ({
          ...u,
          error: `« ${file.name} » dépasse ${limit} Mo. Compresse-le avant l'ajout (astuce : réduire à 1600px).`,
        }));
        continue;
      }
      try {
        const media = await mediaToEventMedia(file);
        pending.push(media);
        const saved = saveCustomMedia(media.id, {
          dataUrl: media.src,
          kind: media.kind,
          name: media.caption || "Média",
        });
        if (!saved) {
          setUploads((u) => ({
            ...u,
            error:
              "Stockage du navigateur saturé : supprime d'anciens médias pour ajouter celui-ci.",
          }));
          pending.pop();
        }
      } catch {
        setUploads((u) => ({ ...u, error: "Fichier illisible, réessaie." }));
      }
    }
    setUploads((u) => ({ ...u, pending: [...u.pending, ...pending] }));
    bump();
  };

  const addUploads = () => {
    setDraft((d) => ({ ...d, media: [...d.media, ...uploads.pending] }));
    setUploads({ pending: [], error: "" });
  };

  const removeMedia = (id: string) => {
    setDraft((d) => ({ ...d, media: d.media.filter((m) => m.id !== id) }));
  };

  const moveMedia = (id: string, dir: -1 | 1) => {
    setDraft((d) => {
      const idx = d.media.findIndex((m) => m.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= d.media.length) return d;
      const next = [...d.media];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...d, media: next };
    });
  };

  const pickCover = (src: string) => set({ cover: src });

  const save = () => {
    if (!draft.title.trim()) return;
    const final = {
      ...draft,
      cover: draft.cover || draft.media.find((m) => m.kind === "photo")?.src || "",
    };
    if (!final.cover) {
      setUploads((u) => ({ ...u, error: "Ajoute au moins une photo pour servir de couverture." }));
      return;
    }
    saveEvent(final).then(onSave);
  };

  return (
    <div className="fixed inset-0 z-[98] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" data-cursor-hide>
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e11]">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h3 className="font-display text-lg font-bold">
            {creating ? "Nouvel événement" : "Modifier l'événement"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-dim transition-colors hover:border-accent hover:text-accent"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Titre de l'événement">
              <input
                value={draft.title}
                onChange={(e) => set({ title: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
            </Field>
            <Field label="Catégorie">
              <select
                value={draft.category}
                onChange={(e) => set({ category: e.target.value as Category })}
                className="w-full rounded-xl border border-white/10 bg-[#0e0e11] px-4 py-2.5 text-sm outline-none focus:border-accent"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0e0e11]">
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lieu">
              <input
                value={draft.location}
                onChange={(e) => set({ location: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
            </Field>
            <Field label="Date">
              <input
                value={draft.date}
                onChange={(e) => set({ date: e.target.value })}
                placeholder="ex : 2025"
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-dim">
                Médias ({draft.media.length})
              </span>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105"
              >
                <Upload size={14} /> Ajouter photos / vidéos
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {uploads.pending.length > 0 && (
              <div className="mb-3 rounded-2xl border border-accent/30 bg-accent/10 p-3">
                <div className="mb-2 text-xs font-semibold text-accent">
                  {uploads.pending.length} nouveau(x) média(x) prêt(s) à publier
                </div>
                <button
                  onClick={addUploads}
                  className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-black"
                >
                  Ajouter au site
                </button>
                <button
                  onClick={() => setUploads({ pending: [], error: "" })}
                  className="ml-2 rounded-full border border-white/20 px-4 py-1.5 text-xs text-dim"
                >
                  Annuler
                </button>
              </div>
            )}
            {uploads.error && (
              <p className="mb-3 text-xs text-red-400">{uploads.error}</p>
            )}

            {draft.media.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-white/15 text-xs text-dim">
                Aucun média — ajoute des photos ou vidéos.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {draft.media.map((m, i) => (
                  <div key={m.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10">
                    {m.kind === "video" ? (
                      <div className="flex h-full w-full items-center justify-center bg-black text-accent">
                        <Clapperboard size={20} />
                      </div>
                    ) : (
                      <img
                        src={m.src}
                        alt={m.caption || draft.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => pickCover(m.src)}
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          draft.cover === m.src
                            ? "bg-accent text-black"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        {draft.cover === m.src ? "Couverture ✓" : "Cover"}
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveMedia(m.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white"
                          aria-label="Monter"
                        >
                          <ArrowUpDown size={10} className="rotate-90" />
                        </button>
                        <button
                          onClick={() => moveMedia(m.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white"
                          aria-label="Descendre"
                        >
                          <ArrowUpDown size={10} className="-rotate-90" />
                        </button>
                        <button
                          onClick={() => removeMedia(m.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                          aria-label="Retirer"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                    {m.kind === "video" && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                        VID
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-dim">
              Bibliothèque personnelle
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {Object.entries(custom).map(([id, c]) => (
                <div key={id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10">
                  {c.kind === "video" ? (
                    <div className="flex h-full w-full items-center justify-center bg-black text-accent">
                      <Clapperboard size={18} />
                    </div>
                  ) : (
                    <img src={c.dataUrl} alt={c.name} className="h-full w-full object-cover" />
                  )}
                  <button
                    onClick={() => {
                      setDraft((d) => ({
                        ...d,
                        media: [
                          ...d.media,
                          { id: createEventId(), kind: c.kind, src: c.dataUrl, caption: c.name },
                        ],
                      }));
                    }}
                    className="absolute inset-x-0 bottom-0 bg-accent py-1 text-[9px] font-bold text-black opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Ajouter au site
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer « ${c.name} » de la bibliothèque ?`)) {
                        removeCustomMedia(id);
                        bump();
                      }
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Supprimer de la bibliothèque"
                  >
                    <Trash2 size={9} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
          <div className="text-xs text-dim">
            {draft.cover ? (
              <span className="flex items-center gap-1.5 text-accent">
                <Eye size={12} /> Couverture définie
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <EyeOff size={12} /> Choisis une couverture
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 px-6 py-2.5 text-sm text-dim transition-colors hover:border-white/30 hover:text-foreground"
            >
              Annuler
            </button>
            <button
              onClick={save}
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105"
            >
              <Save size={15} /> {creating ? "Publier l'événement" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-dim">
        {label}
      </span>
      {children}
    </label>
  );
}