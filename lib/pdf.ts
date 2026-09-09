import type { Collision, Vehicle, Witness } from "./types";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 36;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BODY = 10;
const LINE = 13;
const LABEL_W = 132;

// Helvetica AFM widths, 1/1000 em, ASCII 32–126. Unlisted bytes use 556.
const HELVETICA_WX = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556,
  556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778,
  722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278,
  278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

const NAVY = "0.173 0.243 0.314";
const GRAY = "0.498 0.549 0.553";
const BLACK = "0.2 0.2 0.2";
const WHITE = "1 1 1";

function formatDate(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function field(value: string | undefined | null, fallback = "N/A") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/** ponytail: WinAnsi / built-in Helvetica only. Unencodable glyphs become `?`. Upgrade: embed a Unicode TTF. */
function winAnsiByte(cp: number): number {
  if (cp < 128) return cp;
  if (cp >= 160 && cp <= 255) return cp;
  switch (cp) {
    case 0x20ac:
      return 0x80;
    case 0x201a:
      return 0x82;
    case 0x0192:
      return 0x83;
    case 0x201e:
      return 0x84;
    case 0x2026:
      return 0x85;
    case 0x2020:
      return 0x86;
    case 0x2021:
      return 0x87;
    case 0x02c6:
      return 0x88;
    case 0x2030:
      return 0x89;
    case 0x0160:
      return 0x8a;
    case 0x2039:
      return 0x8b;
    case 0x0152:
      return 0x8c;
    case 0x017d:
      return 0x8e;
    case 0x2018:
      return 0x91;
    case 0x2019:
      return 0x92;
    case 0x201c:
      return 0x93;
    case 0x201d:
      return 0x94;
    case 0x2022:
      return 0x95;
    case 0x2013:
      return 0x96;
    case 0x2014:
      return 0x97;
    case 0x02dc:
      return 0x98;
    case 0x2122:
      return 0x99;
    case 0x0161:
      return 0x9a;
    case 0x203a:
      return 0x9b;
    case 0x0153:
      return 0x9c;
    case 0x017e:
      return 0x9e;
    case 0x0178:
      return 0x9f;
    default:
      return 0x3f;
  }
}

function pdfString(text: string): string {
  let out = "(";
  for (const ch of text) {
    const b = winAnsiByte(ch.codePointAt(0) ?? 0x3f);
    if (b === 0x28 || b === 0x29 || b === 0x5c) out += `\\${String.fromCharCode(b)}`;
    else if (b < 32 || b > 126) out += `\\${b.toString(8).padStart(3, "0")}`;
    else out += String.fromCharCode(b);
  }
  return `${out})`;
}

function charWidth(cp: number, fontSize: number): number {
  const b = winAnsiByte(cp);
  const wx = b >= 32 && b <= 126 ? HELVETICA_WX[b - 32] : 556;
  return (wx / 1000) * fontSize;
}

function textWidth(text: string, fontSize: number): number {
  let w = 0;
  for (const ch of text) w += charWidth(ch.codePointAt(0) ?? 0x3f, fontSize);
  return w;
}

function wrapLines(text: string, fontSize: number, maxWidth: number): string[] {
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];
  for (const para of paragraphs) {
    if (!para) {
      lines.push("");
      continue;
    }
    const words = para.split(" ");
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (textWidth(next, fontSize) <= maxWidth) {
        line = next;
        continue;
      }
      if (line) lines.push(line);
      if (textWidth(word, fontSize) <= maxWidth) {
        line = word;
        continue;
      }
      let chunk = "";
      for (const ch of word) {
        if (chunk && textWidth(chunk + ch, fontSize) > maxWidth) {
          lines.push(chunk);
          chunk = ch;
        } else chunk += ch;
      }
      line = chunk;
    }
    if (line) lines.push(line);
  }
  return lines.length ? lines : [""];
}

type Style = { bold?: boolean; size?: number; color?: string };

class PdfReport {
  private pages: string[][] = [[]];
  private y = PAGE_H - MARGIN - 4;

  private get page() {
    return this.pages[this.pages.length - 1];
  }

  private op(...lines: string[]) {
    this.page.push(...lines);
  }

  newPage() {
    this.pages.push([]);
    this.y = PAGE_H - MARGIN - 4;
  }

  need(h: number) {
    if (this.y - h < MARGIN) this.newPage();
  }

  keep(h: number) {
    const usable = PAGE_H - MARGIN * 2;
    if (h <= usable && this.y - h < MARGIN) this.newPage();
  }

  private drawText(text: string, x: number, baseline: number, style: Style = {}) {
    const size = style.size ?? BODY;
    const font = style.bold ? "/F2" : "/F1";
    const color = style.color ?? BLACK;
    this.op("BT", `${color} rg`, `${font} ${size} Tf`, `1 0 0 1 ${x.toFixed(2)} ${baseline.toFixed(2)} Tm`, `${pdfString(text)} Tj`, "ET");
  }

  fillRect(x: number, y: number, w: number, h: number, rgb: string) {
    this.op(`${rgb} rg`, `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`, `${BLACK} rg`);
  }

  strokeLine(x1: number, y1: number, x2: number, y2: number, rgb: string) {
    this.op(`${rgb} RG`, `${x1.toFixed(2)} ${y1.toFixed(2)} m`, `${x2.toFixed(2)} ${y2.toFixed(2)} l`, "S", "0 0 0 RG");
  }

  hline(rgb: string) {
    this.strokeLine(MARGIN, this.y, PAGE_W - MARGIN, this.y, rgb);
  }

  centered(text: string, style: Style = {}) {
    const size = style.size ?? BODY;
    this.need(size + 6);
    const x = (PAGE_W - textWidth(text, size)) / 2;
    this.drawText(text, Math.max(MARGIN, x), this.y - size, style);
    this.y -= size + 6;
  }

  paragraph(text: string, style: Style = {}, width = CONTENT_W, x = MARGIN) {
    const size = style.size ?? BODY;
    const lines = wrapLines(text, size, width);
    for (const line of lines) {
      this.need(LINE);
      this.drawText(line, x, this.y - size, style);
      this.y -= LINE;
    }
  }

  sectionTitle(title: string) {
    const bar = 18;
    this.need(bar + 10);
    this.y -= 4;
    this.fillRect(MARGIN, this.y - bar, CONTENT_W, bar, NAVY);
    this.drawText(title, MARGIN + 8, this.y - 13, { bold: true, size: 11, color: WHITE });
    this.y -= bar + 8;
  }

  kv(label: string, value: string) {
    const lines = wrapLines(value, BODY, CONTENT_W - LABEL_W);
    const h = Math.max(1, lines.length) * LINE;
    this.need(h);
    this.drawText(label, MARGIN, this.y - BODY, { bold: true, size: BODY, color: NAVY });
    let baseline = this.y;
    for (const line of lines) {
      this.drawText(line, MARGIN + LABEL_W, baseline - BODY, { size: BODY });
      baseline -= LINE;
    }
    this.y -= h;
  }

  muted(text: string) {
    this.paragraph(text, { size: BODY, color: GRAY });
  }

  gap(n = 8) {
    this.y -= n;
  }

  streams(): string[] {
    return this.pages.map((ops) => ops.join("\n"));
  }
}

function vehicleBlockHeight(vehicle: Vehicle): number {
  const rows = 6 + (vehicle.driver ? 5 : 1);
  return 16 + rows * LINE + 8;
}

function witnessBlockHeight(): number {
  return 16 + 4 * LINE + 8;
}

function writeVehicle(doc: PdfReport, vehicle: Vehicle, index: number) {
  doc.keep(vehicleBlockHeight(vehicle));
  doc.paragraph(`Vehicle ${index + 1}`, { bold: true, size: 11, color: NAVY });
  doc.kv("Make:", field(vehicle.make));
  doc.kv("Model:", field(vehicle.model));
  doc.kv("Color:", field(vehicle.color));
  doc.kv("License Plate:", field(vehicle.licensePlate));
  doc.kv("Insurance Company:", field(vehicle.insuranceCompany));
  doc.kv("Policy Number:", field(vehicle.policyNumber));
  if (vehicle.driver) {
    doc.gap(4);
    doc.paragraph("Driver Information", { bold: true, size: 10, color: NAVY });
    doc.kv("Name:", field(vehicle.driver.name));
    doc.kv("License Number:", field(vehicle.driver.license));
    doc.kv("Address:", field(vehicle.driver.address));
    doc.kv("Phone Number:", field(vehicle.driver.phoneNumber));
  } else {
    doc.muted("No driver information provided");
  }
  doc.gap(8);
}

function writeWitness(doc: PdfReport, witness: Witness, index: number) {
  doc.keep(witnessBlockHeight());
  doc.paragraph(`Witness ${index + 1}`, { bold: true, size: 11, color: NAVY });
  doc.kv("Name:", field(witness.name));
  doc.kv("Address:", field(witness.address));
  doc.kv("Phone:", field(witness.phoneNumber));
  doc.gap(8);
}

function assemblePdf(pageStreams: string[]): Uint8Array {
  const f1 = 3;
  const f2 = 4;
  const bodies: string[] = [];
  bodies[1] = "";
  bodies[2] = "";
  bodies[f1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  bodies[f2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  const pageIds: number[] = [];
  let nextId = 5;
  for (const stream of pageStreams) {
    const contentId = nextId++;
    const pageId = nextId++;
    bodies[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    bodies[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> >>`;
    pageIds.push(pageId);
  }

  bodies[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  bodies[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  const n = nextId - 1;
  let out = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 1; i <= n; i++) {
    offsets[i] = out.length;
    out += `${i} 0 obj\n${bodies[i]}\nendobj\n`;
  }
  const xrefStart = out.length;
  let xref = `xref\n0 ${n + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= n; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  out += xref;
  out += `trailer\n<< /Size ${n + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new TextEncoder().encode(out);
}

export function buildCollisionPdf(collision: Collision): Uint8Array {
  const generated = formatDate(new Date());
  const doc = new PdfReport();

  doc.centered("COLLISION REPORT", { bold: true, size: 18, color: NAVY });
  doc.centered(`Generated: ${generated}`, { size: 9, color: GRAY });
  doc.hline(NAVY);
  doc.gap(12);

  doc.sectionTitle("Incident Information");
  doc.kv("Date & Time:", formatDate(collision.date));
  doc.kv("Location:", field(collision.location.description));
  if (collision.location.coordinates) {
    const { latitude, longitude } = collision.location.coordinates;
    doc.kv("Coordinates:", `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
  }
  doc.gap(6);

  doc.sectionTitle("Incident Description");
  doc.paragraph(field(collision.description, "No description provided"));
  doc.gap(6);

  doc.sectionTitle(`Vehicles Involved (${collision.vehicles.length})`);
  if (collision.vehicles.length === 0) doc.muted("No vehicles recorded");
  else collision.vehicles.forEach((vehicle, i) => writeVehicle(doc, vehicle, i));

  doc.sectionTitle(`Witnesses (${collision.witnesses.length})`);
  if (collision.witnesses.length === 0) doc.muted("No witnesses recorded");
  else collision.witnesses.forEach((witness, i) => writeWitness(doc, witness, i));

  if (collision.officer) {
    doc.sectionTitle("Officer Information");
    doc.kv("Officer Name:", field(collision.officer.name));
    doc.kv("Badge Number:", field(collision.officer.badgeNumber));
    doc.gap(6);
  }

  doc.sectionTitle("Media Documentation");
  doc.kv("Total Media Files:", String(collision.media.length));
  if (collision.media.length > 0) {
    doc.kv("Note:", "Media files are stored on this device and are not included in this file.");
  }
  doc.gap(16);

  doc.need(36);
  doc.hline("0.925 0.941 0.945");
  doc.gap(10);
  doc.centered("This is not an official collision report.", { size: 8, color: GRAY });
  doc.centered(`Report generated on ${generated}`, { size: 8, color: GRAY });

  return assemblePdf(doc.streams());
}

export function exportCollisionPdf(collision: Collision): void {
  const bytes = buildCollisionPdf(collision);
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `crashpad-report-${collision.id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
