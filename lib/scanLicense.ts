"use client";

import { jpegToPdf } from "./jpegPdf";
import { parseLicenseText, type LicenseScanResult } from "./licenseScan";

// ponytail: long edge capped at 1600px so on-device OCR stays bounded.
// Upgrade: keep the full frame when the card is a small part of the photo.
const MAX_EDGE = 1600;

type OcrWord = {
  text?: string;
  confidence?: number;
  bbox?: { x0: number; y0: number; x1: number; y1: number };
};

type OcrPage = {
  blocks?: Array<{
    paragraphs?: Array<{
      lines?: Array<{ words?: OcrWord[] }>;
    }>;
  }> | null;
};

type Parser = {
  parse: (data: Uint8Array) => Promise<{ text: string }>;
};

let session: Promise<Parser> | null = null;

async function photoToJpeg(file: File): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not read that photo");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) throw new Error("Could not read that photo");
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
  } finally {
    bitmap.close();
  }
}

function wordBoxes(page: OcrPage) {
  return (page.blocks ?? []).flatMap((block) =>
    (block.paragraphs ?? []).flatMap((paragraph) =>
      (paragraph.lines ?? []).flatMap((line) => line.words ?? []),
    ),
  ).flatMap((word) => {
    const text = word.text?.trim() ?? "";
    if (!text || !word.bbox) return [];
    const { x0, y0, x1, y1 } = word.bbox;
    return [{ text, bbox: [x0, y0, x1, y1] as [number, number, number, number], confidence: (word.confidence ?? 0) / 100 }];
  });
}

async function startSession(): Promise<Parser> {
  const [{ default: init, LiteParse }, { createWorker, OEM }] = await Promise.all([
    import("@llamaindex/liteparse-wasm"),
    import("tesseract.js"),
  ]);
  await init(new URL("@llamaindex/liteparse-wasm/liteparse_wasm_bg.wasm", import.meta.url));
  // Same-origin worker. workerBlobURL stays off so worker-src 'self' is enough.
  const worker = await createWorker("eng", OEM.LSTM_ONLY, {
    workerPath: "/ocr/worker.min.js",
    corePath: "/ocr",
    langPath: "/ocr",
    gzip: false,
    workerBlobURL: false,
  });
  return new LiteParse({
    ocrEnabled: true,
    ocrLanguage: "eng",
    // Page units are pixels, so 72 DPI renders the drawn photo 1:1.
    dpi: 72,
    maxPages: 1,
    quiet: true,
    ocrEngine: {
      async recognize(imageData: Uint8Array) {
        const png = new Uint8Array(imageData);
        const { data } = await worker.recognize(new Blob([png], { type: "image/png" }), {}, { blocks: true });
        return wordBoxes(data);
      },
    },
  });
}

function getParser(): Promise<Parser> {
  if (!session) {
    session = startSession().catch((error: unknown) => {
      session = null;
      throw error;
    });
  }
  return session;
}

export async function scanDriverLicense(file: File): Promise<LicenseScanResult> {
  const { bytes, width, height } = await photoToJpeg(file);
  const parser = await getParser();
  const result = await parser.parse(jpegToPdf(bytes, width, height));
  return parseLicenseText(result.text);
}
