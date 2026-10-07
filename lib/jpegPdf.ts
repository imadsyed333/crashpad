function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function xrefEntry(offset: number, kind: "n" | "f"): string {
  const gen = kind === "f" ? "65535" : "00000";
  return `${String(offset).padStart(10, "0")} ${gen} ${kind} \n`;
}

/** One-page PDF that draws a JPEG. Width and height are the pixel size. */
export function jpegToPdf(jpeg: Uint8Array, width: number, height: number): Uint8Array {
  const w = Math.round(width);
  const h = Math.round(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
    throw new Error("Invalid image size");
  }

  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets = [0];
  let length = 0;
  const push = (bytes: Uint8Array) => {
    chunks.push(bytes);
    length += bytes.length;
  };
  const pushObj = (body: string) => {
    offsets.push(length);
    push(enc.encode(body));
  };

  push(enc.encode("%PDF-1.4\n"));
  push(Uint8Array.from([0x25, 0xff, 0xff, 0xff, 0xff, 0x0a]));
  pushObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  pushObj("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  pushObj(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Contents 4 0 R /Resources << /XObject << /Im 5 0 R >> >> >>\nendobj\n`,
  );

  const content = enc.encode(`q\n${w} 0 0 ${h} 0 0 cm\n/Im Do\nQ\n`);
  offsets.push(length);
  push(enc.encode(`4 0 obj\n<< /Length ${content.length} >>\nstream\n`));
  push(content);
  push(enc.encode("\nendstream\nendobj\n"));

  offsets.push(length);
  push(
    enc.encode(
      `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    ),
  );
  push(jpeg);
  push(enc.encode("\nendstream\nendobj\n"));

  const xrefAt = length;
  let xref = "xref\n0 6\n";
  xref += xrefEntry(0, "f");
  for (let i = 1; i <= 5; i += 1) xref += xrefEntry(offsets[i]!, "n");
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  push(enc.encode(xref));
  return concat(chunks);
}
