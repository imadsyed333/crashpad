export type DetectedBarcode = { rawValue: string };

export type DetectSource = HTMLVideoElement | HTMLCanvasElement;

export type Pdf417Detector = {
  detect: (source: DetectSource) => Promise<DetectedBarcode[]>;
};

export type BarcodeDetectorCtor = {
  new (options?: { formats?: string[] }): Pdf417Detector;
  getSupportedFormats: () => Promise<string[]>;
};

export type OpenedPdf417Detector = {
  detector: Pdf417Detector;
  kind: "native" | "wasm";
};

export function zxingWasmUrl(path: string, prefix: string): string {
  return path.endsWith(".wasm") ? "/zxing/zxing_reader.wasm" : prefix + path;
}

export async function pickDetector<
  Native extends { getSupportedFormats: () => Promise<string[]> },
  Wasm,
>(native: Native | undefined, wasm: Wasm): Promise<Native | Wasm> {
  if (!native) return wasm;
  try {
    if ((await native.getSupportedFormats()).includes("pdf417")) return native;
  } catch {
    // missing, throws, or no pdf417 → WASM
  }
  return wasm;
}

export async function openPdf417Detector(): Promise<OpenedPdf417Detector> {
  const native = (globalThis as typeof globalThis & { BarcodeDetector?: BarcodeDetectorCtor })
    .BarcodeDetector;
  const chosen = await pickDetector(native, "wasm" as const);
  if (chosen !== "wasm") {
    return { detector: new chosen({ formats: ["pdf417"] }), kind: "native" };
  }
  const { BarcodeDetector, prepareZXingModule } = await import("barcode-detector/ponyfill");
  await prepareZXingModule({
    overrides: { locateFile: zxingWasmUrl },
    fireImmediately: true,
  });
  return { detector: new BarcodeDetector({ formats: ["pdf417"] }), kind: "wasm" };
}
