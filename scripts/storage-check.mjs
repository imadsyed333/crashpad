import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";

const subtle = webcrypto.subtle;

const wrappingKey = await subtle.generateKey({ name: "AES-KW", length: 256 }, false, [
  "wrapKey",
  "unwrapKey",
]);
const dataKey = await subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
  "encrypt",
  "decrypt",
]);
const wrapped = await subtle.wrapKey("raw", dataKey, wrappingKey, "AES-KW");
const unwrapped = await subtle.unwrapKey(
  "raw",
  wrapped,
  wrappingKey,
  "AES-KW",
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt", "decrypt"],
);

const collision = JSON.stringify({
  id: "test-1",
  date: "2024-06-01T12:00:00.000Z",
  location: { description: "near Jane and Finch", coordinates: { latitude: 43.7, longitude: -79.5 } },
  description: "A car ran a red light",
  vehicles: [],
  media: [],
  witnesses: [],
  officer: null,
});

const iv = webcrypto.getRandomValues(new Uint8Array(12));
const cipher = await subtle.encrypt(
  { name: "AES-GCM", iv },
  unwrapped,
  new TextEncoder().encode(collision),
);
const packed = new Uint8Array(iv.length + cipher.byteLength);
packed.set(iv, 0);
packed.set(new Uint8Array(cipher), iv.length);

const plain = await subtle.decrypt(
  { name: "AES-GCM", iv: packed.subarray(0, 12) },
  unwrapped,
  packed.subarray(12),
);
const roundTrip = JSON.parse(new TextDecoder().decode(plain));
assert.equal(roundTrip.id, "test-1");
assert.equal(roundTrip.description, "A car ran a red light");
assert.equal(roundTrip.location.coordinates.latitude, 43.7);

const tampered = packed.slice();
tampered[20] ^= 0xff;
await assert.rejects(() =>
  subtle.decrypt({ name: "AES-GCM", iv: tampered.subarray(0, 12) }, unwrapped, tampered.subarray(12)),
);

console.log("storage-check: encrypt/decrypt + key wrap round-trip ok");
