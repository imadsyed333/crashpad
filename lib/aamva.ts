import { LICENSE_MASK, maskValue } from "./mask";

// ponytail: one AAMVA PDF417 layout (element ids at a line start, or glued to the
// ANSI header). Cards with no barcode will not fill. Upgrade: a second decoder.

const CODES = "DAC|DCS|DAD|DCT|DAA|DAG|DAI|DAJ|DAK|DAQ";
const FIELD = new RegExp(`^(?:DL|ID|Z[A-Z])?(${CODES})(.*)$`);
const GLUED = new RegExp(`(?:DL|ID)(${CODES})(.*)$`);

export type AamvaDriver = {
  name?: string;
  license?: string;
  address?: string;
};

function fieldsOf(raw: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const chunk of raw.split(/[\n\r\u001e]+/)) {
    const line = chunk.trim();
    if (!line || line === "@") continue;
    if (line.includes("ANSI")) {
      const glued = line.match(GLUED);
      if (glued) fields[glued[1]!] = glued[2]!.trim();
      continue;
    }
    const match = line.match(FIELD);
    if (match) fields[match[1]!] = match[2]!.trim();
  }
  return fields;
}

function displayName(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed !== trimmed.toUpperCase()) return trimmed;
  return trimmed.toLowerCase().replace(/(^|[\s'-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
}

function nameOf(fields: Record<string, string>): string | undefined {
  const first = fields.DAC || fields.DCT || "";
  const last = fields.DCS || "";
  const middle = fields.DAD && fields.DAD.toUpperCase() !== "NONE" ? fields.DAD : "";
  if (first || last) {
    const name = displayName([first, middle, last].filter(Boolean).join(" "));
    return name || undefined;
  }
  const combined = fields.DAA;
  if (!combined) return undefined;
  const parts = combined.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return displayName(combined) || undefined;
  const family = parts[0]!;
  return displayName([...parts.slice(1), family].join(" ")) || undefined;
}

function addressOf(fields: Record<string, string>): string | undefined {
  const street = fields.DAG?.trim();
  const locality = [fields.DAI, fields.DAJ, fields.DAK].map((part) => part?.trim()).filter(Boolean).join(" ");
  const address = [street, locality].filter(Boolean).join(", ");
  return address || undefined;
}

function licenseOf(fields: Record<string, string>): string | undefined {
  const raw = fields.DAQ?.trim();
  if (!raw) return undefined;
  return maskValue(LICENSE_MASK, raw) || raw;
}

export function parseAamva(raw: string): AamvaDriver | null {
  if (!raw.includes("ANSI")) return null;
  const fields = fieldsOf(raw);
  const driver: AamvaDriver = {
    name: nameOf(fields),
    license: licenseOf(fields),
    address: addressOf(fields),
  };
  if (!driver.name && !driver.license && !driver.address) return null;
  return driver;
}
