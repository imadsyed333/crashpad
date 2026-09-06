const IV_LENGTH = 12;

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("Web Crypto is not available");
  return subtle;
}

export async function generateDataKey(): Promise<CryptoKey> {
  return getSubtle().generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function generateWrappingKey(): Promise<CryptoKey> {
  return getSubtle().generateKey({ name: "AES-KW", length: 256 }, false, [
    "wrapKey",
    "unwrapKey",
  ]);
}

export async function wrapDataKey(
  wrappingKey: CryptoKey,
  dataKey: CryptoKey,
): Promise<ArrayBuffer> {
  return getSubtle().wrapKey("raw", dataKey, wrappingKey, "AES-KW");
}

export async function unwrapDataKey(
  wrappingKey: CryptoKey,
  wrapped: BufferSource,
): Promise<CryptoKey> {
  return getSubtle().unwrapKey(
    "raw",
    wrapped,
    wrappingKey,
    "AES-KW",
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptBytes(
  key: CryptoKey,
  plaintext: BufferSource,
): Promise<Uint8Array> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const cipher = await getSubtle().encrypt({ name: "AES-GCM", iv }, key, plaintext);
  const packed = new Uint8Array(iv.length + cipher.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(cipher), iv.length);
  return packed;
}

export async function decryptBytes(
  key: CryptoKey,
  packed: BufferSource,
): Promise<Uint8Array> {
  const bytes = packed instanceof ArrayBuffer
    ? new Uint8Array(packed)
    : new Uint8Array(packed.buffer, packed.byteOffset, packed.byteLength);
  const iv = bytes.subarray(0, IV_LENGTH);
  const cipher = bytes.subarray(IV_LENGTH);
  const plain = await getSubtle().decrypt({ name: "AES-GCM", iv }, key, cipher);
  return new Uint8Array(plain);
}

export async function encryptText(key: CryptoKey, text: string): Promise<Uint8Array> {
  return encryptBytes(key, new TextEncoder().encode(text));
}

export async function decryptText(key: CryptoKey, packed: BufferSource): Promise<string> {
  return new TextDecoder().decode(await decryptBytes(key, packed));
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
