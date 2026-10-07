import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ZXING_WASM_SHA256 } from "zxing-wasm/reader";

const require = createRequire(import.meta.url);
const destDir = join(dirname(fileURLToPath(import.meta.url)), "../public/zxing");
const dest = join(destDir, "zxing_reader.wasm");

mkdirSync(destDir, { recursive: true });
copyFileSync(require.resolve("zxing-wasm/reader/zxing_reader.wasm"), dest);

const hash = createHash("sha256").update(readFileSync(dest)).digest("hex");
if (hash !== ZXING_WASM_SHA256) {
  throw new Error(`zxing_reader.wasm SHA-256 ${hash} != ${ZXING_WASM_SHA256}`);
}
