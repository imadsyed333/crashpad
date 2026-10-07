import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { serwist } from "@serwist/next/config";

function shellRevision() {
  try {
    return readFileSync(".next/BUILD_ID", "utf8").trim();
  } catch {
    return "dev";
  }
}

function liteparseWasmEntries() {
  const dir = ".next/static/media";
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  return names
    .filter((name) => name.startsWith("liteparse_wasm_bg") && name.endsWith(".wasm"))
    .sort()
    .map((name) => ({ url: `/_next/static/media/${name}`, revision: null }));
}

function ocrPrecacheEntries() {
  const dir = "public/ocr";
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    throw new Error("public/ocr is missing. Run node scripts/vendor-ocr.mjs");
  }
  return names
    .filter((name) => !name.startsWith("."))
    .sort()
    .map((name) => ({
      url: `/ocr/${name}`,
      revision: createHash("sha256").update(readFileSync(join(dir, name))).digest("hex").slice(0, 16),
    }));
}

export default serwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // public/** is precached by default; these entries are the explicit OCR set.
  globIgnores: ["public/ocr/**"],
  additionalPrecacheEntries: [
    { url: "/", revision: shellRevision() },
    ...ocrPrecacheEntries(),
    ...liteparseWasmEntries(),
  ],
});
