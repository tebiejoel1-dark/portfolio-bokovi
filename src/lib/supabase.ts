import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kffwrfzqzuqbjbllhvn.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZndyZnpxemJ1cWJqYmxsaHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTQwMzksImV4cCI6MjEwNDE5MDAzOX0.smXEbi8ITQUZ63kqaM8SySzBMA748wEKp3K10RUE4M0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type PortfolioSection = "hero" | "shorts_reels" | "video" | "celebrite";

export interface PortfolioItem {
  id: string | number;
  section: PortfolioSection;
  url: string;
  public_id: string;
  created_at?: string;
}

/**
 * Récupère l'ensemble des éléments enregistrés dans la table 'portfolio' Supabase,
 * triés du plus récent au plus ancien.
 */
export async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors du chargement des médias Supabase:", error);
      return [];
    }
    return (data as PortfolioItem[]) || [];
  } catch (err) {
    console.error("Erreur inattendue Supabase select:", err);
    return [];
  }
}

/**
 * Insère un nouveau média téléversé dans la table Supabase 'portfolio'
 */
export async function insertPortfolioItem(
  section: PortfolioSection,
  url: string,
  public_id: string
) {
  try {
    const { data, error } = await supabase
      .from("portfolio")
      .insert([
        {
          section,
          url,
          public_id,
        },
      ])
      .select();

    if (error) {
      console.error("Erreur lors de l'insertion Supabase:", error);
    }
    return { data, error };
  } catch (err) {
    console.error("Erreur inattendue Supabase insert:", err);
    return { data: null, error: err };
  }
}

/**
 * Supprime un média de la table Supabase 'portfolio' par son ID
 */
export async function deletePortfolioItem(id: string | number) {
  try {
    const { error } = await supabase
      .from("portfolio")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur lors de la suppression Supabase:", error);
    }
    return { error };
  } catch (err) {
    console.error("Erreur inattendue Supabase delete:", err);
    return { error: err };
  }
}
