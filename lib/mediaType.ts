import type { MediaType } from "./types";

export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

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

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "heic",
  "heif",
  "bmp",
  "avif",
]);

const MIME_BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  bmp: "image/bmp",
  avif: "image/avif",
};

function extensionFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  const withoutQuery = path.split("?")[0] ?? path;
  const match = withoutQuery.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function isGenericMime(type: string): boolean {
  return type === "" || type === "application/octet-stream";
}

export function resolveMediaType(file: File): MediaType {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("image/")) return "image";
  const ext = extensionFromPath(file.name);
  if (ext && VIDEO_EXTENSIONS.has(ext)) return "video";
  return "image";
}

export function mimeTypeForFile(file: File): string {
  if (file.type.startsWith("video/") || file.type.startsWith("image/")) return file.type;
  const ext = extensionFromPath(file.name);
  if (ext && MIME_BY_EXTENSION[ext]) return MIME_BY_EXTENSION[ext];
  return resolveMediaType(file) === "video" ? "video/mp4" : "image/jpeg";
}

export function fallbackMimeType(media: { type?: MediaType; mimeType?: string }): string {
  if (media.mimeType) return media.mimeType;
  return media.type === "video" ? "video/mp4" : "image/jpeg";
}

export function getMediaType(media: { type?: MediaType } | null | undefined): MediaType {
  return media?.type === "video" ? "video" : "image";
}

export function assertAcceptableFile(file: File): void {
  const ext = extensionFromPath(file.name);
  const typed = file.type.startsWith("image/") || file.type.startsWith("video/");
  const byExt =
    isGenericMime(file.type) &&
    !!ext &&
    (VIDEO_EXTENSIONS.has(ext) || IMAGE_EXTENSIONS.has(ext));
  if (!typed && !byExt) {
    throw new Error("Only photos and videos can be attached.");
  }
  if (file.size > MAX_MEDIA_BYTES) {
    throw new Error("File is too large (50 MB limit).");
  }
}
