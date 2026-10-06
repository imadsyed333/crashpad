import { parseLicenseText, type LicenseFields } from "./licenseParse";

export type OcrOutcome =
  | { ok: true; fields: LicenseFields }
  | { ok: false; error: string };

const MAX_WIDTH = 1600;

type TessWorker = {
  recognize: (image: HTMLCanvasElement) => Promise<{ data: { text: string } }>;
  terminate: () => Promise<unknown>;
};

let pending: Promise<TessWorker> | null = null;

function getWorker(): Promise<TessWorker> {
  if (!pending) {
    pending = import("tesseract.js").then(({ createWorker }) =>
      createWorker("eng", 1, {
        workerPath: "/ocr/worker.min.js",
        corePath: "/ocr/core",
        langPath: "/ocr/lang",
        workerBlobURL: false,
        gzip: true,
        cacheMethod: "none",
        errorHandler: () => {},
      }),
    );
  }
  return pending;
}

export async function terminateLicenseWorker(): Promise<void> {
  const job = pending;
  pending = null;
  if (!job) return;
  try {
    const worker = await job;
    await worker.terminate();
  } catch {
    // boot failed or the worker is already gone
  }
}

function loadCanvas(file: Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (!img.naturalWidth || !img.naturalHeight) {
        reject(new Error("decode"));
        return;
      }
      const scale = Math.min(1, MAX_WIDTH / img.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = image.data;
      for (let i = 0; i < data.length; i += 4) {
        const y = (data[i]! * 0.299 + data[i + 1]! * 0.587 + data[i + 2]! * 0.114) | 0;
        data[i] = data[i + 1] = data[i + 2] = y;
      }
      ctx.putImageData(image, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

export async function readLicense(file: Blob): Promise<OcrOutcome> {
  // ponytail: phone photos of glossy bilingual Ontario cards will misread.
  // The user reviews fields before Save. Upgrade path: PDF417 on the back, or a larger rec model.
  let canvas: HTMLCanvasElement;
  try {
    canvas = await loadCanvas(file);
  } catch {
    return { ok: false, error: "Couldn't read that photo. Try a JPEG from the camera." };
  }
  try {
    const worker = await getWorker();
    const { data } = await worker.recognize(canvas);
    return parseLicenseText(data.text);
  } catch {
    await terminateLicenseWorker();
    return { ok: false, error: "Licence scan failed. Enter the fields yourself." };
  }
}
