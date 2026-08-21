"use client";

import { SEED_EVENTS, ADMIN_CODE } from "./content";
import type { EventItem, EventMedia, QuoteRequest } from "./types";

const EVENTS_KEY = "bk_events_v1";
const QUOTES_KEY = "bk_quotes_v1";
const CUSTOM_MEDIA_KEY = "bk_custom_media_v1";

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded */
  }
}

function getLocalEvents(): EventItem[] {
  const stored = read<EventItem[]>(EVENTS_KEY, []);
  if (stored.length === 0) {
    write(EVENTS_KEY, SEED_EVENTS);
    return SEED_EVENTS;
  }
  return stored;
}

const ADMIN_HEADERS = { "x-admin-code": ADMIN_CODE };

export async function getEvents(): Promise<EventItem[]> {
  try {
    const res = await fetch("/api/events", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.events) && data.events.length > 0) {
        return data.events;
      }
    }
  } catch {
    /* serveur indisponible — repli local */
  }
  return getLocalEvents();
}

export async function saveEvent(event: EventItem) {
  try {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ADMIN_HEADERS },
      body: JSON.stringify(event),
    });
    if (res.ok) return true;
  } catch {
    /* repli local */
  }
  const events = getLocalEvents();
  const idx = events.findIndex((e) => e.id === event.id);
  if (idx >= 0) events[idx] = event;
  else events.unshift(event);
  write(EVENTS_KEY, events);
  return false;
}

export async function deleteEvent(id: string) {
  try {
    const res = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: ADMIN_HEADERS,
    });
    if (res.ok) return true;
  } catch {
    /* repli local */
  }
  write(
    EVENTS_KEY,
    getLocalEvents().filter((e) => e.id !== id),
  );
  return false;
}

export function createEventId() {
  return uid();
}

export async function getQuotes(): Promise<QuoteRequest[]> {
  try {
    const res = await fetch("/api/quotes", { headers: ADMIN_HEADERS, cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.quotes)) return data.quotes;
    }
  } catch {
    /* repli local */
  }
  return read<QuoteRequest[]>(QUOTES_KEY, []);
}

export async function saveQuote(quote: Omit<QuoteRequest, "id" | "date">) {
  try {
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...quote, id: uid(), date: new Date().toISOString() }),
    });
    if (res.ok) return true;
  } catch {
    /* repli local */
  }
  const quotes = read<QuoteRequest[]>(QUOTES_KEY, []);
  quotes.unshift({ ...quote, id: uid(), date: new Date().toISOString() });
  write(QUOTES_KEY, quotes);
  return false;
}

export async function deleteQuote(id: string) {
  try {
    const res = await fetch(`/api/quotes/${id}`, {
      method: "DELETE",
      headers: ADMIN_HEADERS,
    });
    if (res.ok) return true;
  } catch {
    /* repli local */
  }
  write(
    QUOTES_KEY,
    read<QuoteRequest[]>(QUOTES_KEY, []).filter((q) => q.id !== id),
  );
  return false;
}

export interface CustomMediaStore {
  [key: string]: { dataUrl: string; kind: "photo" | "video"; name: string };
}

export function getCustomMedia(): CustomMediaStore {
  return read<CustomMediaStore>(CUSTOM_MEDIA_KEY, {});
}

export function saveCustomMedia(
  id: string,
  payload: { dataUrl: string; kind: "photo" | "video"; name: string },
) {
  const store = getCustomMedia();
  store[id] = payload;
  try {
    window.localStorage.setItem(CUSTOM_MEDIA_KEY, JSON.stringify(store));
    return true;
  } catch {
    delete store[id];
    return false;
  }
}

export function removeCustomMedia(id: string) {
  const store = getCustomMedia();
  delete store[id];
  write(CUSTOM_MEDIA_KEY, store);
}

export function fileToDataUrl(
  file: File,
  maxDim = 1600,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.onload = () => {
      const result = reader.result as string;
      if (file.type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(result);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(result);
        img.src = result;
      } else {
        resolve(result);
      }
    };
    reader.readAsDataURL(file);
  });
}

export function mediaToEventMedia(file: File): Promise<EventMedia> {
  return fileToDataUrl(file).then((dataUrl) => ({
    id: uid(),
    kind: file.type.startsWith("video") ? "video" : "photo",
    src: dataUrl,
    caption: file.name,
  }));
}