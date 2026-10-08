import { describe, expect, it } from "vitest";
import {
  base64ToBytes,
  bytesToBase64,
  decryptText,
  encryptText,
  generateDataKey,
  generateWrappingKey,
  unwrapDataKey,
  wrapDataKey,
} from "./crypto";

describe("crypto", () => {
  it("encrypts and decrypts text", async () => {
    const key = await generateDataKey();
    const packed = await encryptText(key, "a car ran a red light");
    expect(await decryptText(key, packed)).toBe("a car ran a red light");
  });

  it("rejects tampered ciphertext", async () => {
    const key = await generateDataKey();
    const packed = await encryptText(key, "secret");
    const tampered = packed.slice();
    tampered[20] ^= 0xff;
    await expect(decryptText(key, tampered)).rejects.toThrow();
  });

  it("round-trips bytes through base64", () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 255]);
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });

  it("wraps and unwraps a data key", async () => {
    const wrappingKey = await generateWrappingKey();
    const dataKey = await generateDataKey();
    const wrapped = await wrapDataKey(wrappingKey, dataKey);
    const unwrapped = await unwrapDataKey(wrappingKey, wrapped);
    const packed = await encryptText(unwrapped, "round-trip");
    expect(await decryptText(unwrapped, packed)).toBe("round-trip");
  });
});
