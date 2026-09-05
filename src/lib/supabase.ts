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
 * Récupère tous les événements en direct depuis la table 'events' avec leurs médias associés 'event_media'
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
        id: String(m.id || m.storage_path || Math.random()),
        kind: m.media_type === "video" || m.kind === "video" ? "video" : "photo",
        src: m.url || m.src || "",
        storage_path: m.storage_path,
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
  } catch (err) {
    console.error("Erreur inattendue lors du chargement Supabase:", err);
    return [];
  }
}

/**
 * Téléverse un fichier directement dans le bucket Supabase Storage 'portfolio-media'
 */
export async function uploadFileToSupabaseStorage(
  file: File,
  eventId: string
): Promise<{ publicUrl: string; storagePath: string } | null> {
  try {
    const fileExt = file.name.split(".").pop() || "bin";
    const filePath = `${eventId}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Erreur lors du téléversement Supabase Storage:", uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      publicUrl: urlData.publicUrl,
      storagePath: filePath,
    };
  } catch (err) {
    console.error("Erreur inattendue Supabase Storage upload:", err);
    return null;
  }
}

/**
 * Enregistre un événement dans la table 'events' et insère ses fichiers dans 'event_media' via Supabase Storage
 */
export async function saveEventWithSupabaseStorage(
  event: EventItem,
  filesToUpload: File[],
  onProgress?: (msg: string, percent: number) => void
): Promise<boolean> {
  try {
    onProgress?.("Création de l'événement dans Supabase...", 15);

    // 1. Insertion / Mise à jour dans la table 'events'
    const eventPayload: any = {
      title: event.title,
      category: event.category,
      location: event.location,
      event_date: event.date,
      description: event.description,
      featured: Boolean(event.featured),
    };

    let eventId = event.id;
    let coverUrl = event.cover || "";

    // Tente l'insertion/upsert
    const { data: eventData, error: eventErr } = await supabase
      .from("events")
      .upsert({ id: event.id, ...eventPayload })
      .select()
      .single();

    if (eventErr) {
      console.warn("Retentative d'insertion 'events' sans ID forcé...", eventErr);
      const { data: insertedData, error: insertErr } = await supabase
        .from("events")
        .insert([eventPayload])
        .select()
        .single();

      if (insertErr) {
        console.error("Échec de l'insertion dans 'events':", insertErr);
        return false;
      }
      eventId = String(insertedData.id);
    } else if (eventData) {
      eventId = String(eventData.id);
    }

    // 2. Téléversement des nouveaux fichiers dans Supabase Storage 'portfolio-media'
    const newMediaRows: any[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const percent = 20 + Math.round(((i + 1) / filesToUpload.length) * 60);
      onProgress?.(`Téléversement de "${file.name}" vers Supabase Storage...`, percent);

      const res = await uploadFileToSupabaseStorage(file, eventId);
      if (res) {
        if (!coverUrl && !file.type.startsWith("video")) {
          coverUrl = res.publicUrl;
        }
        newMediaRows.push({
          event_id: eventId,
          url: res.publicUrl,
          storage_path: res.storagePath,
          media_type: file.type.startsWith("video") ? "video" : "image",
          caption: file.name,
        });
      }
    }

    // Récupérer les anciens médias déjà uploadés s'ils existent
    if (event.media && event.media.length > 0) {
      event.media.forEach((m) => {
        if (m.src && m.src.startsWith("http") && !newMediaRows.some((row) => row.url === m.src)) {
          newMediaRows.push({
            event_id: eventId,
            url: m.src,
            storage_path: m.storage_path || "",
            media_type: m.kind === "video" ? "video" : "image",
            caption: m.caption || "",
          });
        }
      });
    }

    // Mettre à jour la couverture si définie
    if (!coverUrl && newMediaRows.length > 0) {
      coverUrl = newMediaRows[0].url;
    }

    if (coverUrl) {
      await supabase.from("events").update({ cover: coverUrl }).eq("id", eventId);
    }

    // 3. Insérer les lignes dans 'event_media'
    onProgress?.("Enregistrement des médias dans la base de données Supabase...", 90);
    if (newMediaRows.length > 0) {
      await supabase.from("event_media").delete().eq("event_id", eventId);
      const { error: mediaErr } = await supabase.from("event_media").insert(newMediaRows);
      if (mediaErr) {
        console.error("Erreur lors de l'insertion dans 'event_media':", mediaErr);
      }
    }

    onProgress?.("Événement et médias enregistrés avec succès !", 100);
    return true;
  } catch (err) {
    console.error("Erreur inattendue lors de saveEventWithSupabaseStorage:", err);
    return false;
  }
}

/**
 * Supprime un événement, ses entrées 'event_media' et supprime physiquement les fichiers dans Supabase Storage 'portfolio-media'
 */
export async function deleteEventFromSupabase(eventId: string): Promise<boolean> {
  try {
    // 1. Récupérer tous les médias pour trouver leurs storage_path
    const { data: mediaItems } = await supabase
      .from("event_media")
      .select("storage_path")
      .eq("event_id", eventId);

    // 2. Supprimer physiquement du bucket Supabase Storage
    if (mediaItems && mediaItems.length > 0) {
      const storagePaths = mediaItems
        .map((m: any) => m.storage_path)
        .filter((path: string) => Boolean(path) && path.trim() !== "");

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(storagePaths);

        if (storageError) {
          console.warn("Attention: erreur lors du nettoyage Supabase Storage:", storageError);
        }
      }
    }

    // 3. Supprimer de la table 'events' (la cascade efface automatiquement 'event_media')
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
