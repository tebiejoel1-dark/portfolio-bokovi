"use client";

import type { MediaKind } from "./types";

export const CLOUDINARY_CONFIG = {
  cloudName: "ukz8metd",
  uploadPreset: "charlie",
  tag: "portfolio_client_1",
  uploadUrl: "https://api.cloudinary.com/v1_1/ukz8metd/auto/upload",
};

export interface CloudinaryUploadResult {
  url: string;
  kind: MediaKind;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
}

export type ProgressCallback = (status: {
  phase: "compressing" | "uploading" | "done" | "error";
  message: string;
  progressPercent?: number;
}) => void;

/**
 * Compresse l'image si nécessaire (WebP, max 2560px, 85% qualité, target 1.5Mo)
 * ou contourne pour les vidéos, puis effectue l'envoi direct à Cloudinary (preset 'charlie').
 */
export async function uploadMediaToCloudinary(
  file: File,
  onProgress?: ProgressCallback
): Promise<CloudinaryUploadResult> {
  const isVideo = file.type.startsWith("video/");
  let fileToUpload: File | Blob = file;

  if (!isVideo) {
    onProgress?.({
      phase: "compressing",
      message: `Compression client de "${file.name}" (WebP HD max 2560px)...`,
      progressPercent: 20,
    });

    try {
      const imageCompressionModule = await import("browser-image-compression");
      const imageCompression = imageCompressionModule.default || imageCompressionModule;

      const options = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2560,
        fileType: "image/webp",
        initialQuality: 0.85,
        useWebWorker: true,
      };

      const compressedBlob = await imageCompression(file, options);
      const webpFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
      fileToUpload = new File([compressedBlob], webpFileName, {
        type: "image/webp",
      });

      onProgress?.({
        phase: "compressing",
        message: `Image compressée (${(fileToUpload.size / (1024 * 1024)).toFixed(2)} Mo).`,
        progressPercent: 50,
      });
    } catch (err) {
      console.warn("Erreur lors de la compression WebP, envoi du fichier d'origine:", err);
      fileToUpload = file;
    }
  } else {
    onProgress?.({
      phase: "uploading",
      message: `Préparation de la vidéo "${file.name}"...`,
      progressPercent: 40,
    });
  }

  onProgress?.({
    phase: "uploading",
    message: `Téléversement vers Cloudinary (preset: ${CLOUDINARY_CONFIG.uploadPreset})...`,
    progressPercent: 60,
  });

  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("tags", CLOUDINARY_CONFIG.tag);

  const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    onProgress?.({
      phase: "error",
      message: `Échec du téléversement vers Cloudinary : ${response.statusText}`,
    });
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }

  const data = await response.json();
  const kind: MediaKind =
    data.resource_type === "video" || isVideo ? "video" : "photo";

  onProgress?.({
    phase: "done",
    message: "Téléversement Cloudinary réussi !",
    progressPercent: 100,
  });

  return {
    url: data.secure_url,
    kind,
    publicId: data.public_id || "",
    format: data.format,
    width: data.width,
    height: data.height,
  };
}
