import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Worker + LSTM cores come from node_modules so they match tesseract.js.
// eng.traineddata.gz is not on npm — keep the LSTM 4.0.0 English file in public/ocr/lang.
const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ocrDir = join(root, "public/ocr");
const coreDir = join(ocrDir, "core");
const trained = join(ocrDir, "lang/eng.traineddata.gz");

const cores = [
  "tesseract-core-lstm.wasm.js",
  "tesseract-core-simd-lstm.wasm.js",
  "tesseract-core-relaxedsimd-lstm.wasm.js",
];

mkdirSync(coreDir, { recursive: true });
copyFileSync(require.resolve("tesseract.js/dist/worker.min.js"), join(ocrDir, "worker.min.js"));

const corePkg = dirname(require.resolve("tesseract.js-core/package.json"));
for (const name of cores) {
  const src = join(corePkg, name);
  if (!existsSync(src)) {
    console.error(`vendor-ocr: missing ${name} in tesseract.js-core`);
    process.exit(1);
  }
  copyFileSync(src, join(coreDir, name));
}

if (!existsSync(trained)) {
  console.error("vendor-ocr: missing public/ocr/lang/eng.traineddata.gz");
  process.exit(1);
}

console.log("vendor-ocr: worker, LSTM cores, eng.traineddata.gz");
