import type { StateStorage } from "zustand/middleware";
import {
  decryptBytes,
  decryptText,
  encryptBytes,
  encryptText,
  generateDataKey,
  generateWrappingKey,
  unwrapDataKey,
  wrapDataKey,
} from "./crypto";
import { MAX_MEDIA_BYTES } from "./mediaType";

export { MAX_MEDIA_BYTES };

export const DB_NAME = "crashpad-storage";
const DB_VERSION = 1;
const KV_STORE = "kv";
const MEDIA_STORE = "media";
const META_STORE = "meta";
const WRAP_KEY_ID = "wrapping-key";
const WRAPPED_DATA_KEY_ID = "wrapped-data-key";

let dataKey: CryptoKey | null = null;
let ready = false;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE);
      if (!db.objectStoreNames.contains(MEDIA_STORE)) db.createObjectStore(MEDIA_STORE);
      if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE);
    };
  });
}

function idbReq<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function metaGet(key: string): Promise<unknown> {
  const db = await openDb();
  try {
    return await idbReq(db.transaction(META_STORE).objectStore(META_STORE).get(key));
  } finally {
    db.close();
  }
}

async function metaPut(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  try {
    await idbReq(db.transaction(META_STORE, "readwrite").objectStore(META_STORE).put(value, key));
  } finally {
    db.close();
  }
}

async function kvGet(key: string): Promise<ArrayBuffer | undefined> {
  const db = await openDb();
  try {
    return await idbReq(
      db.transaction(KV_STORE).objectStore(KV_STORE).get(key),
    ) as ArrayBuffer | undefined;
  } finally {
    db.close();
  }
}

async function kvPut(key: string, value: ArrayBuffer): Promise<void> {
  const db = await openDb();
  try {
    await idbReq(db.transaction(KV_STORE, "readwrite").objectStore(KV_STORE).put(value, key));
  } finally {
    db.close();
  }
}

async function kvDelete(key: string): Promise<void> {
  const db = await openDb();
  try {
    await idbReq(db.transaction(KV_STORE, "readwrite").objectStore(KV_STORE).delete(key));
  } finally {
    db.close();
  }
}

function requireKey(): CryptoKey {
  if (!dataKey) {
    throw new Error("Storage has not been initialized. Call initializeSecureStorage first.");
  }
  return dataKey;
}

export async function initializeSecureStorage(): Promise<void> {
  if (ready && dataKey) return;

  let wrappingKey = (await metaGet(WRAP_KEY_ID)) as CryptoKey | undefined;
  let wrapped = (await metaGet(WRAPPED_DATA_KEY_ID)) as ArrayBuffer | undefined;

  if (!wrappingKey || !wrapped) {
    wrappingKey = await generateWrappingKey();
    const fresh = await generateDataKey();
    wrapped = await wrapDataKey(wrappingKey, fresh);
    await metaPut(WRAP_KEY_ID, wrappingKey);
    await metaPut(WRAPPED_DATA_KEY_ID, wrapped);
    dataKey = await unwrapDataKey(wrappingKey, wrapped);
  } else {
    dataKey = await unwrapDataKey(wrappingKey, wrapped);
  }

  ready = true;
}

export function getSecureStorage(): StateStorage {
  return secureStorage;
}

export const secureStorage: StateStorage = {
  setItem: async (name, value) => {
    const packed = await encryptText(requireKey(), value);
    await kvPut(name, packed.buffer as ArrayBuffer);
  },
  getItem: async (name) => {
    const packed = await kvGet(name);
    if (!packed) return null;
    return decryptText(requireKey(), packed);
  },
  removeItem: async (name) => {
    await kvDelete(name);
  },
};

export const persistStorage = () => secureStorage;

export const persistReviver = (key: string, value: unknown) => {
  if (key === "date" && typeof value === "string") return new Date(value);
  return value;
};

export async function putMediaBlob(id: string, data: ArrayBuffer): Promise<void> {
  if (data.byteLength > MAX_MEDIA_BYTES) {
    throw new Error("File is too large (50 MB limit).");
  }
  // ponytail: single-shot AES-GCM up to 50 MB; upgrade: 1 MB chunks with per-chunk IVs
  const packed = await encryptBytes(requireKey(), data);
  const db = await openDb();
  try {
    await idbReq(
      db.transaction(MEDIA_STORE, "readwrite").objectStore(MEDIA_STORE).put(packed.buffer, id),
    );
  } finally {
    db.close();
  }
}

export async function getMediaBlob(id: string): Promise<ArrayBuffer | null> {
  const db = await openDb();
  try {
    const packed = (await idbReq(
      db.transaction(MEDIA_STORE).objectStore(MEDIA_STORE).get(id),
    )) as ArrayBuffer | undefined;
    if (!packed) return null;
    const plain = await decryptBytes(requireKey(), packed);
    return plain.buffer.slice(plain.byteOffset, plain.byteOffset + plain.byteLength) as ArrayBuffer;
  } finally {
    db.close();
  }
}

export async function deleteMediaBlob(id: string): Promise<void> {
  const db = await openDb();
  try {
    await idbReq(db.transaction(MEDIA_STORE, "readwrite").objectStore(MEDIA_STORE).delete(id));
  } finally {
    db.close();
  }
}

export async function deleteAllCrashPadData(): Promise<void> {
  dataKey = null;
  ready = false;
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
  if (typeof caches !== "undefined") {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

function isInstalledPwa(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as { standalone?: boolean }).standalone)
  );
}

export async function isStorageDurable(): Promise<boolean> {
  // Installed PWAs keep site data even when persisted() is still false
  // (Safari/iOS never grants it; Chrome often waits until persist() is called).
  if (isInstalledPwa()) {
    try {
      await navigator.storage?.persist?.();
    } catch {
      /* persist is best-effort */
    }
    return true;
  }
  if (!navigator.storage?.persisted && !navigator.storage?.persist) return true;
  try {
    if (await navigator.storage.persisted?.()) return true;
    return (await navigator.storage.persist?.()) ?? true;
  } catch {
    return false;
  }
}
