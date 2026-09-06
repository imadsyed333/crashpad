import { MAX_MEDIA_BYTES, putMediaBlob } from "./storage";
import type { MediaType } from "./types";

export type MediaPayload = {
  uri: string;
  type: MediaType;
  thumbnailUri?: string;
};

const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "mov",
  "m4v",
  "avi",
  "mkv",
  "webm",
  "3gp",
  "3g2",
]);

export function getMediaType(media: { type?: MediaType } | null | undefined): MediaType {
  return media?.type === "video" ? "video" : "image";
}

function extensionFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  const withoutQuery = path.split("?")[0] ?? path;
  const match = withoutQuery.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export function resolveMediaType(file: File): MediaType {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("image/")) return "image";
  const ext = extensionFromPath(file.name);
  if (ext && VIDEO_EXTENSIONS.has(ext)) return "video";
  return "image";
}

export function assertAcceptableFile(file: File): void {
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    throw new Error("Only photos and videos can be attached.");
  }
  if (file.size > MAX_MEDIA_BYTES) {
    throw new Error("File is too large (50 MB limit).");
  }
}

async function grabVideoThumbnail(file: File): Promise<ArrayBuffer | null> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("Could not read video"));
    });
    video.currentTime = 0;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      setTimeout(resolve, 400);
    });
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 180;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.6),
    );
    if (!blob) return null;
    return blob.arrayBuffer();
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function createMediaFromFile(file: File): Promise<MediaPayload> {
  assertAcceptableFile(file);
  const type = resolveMediaType(file);
  const id = crypto.randomUUID();
  await putMediaBlob(id, await file.arrayBuffer());

  if (type === "image") {
    return { uri: id, type };
  }

  const thumb = await grabVideoThumbnail(file);
  if (!thumb) return { uri: id, type };
  const thumbId = crypto.randomUUID();
  await putMediaBlob(thumbId, thumb);
  return { uri: id, type, thumbnailUri: thumbId };
}
