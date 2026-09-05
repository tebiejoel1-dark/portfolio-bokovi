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
 * Récupère tous les événements directement depuis la table 'portfolio'
 */
export async function fetchEventsFromSupabase(): Promise<EventItem[]> {
  try {
    const { data: events, error } = await supabase
      .from("portfolio")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur Select Portfolio Supabase:", error.message || error);
      return [];
    }

    if (!events || events.length === 0) {
      return [];
    }

    return events.map((item: any) => {
      let rawUrls: string[] = [];
      if (Array.isArray(item.media_urls)) {
        rawUrls = item.media_urls;
      } else if (typeof item.media_urls === "string") {
        try {
          rawUrls = JSON.parse(item.media_urls);
        } catch {
          rawUrls = item.media_urls ? [item.media_urls] : [];
        }
      }

      const mediaList: EventMedia[] = rawUrls.map((url: string, idx: number) => {
        const isVideo =
          Boolean(url.toLowerCase().match(/\.(mp4|mov|webm|ogg)($|\?)/)) ||
          url.includes("/video/") ||
          url.includes("video");
        return {
          id: `${item.id}-${idx}`,
          kind: isVideo ? "video" : "photo",
          src: url,
          caption: item.title || "",
        };
      });

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
export async function uploadSingleFile(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop() || "png";
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, { cacheControl: "3600", upsert: true });

  if (uploadErr) {
    console.error("Erreur Supabase Storage Upload:", uploadErr.message || uploadErr);
    throw uploadErr;
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  if (!data?.publicUrl) {
    throw new Error("Impossible de récupérer l'URL publique du fichier téléversé.");
  }

  return data.publicUrl;
}

/**
 * Téléverse les médias et insère l'événement dans la table unique 'portfolio'
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
    existingMediaUrls?: string[];
  },
  filesToUpload: File[],
  onProgress?: (msg: string, percent: number) => void
): Promise<{ success: boolean; event: any | null; error?: string }> {
  try {
    const uploadedUrls: string[] = [];

    // 1. Envoi rapide dans Supabase Storage 'portfolio-media'
    if (filesToUpload.length > 0) {
      onProgress?.(`Téléversement de ${filesToUpload.length} fichier(s) dans Supabase Storage...`, 20);

      const totalFiles = filesToUpload.length;
      let completedCount = 0;

      const uploadPromises = filesToUpload.map(async (file) => {
        const publicUrl = await uploadSingleFile(file);
        completedCount++;
        const percent = Math.round(20 + (completedCount / totalFiles) * 65);
        onProgress?.(
          `Téléversement (${completedCount}/${totalFiles}) : ${file.name}`,
          percent
        );
        return publicUrl;
      });

      const results = await Promise.all(uploadPromises);
      results.forEach((url) => {
        if (url) uploadedUrls.push(url);
      });
    }

    // Réunir avec les médias existants éventuels (pour l'édition)
    const mediaUrlsArray = [
      ...(eventData.existingMediaUrls || []),
      ...uploadedUrls,
    ];

    const coverUrl = eventData.cover_url || mediaUrlsArray[0] || "";

    onProgress?.("Enregistrement dans la table Supabase 'portfolio'...", 90);

    // 2. Insert unique dans la table 'portfolio'
    const { data: newEvent, error: insertErr } = await supabase
      .from("portfolio")
      .insert([
        {
          title: eventData.title,
          category: eventData.category,
          location: eventData.location,
          event_date: eventData.date,
          description: eventData.description,
          cover_url: coverUrl,
          media_urls: mediaUrlsArray,
          featured: Boolean(eventData.featured),
        },
      ])
      .select()
      .single();

    if (insertErr) {
      console.error("Erreur Supabase:", insertErr.message || insertErr);
      throw insertErr;
    }

    onProgress?.("Événement publié et sauvegardé avec succès !", 100);
    return { success: true, event: newEvent };
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error("Erreur complète publication événement:", msg);
    return { success: false, event: null, error: msg };
  }
}

/**
 * Supprime un événement de la table unique 'portfolio'
 */
export async function deleteEventFromSupabase(eventId: string): Promise<boolean> {
  try {
    const { error: deleteErr } = await supabase
      .from("portfolio")
      .delete()
      .eq("id", eventId);

    if (deleteErr) {
      console.error("Erreur Delete Portfolio Supabase:", deleteErr.message || deleteErr);
      return false;
    }

    return true;
  } catch (err: any) {
    console.error("Erreur inattendue suppression événement:", err.message || err);
    return false;
  }
}
