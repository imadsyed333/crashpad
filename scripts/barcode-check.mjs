import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// node --experimental-strip-types does not resolve extensionless imports.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { pickDetector, zxingWasmUrl } = await import("../lib/barcode.ts");

const wasm = { name: "wasm" };
const withPdf417 = {
  name: "native",
  getSupportedFormats: async () => ["qr_code", "pdf417"],
};
assert.equal(await pickDetector(withPdf417, wasm), withPdf417);
assert.equal(await pickDetector({ getSupportedFormats: async () => ["qr_code"] }, wasm), wasm);
assert.equal(
  await pickDetector({ getSupportedFormats: async () => { throw new Error("nope"); } }, wasm),
  wasm,
);
assert.equal(await pickDetector(undefined, wasm), wasm);

assert.equal(zxingWasmUrl("zxing_reader.wasm", "https://cdn.example/"), "/zxing/zxing_reader.wasm");
assert.equal(zxingWasmUrl("other.js", "https://cdn.example/"), "https://cdn.example/other.js");

console.log("barcode-check: native pdf417 wins, else WASM; wasm url is same-origin");
