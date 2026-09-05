import { createClient } from "@supabase/supabase-js";
import type { EventItem, EventMedia } from "./types";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kffwrfzqzbuqbjbllhvn.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZndyZnpxemJ1cWJqYmxsaHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTQwMzksImV4cCI6MjEwNDE5MDAzOX0.smXEbi8ITQUZ63kqaM8SySzBMA748wEKp3K10RUE4M0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Récupère tous les événements depuis Supabase avec jointure sur event_media
 */
export async function fetchEventsFromSupabase(): Promise<EventItem[]> {
  try {
    const { data: events, error } = await supabase
      .from("events")
      .select("*, event_media(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur Select Events Supabase:", error.message || error);
      return [];
    }

    if (!events || events.length === 0) {
      return [];
    }

    return events.map((item: any) => {
      const mediaList: EventMedia[] = (item.event_media || []).map((m: any) => ({
        id: String(m.id || m.public_id || m.storage_path || Math.random()),
        kind: m.media_type === "video" || m.kind === "video" ? "video" : "photo",
        src: m.url || m.src || "",
        public_id: m.storage_path || m.public_id || "",
        storage_path: m.storage_path || m.public_id || "",
        caption: m.caption || m.storage_path || "",
      }));

      const firstPhoto = mediaList.find((m) => m.kind === "photo")?.src;
      const firstMedia = mediaList[0]?.src;
      const cover = item.cover || firstPhoto || firstMedia || "";

      return {
        id: String(item.id),
        title: item.title || "",
        category: item.category || "Mode",
        location: item.location || "",
        date: item.event_date || item.date || "",
        description: item.description || "",
        cover,
        featured: Boolean(item.featured),
        created_at: item.created_at,
        media: mediaList,
      };
    });
  } catch (err: any) {
    console.error("Erreur inattendue chargement Supabase:", err.message || err);
    return [];
  }
}

/**
 * Insère un nouvel événement dans la table 'events' et ses médias dans 'event_media'
 */
export async function createEventInSupabase(
  eventData: {
    id?: string;
    title: string;
    category: string;
    location: string;
    date: string;
    description: string;
    cover?: string;
    featured?: boolean;
  },
  mediaList: { url: string; publicId: string; kind: "photo" | "video" }[]
): Promise<{ success: boolean; event: any | null; error?: string }> {
  try {
    const firstPhotoUrl = mediaList.find((m) => m.kind === "photo")?.url;
    const coverUrl = eventData.cover || firstPhotoUrl || (mediaList[0] ? mediaList[0].url : "");

    // 1. Insertion dans la table 'events' (sans forcer d'ID string pour laisser Supabase générer la clé primaire)
    const { data: newEvent, error: eventErr } = await supabase
      .from("events")
      .insert([
        {
          title: eventData.title,
          category: eventData.category,
          location: eventData.location,
          event_date: eventData.date,
          description: eventData.description,
          cover: coverUrl,
          featured: Boolean(eventData.featured),
        },
      ])
      .select()
      .single();

    if (eventErr) {
      console.error("Erreur Insert Event:", eventErr.message || eventErr);
      throw eventErr;
    }

    const eventId = newEvent.id;

    // 2. Insertion dans la table 'event_media'
    if (mediaList.length > 0) {
      const mediaRows = mediaList.map((m) => ({
        event_id: eventId,
        url: m.url,
        storage_path: m.publicId || "",
        media_type: m.kind === "video" ? "video" : "image",
      }));

      const { error: mediaErr } = await supabase
        .from("event_media")
        .insert(mediaRows);

      if (mediaErr) {
        console.error("Erreur Insert Media:", mediaErr.message || mediaErr);
      }
    }

    return { success: true, event: newEvent };
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error("Erreur complète publication événement:", msg);
    return { success: false, event: null, error: msg };
  }
}

/**
 * Supprime un événement et ses entrées dans 'event_media'
 */
export async function deleteEventFromSupabase(eventId: string): Promise<boolean> {
  try {
    // Supprime d'abord de event_media
    await supabase.from("event_media").delete().eq("event_id", eventId);

    // Supprime ensuite de events
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) {
      console.error("Erreur Delete Event Supabase:", error.message || error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error("Erreur inattendue suppression événement:", err.message || err);
    return false;
  }
}
