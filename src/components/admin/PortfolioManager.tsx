"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  Loader2,
  Film,
  Image as ImageIcon,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink,
  Plus,
} from "lucide-react";
import {
  fetchPortfolioItems,
  deletePortfolioItem,
  type PortfolioItem,
  type PortfolioSection,
} from "@/lib/supabase";
import { uploadMediaToCloudinaryAndSupabase } from "@/lib/cloudinary";

const SECTIONS: { id: PortfolioSection; label: string; description: string }[] = [
  { id: "hero", label: "1. Photo Hero", description: "Grandes photos d'accueil pour le carrousel principal" },
  { id: "shorts_reels", label: "2. Shorts / Reels", description: "Vidéos au format vertical (Shorts & Reels)" },
  { id: "video", label: "3. Vidéos", description: "Vidéos de portfolio et réalisations de grande qualité" },
  { id: "celebrite", label: "4. Célébrités", description: "Photos de célébrités & personnalités publiques" },
];

export default function PortfolioManager() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<PortfolioSection>("hero");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [uploadStatus, setUploadStatus] = useState<{
    isUploading: boolean;
    currentFile: string;
    message: string;
    percent: number;
    error: string;
    successCount: number;
  }>({
    isUploading: false,
    currentFile: "",
    message: "",
    percent: 0,
    error: "",
    successCount: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchPortfolioItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    setUploadStatus({
      isUploading: true,
      currentFile: fileArray[0].name,
      message: `Initialisation du téléversement vers Supabase (${selectedSection})...`,
      percent: 10,
      error: "",
      successCount: 0,
    });

    let succ = 0;
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      try {
        await uploadMediaToCloudinaryAndSupabase(file, selectedSection, (st) => {
          const stepPercent = Math.round(
            ((i + (st.progressPercent ? st.progressPercent / 100 : 0.5)) / fileArray.length) * 100
          );
          setUploadStatus({
            isUploading: true,
            currentFile: file.name,
            message: st.message,
            percent: Math.min(100, stepPercent),
            error: "",
            successCount: succ,
          });
        });
        succ++;
      } catch (err) {
        console.error("Erreur lors de l'upload et insertion Supabase:", err);
        setUploadStatus((prev) => ({
          ...prev,
          error: `Échec d'envoi pour "${file.name}". Vérifie la console et ta connexion.`,
        }));
      }
    }

    setUploadStatus({
      isUploading: false,
      currentFile: "",
      message: `Téléversement terminé avec succès (${succ}/${fileArray.length} fichier(s) enregistrés dans Supabase !)`,
      percent: 100,
      error: "",
      successCount: succ,
    });

    await loadData();
  };

  const handleDelete = async (item: PortfolioItem) => {
    if (!confirm(`Confirmer la suppression du média "${item.public_id || item.id}" de Supabase ?`)) return;

    const { error } = await deletePortfolioItem(item.id);
    if (error) {
      console.error("Échec de la suppression Supabase:", error);
      alert("Erreur lors de la suppression de Supabase. Vérifie la console.");
    } else {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  const filteredItems = activeFilter === "all" ? items : items.filter((i) => i.section === activeFilter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Sparkles className="text-accent" size={24} />
            Gestionnaire de Médias Supabase
          </h2>
          <p className="mt-1 text-sm text-dim">
            Téléverse des photos/vidéos enregistrées directement dans la table Supabase <code className="text-accent">portfolio</code>.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-black shadow-lg transition-transform hover:scale-105"
        >
          <Plus size={18} />
          Ajouter au Portfolio Supabase
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* Target Category Selector Card */}
      <div className="glass-strong rounded-3xl p-6 border border-white/10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-dim mb-4 flex items-center gap-2">
          <Layers size={14} className="text-accent" />
          1. Sélectionne la Catégorie Supabase avant de téléverser :
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSection(sec.id)}
              className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 ${
                selectedSection === sec.id
                  ? "border-accent bg-accent/15 shadow-[0_0_20px_-5px_rgba(212,243,74,0.4)]"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`font-display font-bold text-sm ${selectedSection === sec.id ? "text-accent" : "text-foreground"}`}>
                  {sec.label}
                </span>
                {selectedSection === sec.id && <CheckCircle2 size={16} className="text-accent" />}
              </div>
              <span className="text-xs text-dim leading-relaxed">{sec.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Status Card */}
      {uploadStatus.isUploading && (
        <div className="rounded-3xl border border-accent/40 bg-accent/10 p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs font-bold text-accent mb-1">
                <span className="truncate">Progression : {uploadStatus.currentFile}</span>
                <span>{uploadStatus.percent}%</span>
              </div>
              <p className="text-xs text-foreground/90">{uploadStatus.message}</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${uploadStatus.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadStatus.error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-400">
          {uploadStatus.error}
        </div>
      )}

      {uploadStatus.message && !uploadStatus.isUploading && (
        <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-4 text-xs text-green-400 flex items-center justify-between">
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* Filter Tabs & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
              activeFilter === "all" ? "bg-accent text-black" : "glass text-dim hover:text-foreground"
            }`}
          >
            Tous ({items.length})
          </button>
          {SECTIONS.map((sec) => {
            const count = items.filter((i) => i.section === sec.id).length;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveFilter(sec.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  activeFilter === sec.id ? "bg-accent text-black" : "glass text-dim hover:text-foreground"
                }`}
              >
                {sec.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center gap-3 text-dim">
          <Loader2 size={24} className="animate-spin text-accent" />
          <span>Chargement des données depuis Supabase...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-strong flex h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 p-6 text-center text-dim">
          <ImageIcon size={32} className="mb-2 text-dim/50" />
          <p className="text-sm font-semibold">Aucun média enregistré dans Supabase pour cette section.</p>
          <p className="text-xs text-dim/70 mt-1">Sélectionne une catégorie ci-dessus et clique sur "Ajouter au Portfolio Supabase".</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item) => {
            const isVideo = item.url.match(/\.(mp4|webm|mov|avi)($|\?)/i) || item.section === "shorts_reels" || item.section === "video";
            return (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-md transition-all hover:border-accent/50"
              >
                {isVideo ? (
                  <video
                    src={item.url}
                    className="h-full w-full object-cover"
                    muted
                    loop
                    onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                    onMouseOut={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.public_id || "Media Supabase"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                {/* Section Badge */}
                <span className="absolute top-2 left-2 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent border border-accent/30">
                  {item.section}
                </span>

                {/* Overlay Action Controls */}
                <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex justify-end">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40"
                      title="Ouvrir dans un nouvel onglet"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div>
                    <p className="text-[10px] text-dim truncate mb-2">{item.public_id || `ID: ${item.id}`}</p>
                    <button
                      onClick={() => handleDelete(item)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-red-500/90 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-600"
                    >
                      <Trash2 size={13} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
