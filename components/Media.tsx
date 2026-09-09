"use client";

/* blob: URLs from encrypted IDB — next/image cannot optimize these */
/* eslint-disable @next/next/no-img-element */

import { createMediaFromFile, fallbackMimeType } from "@/lib/media";
import { getMediaBlob } from "@/lib/storage";
import { Media } from "@/lib/types";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { Camera, Images, Play, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function useObjectUrl(id?: string, mimeType?: string) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    let revoked = false;
    let objectUrl: string | null = null;
    getMediaBlob(id).then((buffer) => {
      if (!buffer || revoked) return;
      objectUrl = URL.createObjectURL(new Blob([buffer], mimeType ? { type: mimeType } : {}));
      setUrl(objectUrl);
    });
    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, mimeType]);
  return url;
}

function MediaThumb({ media, onOpen }: { media: Media; onOpen: () => void }) {
  const hasThumb = Boolean(media.thumbnailUri);
  const previewId = hasThumb ? media.thumbnailUri : media.uri;
  const previewMime = hasThumb ? "image/jpeg" : fallbackMimeType(media);
  const url = useObjectUrl(previewId, previewMime);
  const showVideo = media.type === "video" && !hasThumb;
  return (
    <button
      type="button"
      className="media-thumb-btn"
      onClick={onOpen}
      aria-label={media.type === "video" ? "Play video" : "View photo"}
    >
      {url && showVideo ? (
        <video className="media-thumb" src={url} muted playsInline preload="metadata" />
      ) : url ? (
        <img className="media-thumb" src={url} alt="" />
      ) : (
        <div className="media-thumb" aria-hidden />
      )}
      {media.type === "video" && (
        <span className="media-play" aria-hidden>
          <Play fill="currentColor" />
        </span>
      )}
    </button>
  );
}

function MediaViewer({ media, onClose }: { media: Media; onClose: () => void }) {
  const url = useObjectUrl(media.uri, fallbackMimeType(media));
  const keepOpen = (e: { stopPropagation: () => void }) => e.stopPropagation();
  return (
    <div className="viewer" onClick={onClose}>
      <button type="button" className="icon-btn viewer-close" onClick={onClose} aria-label="Close">
        <X />
      </button>
      {url && media.type === "video" ? (
        <video src={url} controls playsInline onClick={keepOpen} />
      ) : url ? (
        <img src={url} alt="" onClick={keepOpen} />
      ) : (
        <p className="muted">Loading…</p>
      )}
    </div>
  );
}

export function MediaOptions() {
  const { addMedia } = useCollisionFormStore();
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  const attachFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      let attached = 0;
      for (const file of Array.from(files)) {
        try {
          addMedia(await createMediaFromFile(file));
          attached += 1;
        } catch {
          // skip unreadable files
        }
      }
      if (attached === 0) {
        setAlert("None of the selected files could be attached.");
      }
    } catch {
      setAlert("The selected file could not be attached.");
    } finally {
      setBusy(false);
      if (cameraRef.current) cameraRef.current.value = "";
      if (libraryRef.current) libraryRef.current.value = "";
    }
  };

  return (
    <div className="card">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        hidden
        onChange={(e) => void attachFiles(e.target.files)}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => void attachFiles(e.target.files)}
      />
      <div className="btn-row" style={{ marginTop: 0 }}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          aria-label="Open camera"
          onClick={() => cameraRef.current?.click()}
        >
          <Camera />
          Camera
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          aria-label="Open media library"
          onClick={() => libraryRef.current?.click()}
        >
          <Images />
          Library
        </button>
      </div>
      {alert && <p className="errors">{alert}</p>}
    </div>
  );
}

export function MediaGrid({ media, showActions = false }: { media: Media[]; showActions?: boolean }) {
  const { deleteMedia } = useCollisionFormStore();
  const [open, setOpen] = useState<Media | null>(null);

  if (media.length === 0) {
    return (
      <div className="card empty">
        <h3>No media added</h3>
        <p>No photos or videos have been attached to this collision yet.</p>
        <p className="hint">Use Camera or Library to add photos or videos</p>
      </div>
    );
  }

  return (
    <>
      <div className="media-grid">
        {media.map((item) => (
          <div key={item.id} style={{ position: "relative" }}>
            <MediaThumb media={item} onOpen={() => setOpen(item)} />
            {showActions && (
              <button
                type="button"
                className="icon-btn danger"
                aria-label="Delete media"
                style={{ position: "absolute", top: 4, right: 4, background: "var(--surface)" }}
                onClick={() => deleteMedia(item.id)}
              >
                <Trash2 />
              </button>
            )}
          </div>
        ))}
      </div>
      {open && <MediaViewer media={open} onClose={() => setOpen(null)} />}
    </>
  );
}
