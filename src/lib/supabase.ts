import { createClient } from "@supabase/supabase-js";
import type { EventItem, EventMedia } from "./types";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kffwrfzqzuqbjbllhvn.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZndyZnpxemJ1cWJqYmxsaHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTQwMzksImV4cCI6MjEwNDE5MDAzOX0.smXEbi8ITQUZ63kqaM8SySzBMA748wEKp3K10RUE4M0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Récupère tous les événements enregistrés dans Supabase avec leurs médias associés (join event_media)
 */
export async function fetchEventsFromSupabase(): Promise<EventItem[]> {
  try {
    const { data: events, error } = await supabase
      .from("events")
      .select("*, event_media(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des événements Supabase:", error);
      return [];
    }

    if (!events || events.length === 0) {
      return [];
    }

    return events.map((item: any) => {
      const mediaList: EventMedia[] = (item.event_media || []).map((m: any) => ({
        id: String(m.id || m.public_id),
        kind: m.kind === "video" ? "video" : "photo",
        src: m.url || m.src || "",
        public_id: m.public_id,
        caption: m.caption || m.public_id || "",
      }));

      const firstPhoto = mediaList.find((m) => m.kind === "photo")?.src;
      const firstMedia = mediaList[0]?.src;
      const cover = item.cover || firstPhoto || firstMedia || "";

      return {
        id: String(item.id),
        title: item.title || "",
        category: item.category || "Mode",
        location: item.location || "",
        date: item.date || "",
        description: item.description || "",
        cover,
        featured: Boolean(item.featured),
        created_at: item.created_at,
        media: mediaList,
      };
    });
  } catch (err) {
    console.error("Erreur inattendue lors de la récupération des événements Supabase:", err);
    return [];
  }
}

/**
 * Enregistre ou met à jour un événement et ses médias dans Supabase (tables 'events' et 'event_media')
 */
export async function saveEventToSupabase(event: EventItem): Promise<boolean> {
  try {
    const eventPayload = {
      id: event.id,
      title: event.title,
      category: event.category,
      location: event.location,
      date: event.date,
      description: event.description,
      cover: event.cover,
      featured: Boolean(event.featured),
    };

    const { data, error } = await supabase
      .from("events")
      .upsert(eventPayload)
      .select();

    if (error) {
      console.error("Erreur lors de la sauvegarde dans la table 'events':", error);
      return false;
    }

    const eventId = data && data[0] ? data[0].id : event.id;

    // Supprimer les médias préexistants de cet événement pour ré-insérer proprement
    await supabase.from("event_media").delete().eq("event_id", eventId);

    if (event.media && event.media.length > 0) {
      const mediaRows = event.media.map((m) => ({
        event_id: eventId,
        kind: m.kind,
        url: m.src,
        public_id: m.id || m.public_id,
        caption: m.caption || "",
      }));

      const { error: mediaErr } = await supabase.from("event_media").insert(mediaRows);
      if (mediaErr) {
        console.error("Erreur lors de l'insertion dans la table 'event_media':", mediaErr);
      }
    }

    return true;
  } catch (err) {
    console.error("Erreur inattendue lors de la sauvegarde Supabase:", err);
    return false;
  }
}

/**
 * Supprime un événement et tous ses médias associés de Supabase (tables 'events' et 'event_media')
 */
export async function deleteEventFromSupabase(eventId: string): Promise<boolean> {
  try {
    const { error: mediaError } = await supabase
      .from("event_media")
      .delete()
      .eq("event_id", eventId);

    if (mediaError) {
      console.error("Erreur lors de la suppression dans 'event_media':", mediaError);
    }

    const { error: eventError } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (eventError) {
      console.error("Erreur lors de la suppression dans 'events':", eventError);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Erreur inattendue lors de la suppression Supabase:", err);
    return false;
  }
}
