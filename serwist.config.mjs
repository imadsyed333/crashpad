import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { serwist } from "@serwist/next/config";

function shellRevision() {
  try {
    return readFileSync(".next/BUILD_ID", "utf8").trim();
  } catch {
    return "dev";
  }
}

function wasmRevision() {
  return createHash("sha256").update(readFileSync("public/zxing/zxing_reader.wasm")).digest("hex");
}

export default serwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  globIgnores: ["public/zxing/**"],
  additionalPrecacheEntries: [
    { url: "/", revision: shellRevision() },
    { url: "/zxing/zxing_reader.wasm", revision: wasmRevision() },
  ],
});
