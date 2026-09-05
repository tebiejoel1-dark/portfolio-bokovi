export type Category =
  | "Miss Togo"
  | "Concert"
  | "Mariage"
  | "Corporate"
  | "Mode"
  | "Sport"
  | "Musique"
  | "Portrait";

export type MediaKind = "photo" | "video";

export type PortfolioSection = "hero" | "shorts_reels" | "video" | "celebrite";

export interface PortfolioItem {
  id: string | number;
  section: PortfolioSection;
  url: string;
  public_id: string;
  created_at?: string;
}

export interface EventMedia {
  id: string;
  kind: MediaKind;
  src: string;
  poster?: string;
  caption?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: string; // allow any string for flexibility
  location: string;
  date: string;
  description: string;
  cover: string;
  media: EventMedia[];
  featured?: boolean;
}

export const CATEGORIES: Category[] = [
  "Miss Togo",
  "Concert",
  "Mariage",
  "Corporate",
  "Mode",
  "Sport",
  "Musique",
  "Portrait",
];

export interface AnalyticsRecord {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface QuoteRequest {
  id: string;
  date: string;
  type?: string;
  projectType?: string;
  location: string;
  services?: string[];
  deliverables?: string[];
  budget?: number;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}