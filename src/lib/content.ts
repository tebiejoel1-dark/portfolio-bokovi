import { KARA_GALLERY } from "./kara-gallery";
import type { EventItem, Category } from "./types";

const karaPhotos = KARA_GALLERY;

const heroSelect = [
  karaPhotos[2],
  karaPhotos[7],
  karaPhotos[14],
  karaPhotos[22],
  karaPhotos[31],
  karaPhotos[41],
  karaPhotos[50],
  karaPhotos[60],
  karaPhotos[70],
  karaPhotos[79],
];

// Ayele shooting
const AYELE = [
  "/media/ayele/as.jpg",
  "/media/ayele/as1.jpg",
  "/media/ayele/as2.jpg",
  "/media/ayele/as3.jpg",
  "/media/ayele/as4.jpg",
];

// Fiançailles
const FIANCAILLES = Array.from({ length: 16 }, (_, i) => `/media/fiancailles/fi${i + 1}.jpg`);

// Joanna
const JOANNA = [
  "/media/joanna/js1.jpg",
  "/media/joanna/js2.jpg",
  "/media/joanna/js3.jpg",
];

// Modele
const MODELE = [
  "/media/modele/sm1.jpg",
  "/media/modele/sm2.jpg",
  "/media/modele/sm3.jpg",
];

// Oceane
const OCEANE = Array.from({ length: 6 }, (_, i) => `/media/oceane/oc${i + 1}.jpg`);

// Zya
const ZYA = Array.from({ length: 5 }, (_, i) => `/media/zya/zs${i + 1}.jpg`);

// Portraits photographe / vidéaste (tof du vidéaste)
export const PORTRAITS = [
  "/media/portraits/port1.jpg",
  "/media/portraits/port2.jpg",
  "/media/portraits/port8.jpg",
  "/media/portraits/port9.jpg",
];

export const SEED_EVENTS: EventItem[] = [
  {
    id: "bokovi-portraits",
    title: "Ange BOKOVI — Portraits & En Action",
    category: "Portrait",
    location: "Lomé, Togo",
    date: "2025",
    description:
      "Série de portraits de BOKOVI A.V. Ange en studio et sur le terrain. Photographe & Vidéaste Officiel Moov Africa Togo et fondateur du studio Licht-Frame.",
    cover: PORTRAITS[1],
    featured: true,
    media: PORTRAITS.map((src, i) => ({
      id: `bokovi-port-${i}`,
      kind: "photo" as const,
      src,
      caption: `BOKOVI A.V. Ange — Portrait ${i + 1}`,
    })),
  },
  {
    id: "move-africa-togo",
    title: "Campagne & Événements Moov Africa Togo",
    category: "Corporate",
    location: "Lomé, Togo",
    date: "2025",
    description:
      "Couverture officielle et direction artistique pour Moov Africa Togo : shooting portraits d'affiches, visuels de campagne institutionnelle, création de contenu vidéo et formation.",
    cover: "/media/works/port5.jpg",
    featured: true,
    media: [
      { id: "ma1", kind: "photo", src: "/media/works/port5.jpg" },
      { id: "ma2", kind: "photo", src: "/media/works/port6.jpg" },
      { id: "ma3", kind: "photo", src: PORTRAITS[0] },
      { id: "ma4", kind: "photo", src: PORTRAITS[2] },
    ],
  },
  {
    id: "miss-togo-kara",
    title: "Miss Togo Régionale — Kara",
    category: "Miss Togo",
    location: "Kara, Togo",
    date: "2025",
    description:
      "Couverture officielle de la finale régionale Miss Togo à Kara : backstage, défilés, couronnement et ambiances. 83 photos captées en reportage, entre lumière de scène et moments intimes du concours.",
    cover: karaPhotos[14],
    featured: true,
    media: [
      {
        id: "kara-vid-1",
        kind: "video",
        src: "/media/video/backstage-kara.mp4",
        poster: karaPhotos[7],
        caption: "Backstage & ambiances — Miss Togo Kara",
      },
      ...heroSelect.map((src, i) => ({
        id: `kara-${i}`,
        kind: "photo" as const,
        src,
      })),
    ],
  },
  {
    id: "fiancailles-shooting",
    title: "Shooting Fiançailles",
    category: "Mariage",
    location: "Lomé, Togo",
    date: "2025",
    description:
      "Couverture artistique d'une cérémonie de fiançailles : portraits de couple, ambiances et moments de complicité immortalisés avec une lumière naturelle maîtrisée.",
    cover: FIANCAILLES[6],
    featured: true,
    media: FIANCAILLES.map((src, i) => ({
      id: `fi-${i}`,
      kind: "photo" as const,
      src,
      caption: `Fiançailles — photo ${i + 1}`,
    })),
  },
  {
    id: "oceane-codjia-shooting",
    title: "Shooting Océane Codjia",
    category: "Mode",
    location: "Lomé, Togo",
    date: "2025",
    description:
      "Séance portrait mode avec Océane Codjia : direction artistique raffinée, jeux de lumière et composition soignée pour un rendu éditorial haut de gamme.",
    cover: OCEANE[2],
    featured: true,
    media: OCEANE.map((src, i) => ({
      id: `oc-${i}`,
      kind: "photo" as const,
      src,
      caption: `Océane Codjia — portrait ${i + 1}`,
    })),
  },
  {
    id: "zya-shooting",
    title: "Shooting Zya",
    category: "Mode",
    location: "Lomé, Togo",
    date: "2025",
    description:
      "Shooting créatif avec Zya : ambiances cinématographiques, lumière sculptée et travail sur l'expression. Un projet alliant esthétique contemporaine et personnalité forte.",
    cover: ZYA[1],
    media: ZYA.map((src, i) => ({
      id: `zya-${i}`,
      kind: "photo" as const,
      src,
      caption: `Zya — photo ${i + 1}`,
    })),
  },
  {
    id: "ayele-shooting",
    title: "Shooting Ayele",
    category: "Portrait",
    location: "Lomé, Togo",
    date: "2025",
    description:
      "Portrait session avec Ayele : travail sur le regard, la lumière naturelle et la mise en scène pour des images authentiques et percutantes.",
    cover: AYELE[2],
    media: AYELE.map((src, i) => ({
      id: `as-${i}`,
      kind: "photo" as const,
      src,
      caption: `Ayele — photo ${i + 1}`,
    })),
  },
  {
    id: "joanna-shooting",
    title: "Shooting Joanna",
    category: "Portrait",
    location: "Lomé, Togo",
    date: "2025",
    description:
      "Séance portrait intime avec Joanna : jeux de lumière douce, poses naturelles et authenticité. Un travail délicat pour sublimer la personnalité du sujet.",
    cover: JOANNA[1],
    media: JOANNA.map((src, i) => ({
      id: `js-${i}`,
      kind: "photo" as const,
      src,
      caption: `Joanna — photo ${i + 1}`,
    })),
  },
  {
    id: "shooting-modele",
    title: "Shooting Modèle Studio",
    category: "Mode",
    location: "Lomé, Togo",
    date: "2025",
    description:
      "Shooting mode studio : éclairage artificiel maîtrisé, direction artistique et post-production Lightroom pour des visuels à destination des marques.",
    cover: MODELE[1],
    media: MODELE.map((src, i) => ({
      id: `sm-${i}`,
      kind: "photo" as const,
      src,
      caption: `Modèle Studio — photo ${i + 1}`,
    })),
  },
  {
    id: "studio-licht-frame",
    title: "Licht-Frame Studio Session",
    category: "Mode",
    location: "Lomé, Togo",
    date: "2025",
    description:
      "Séries studio au Licht-Frame : portraits sculptés à la lumière, direction artistique photo et post-production Lightroom.",
    cover: "/media/works/port3.jpg",
    media: [
      { id: "w3", kind: "photo", src: "/media/works/port3.jpg" },
      { id: "w4", kind: "photo", src: "/media/works/port4.jpg" },
      { id: "w5", kind: "photo", src: "/media/works/port5.jpg" },
      { id: "w6", kind: "photo", src: "/media/works/port6.jpg" },
      { id: "w7", kind: "photo", src: "/media/works/port7.jpg" },
    ],
  },
];

export const HERO_SLIDES = heroSelect;

export const WORK_COVER = {
  "Miss Togo": karaPhotos[20],
  Mode: "/media/works/port3.jpg",
  Corporate: "/media/works/port5.jpg",
  Concert: karaPhotos[35],
  Mariage: FIANCAILLES[5],
  Sport: karaPhotos[60],
  Musique: karaPhotos[41],
  Portrait: PORTRAITS[1],
} as Record<Category, string>;

export const ABOUT_PHOTO = "/media/portraits/port2.jpg";

export const PROFILE = {
  name: "BOKOVI A.V. Ange",
  role: "Photographe & Vidéaste Officiel Moov Africa Togo",
  roleEn: "Official Photographer & Videographer Moov Africa Togo",
  studio: "Licht-Frame Studio",
  location: "Lomé, Togo",
  phone: "+228 92 29 28 31",
  whatsapp: "22892292831",
  email: "angedmirable@gmail.com",
  facebook: "https://www.facebook.com/share/1EpMWSRY3c/?mibextid=wwXIfr",
  tiktok: "https://www.tiktok.com/@licht_visual?_r=1&_t=ZS-99NA0BtG6pJ",
  bio: "Photographe et créateur de contenu professionnel basé à Lomé, Togo. Photographe & Vidéaste Officiel de Moov Africa Togo et fondateur de Licht-Frame Studio. Spécialisé en couverture événementielle institutionnelle, shooting de campagne et direction artistique.",
  bioEn: "Professional photographer and content creator based in Lomé, Togo. Official Photographer & Videographer of Moov Africa Togo and founder of Licht-Frame Studio. Specializing in institutional event coverage, campaign shoots and art direction.",
  experience: [
    {
      role: "Photographe & Vidéaste Officiel",
      roleEn: "Official Photographer & Videographer",
      period: "Moov Africa Togo",
      detail:
        "Couverture officielle des événements d'envergure, création de visuels de campagne institutionnels et formation de l'équipe média.",
    },
    {
      role: "Fondateur & Directeur Artistique — Licht-Frame",
      roleEn: "Founder & Art Director — Licht-Frame",
      period: "12/2025 — aujourd'hui",
      detail:
        "Couverture de plus de 100 événements corporate, institutionnels et réalisation de reportages photo/vidéo haut de gamme au Togo.",
    },
    {
      role: "Couverture Événementielle Officielle",
      roleEn: "Official Event Coverage",
      period: "Miss Togo Régionale — Kara",
      detail:
        "Reportage complet de la finale régionale Miss Togo : défilés, backstage, couronnement et ambiances.",
    },
  ],
  skills: [
    { name: "Photoshop / Lightroom", level: "Avancé" },
    { name: "Capture One", level: "Intermédiaire" },
    { name: "DaVinci Resolve", level: "Intermédiaire" },
    { name: "Gestion de lumière", level: "Expert" },
    { name: "Direction artistique photo", level: "Expert" },
    { name: "Montage vidéo & étalonnage", level: "Avancé" },
  ],
  languages: [
    { name: "Français", level: "Avancé" },
    { name: "Anglais", level: "Intermédiaire" },
  ],
};

export const ADMIN_CODE = "BOKOVI007#";