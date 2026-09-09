import { putMediaBlob } from "./storage";
import {
  assertAcceptableFile,
  mimeTypeForFile,
  resolveMediaType,
} from "./mediaType";
import type { MediaType } from "./types";

export type MediaPayload = {
  uri: string;
  type: MediaType;
  thumbnailUri?: string;
  mimeType?: string;
};

export {
  assertAcceptableFile,
  fallbackMimeType,
  getMediaType,
  mimeTypeForFile,
  resolveMediaType,
} from "./mediaType";

async function grabVideoThumbnail(file: File, mimeType: string): Promise<ArrayBuffer | null> {
  const source = file.type.startsWith("video/") ? file : new Blob([file], { type: mimeType });
  const url = URL.createObjectURL(source);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  // ponytail: iOS won't decode a detached <video>; opacity:0 (not display:none) + in-DOM
  video.style.cssText = "position:fixed;opacity:0;pointer-events:none;width:1px;height:1px";
  try {
    document.body.appendChild(video);
    video.src = url;
    video.load();
    await new Promise<void>((resolve, reject) => {
      // ponytail: 2s metadata ceiling; upgrade: generate thumb after attach
      const t = setTimeout(() => reject(new Error("timeout")), 2000);
      video.onloadedmetadata = () => {
        clearTimeout(t);
        resolve();
      };
      video.onerror = () => {
        clearTimeout(t);
        reject(new Error("Could not read video"));
      };
    });
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    video.currentTime = duration > 0.1 ? 0.1 : 0;
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
    video.removeAttribute("src");
    video.load();
    video.remove();
    URL.revokeObjectURL(url);
  }
}

export async function createMediaFromFile(file: File): Promise<MediaPayload> {
  assertAcceptableFile(file);
  const type = resolveMediaType(file);
  const mimeType = mimeTypeForFile(file);
  const id = crypto.randomUUID();
  await putMediaBlob(id, await file.arrayBuffer());

  if (type === "image") {
    return { uri: id, type, mimeType };
  }

  const thumb = await grabVideoThumbnail(file, mimeType);
  if (!thumb) return { uri: id, type, mimeType };
  const thumbId = crypto.randomUUID();
  await putMediaBlob(thumbId, thumb);
  return { uri: id, type, mimeType, thumbnailUri: thumbId };
}
