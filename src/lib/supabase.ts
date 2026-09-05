import { createClient } from "@supabase/supabase-js";
import type { EventItem, EventMedia } from "./types";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kffwrfzqzbuqbjbllhvn.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZndyZnpxemJ1cWJqYmxsaHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTQwMzksImV4cCI6MjEwNDE5MDAzOX0.smXEbi8ITQUZ63kqaM8SySzBMA748wEKp3K10RUE4M0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const BUCKET_NAME = "portfolio-media";

/**
 * Récupère tous les événements directement depuis Supabase (table 'events' et jointure 'event_media')
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
        id: String(m.id || m.storage_path || Math.random()),
        kind: m.media_type === "video" || m.kind === "video" ? "video" : "photo",
        src: m.url || m.src || "",
        storage_path: m.storage_path || m.public_id || "",
        public_id: m.storage_path || m.public_id || "",
        caption: m.caption || m.storage_path || "",
      }));

      const firstPhoto = mediaList.find((m) => m.kind === "photo")?.src;
      const firstMedia = mediaList[0]?.src;
      const cover = item.cover_url || item.cover || firstPhoto || firstMedia || "";

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
 * Téléverse un fichier directement dans le bucket Supabase Storage 'portfolio-media'
 */
export async function uploadFileToSupabaseStorage(
  file: File
): Promise<{ publicUrl: string; storagePath: string } | null> {
  try {
    const sanitizeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${Date.now()}_${sanitizeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Erreur Supabase Storage upload:", uploadError.message || uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      publicUrl: urlData.publicUrl,
      storagePath: filePath,
    };
  } catch (err: any) {
    console.error("Erreur inattendue Supabase Storage upload:", err.message || err);
    return null;
  }
}

/**
 * Insère un nouvel événement dans 'events' (champs title, category, location, event_date, description, cover_url)
 * et insère ses fichiers téléversés dans 'event_media'
 */
export async function publishEventToSupabase(
  eventData: {
    title: string;
    category: string;
    location: string;
    date: string;
    description: string;
    cover_url?: string;
    featured?: boolean;
  },
  filesToUpload: File[],
  onProgress?: (msg: string, percent: number) => void
): Promise<{ success: boolean; event: any | null; error?: string }> {
  try {
    const uploadedResults: { publicUrl: string; storagePath: string; isVideo: boolean }[] = [];

    // 1. Téléversement dans Supabase Storage 'portfolio-media'
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const percent = Math.round(((i + 1) / filesToUpload.length) * 70);
      onProgress?.(`Téléversement de "${file.name}" dans Supabase Storage...`, percent);

      const res = await uploadFileToSupabaseStorage(file);
      if (res) {
        uploadedResults.push({
          publicUrl: res.publicUrl,
          storagePath: res.storagePath,
          isVideo: file.type.startsWith("video"),
        });
      }
    }

    // Déterminer l'URL de couverture (cover_url)
    const firstImage = uploadedResults.find((m) => !m.isVideo)?.publicUrl;
    const coverUrl = eventData.cover_url || firstImage || (uploadedResults[0] ? uploadedResults[0].publicUrl : "");

    onProgress?.("Enregistrement de l'événement dans la table 'events'...", 80);

    // 2. Insertion dans la table 'events' (avec cover_url et event_date)
    const { data: newEvent, error: eventErr } = await supabase
      .from("events")
      .insert([
        {
          title: eventData.title,
          category: eventData.category,
          location: eventData.location,
          event_date: eventData.date,
          description: eventData.description,
          cover_url: coverUrl,
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

    // 3. Insertion dans la table 'event_media'
    if (uploadedResults.length > 0) {
      onProgress?.("Enregistrement des médias dans la table 'event_media'...", 90);

      const mediaRows = uploadedResults.map((m) => ({
        event_id: eventId,
        url: m.publicUrl,
        storage_path: m.storagePath,
        media_type: m.isVideo ? "video" : "image",
      }));

      const { error: mediaErr } = await supabase
        .from("event_media")
        .insert(mediaRows);

      if (mediaErr) {
        console.error("Erreur Insert Media:", mediaErr.message || mediaErr);
      }
    }

    onProgress?.("Événement et médias publiés avec succès !", 100);
    return { success: true, event: newEvent };
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error("Erreur complète publication événement:", msg);
    return { success: false, event: null, error: msg };
  }
}

/**
 * Supprime les fichiers dans Supabase Storage 'portfolio-media' via leurs storage_path puis supprime l'événement dans 'events'
 */
export async function deleteEventFromSupabase(eventId: string): Promise<boolean> {
  try {
    // 1. Récupérer tous les storage_path des médias associés dans event_media
    const { data: mediaItems } = await supabase
      .from("event_media")
      .select("storage_path")
      .eq("event_id", eventId);

    // 2. Supprimer les fichiers dans Supabase Storage via storage.from('portfolio-media').remove(paths)
    if (mediaItems && mediaItems.length > 0) {
      const paths = mediaItems
        .map((m: any) => m.storage_path)
        .filter((p: string) => Boolean(p) && p.trim() !== "");

      if (paths.length > 0) {
        const { error: storageErr } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(paths);

        if (storageErr) {
          console.warn("Erreur suppression Supabase Storage:", storageErr.message || storageErr);
        }
      }
    }

    // 3. Supprimer l'événement dans la table 'events'
    const { error: deleteErr } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (deleteErr) {
      console.error("Erreur Delete Event Supabase:", deleteErr.message || deleteErr);
      return false;
    }

    return true;
  } catch (err: any) {
    console.error("Erreur inattendue suppression événement:", err.message || err);
    return false;
  }
}
