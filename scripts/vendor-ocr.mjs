import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public/ocr");
mkdirSync(out, { recursive: true });

copyFileSync(join(root, "node_modules/tesseract.js/dist/worker.min.js"), join(out, "worker.min.js"));

// LSTM cores only: createWorker uses OEM.LSTM_ONLY, and the browser picks one of these three.
for (const name of [
  "tesseract-core-lstm.wasm.js",
  "tesseract-core-simd-lstm.wasm.js",
  "tesseract-core-relaxedsimd-lstm.wasm.js",
]) {
  copyFileSync(join(root, "node_modules/tesseract.js-core", name), join(out, name));
}

const trained = gunzipSync(
  readFileSync(join(root, "node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz")),
);
writeFileSync(join(out, "eng.traineddata"), trained);
