import { LICENSE_MASK, maskValue } from "./mask";
import type { Driver } from "./types";

export type LicenseFields = Partial<Pick<Driver, "name" | "license" | "address">>;

export type LicenseParseResult =
  | { ok: true; fields: LicenseFields }
  | { ok: false; error: string };

const LICENSE = /[A-Za-z]\d{4}-?\d{5}-?\d{5}/;
const POSTAL = /\b([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)\b/;
const PROVINCE = /\b(ON|QC|BC|AB|MB|SK|NS|NB|PE|NL|NT|NU|YT)\b/;
const FIELD_CODE = /^(\d{1,2}[a-d]?)\s+(.*)$/i;

const LABEL = new Set([
  "ontario",
  "canada",
  "permis",
  "conduire",
  "driver",
  "drivers",
  "licence",
  "license",
  "dob",
  "ddn",
  "class",
  "sex",
  "eye",
  "eyes",
  "hgt",
  "height",
  "rest",
  "restriction",
  "restrictions",
  "cond",
  "condition",
  "conditions",
  "donor",
  "organ",
  "specimen",
  "issued",
  "expires",
  "expire",
  "expiry",
  "exp",
  "nom",
  "name",
  "address",
  "adresse",
  "birth",
  "reference",
  "ref",
  "category",
  "endorsement",
  "endorsements",
  "duplicate",
  "photo",
  "sample",
]);

function words(line: string): string[] {
  return line
    .toLowerCase()
    .replace(/['’.]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function stripFieldCode(line: string): string {
  const match = line.match(FIELD_CODE);
  if (!match) return line;
  return match[2]!.trim();
}

function isLicenceLine(line: string): boolean {
  return LICENSE.test(line.replace(/\s+/g, ""));
}

function isStreet(line: string): boolean {
  return /^\d+\s+\S/.test(line);
}

function isNoise(line: string): boolean {
  if (isStreet(line) || POSTAL.test(line)) return false;
  const tokens = words(line);
  if (tokens.length === 0) return true;
  return tokens.some((word) => LABEL.has(word));
}

function isDate(line: string): boolean {
  return (
    /(?:19|20)\d{2}[/.-]\d{1,2}[/.-]\d{1,2}/.test(line) ||
    /\d{1,2}[/.-]\d{1,2}[/.-](?:19|20)\d{2}/.test(line)
  );
}

function isPhone(line: string): boolean {
  if (POSTAL.test(line) || isStreet(line)) return false;
  const digits = line.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

function isNameLike(line: string): boolean {
  if (isStreet(line) || POSTAL.test(line) || PROVINCE.test(line)) return false;
  if (!/^[A-Za-z][A-Za-z .,'’-]*$/.test(line)) return false;
  return line.split(/\s+/).some((word) => word.replace(/[^A-Za-z]/g, "").length >= 3);
}

function normalizePostal(line: string): string {
  return line.replace(POSTAL, (_, left: string, right: string) => {
    return `${left.toUpperCase()} ${right.toUpperCase()}`;
  });
}

function usefulLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => stripFieldCode(line).replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter(
      (line) =>
        !isLicenceLine(line) &&
        !isNoise(line) &&
        !isDate(line) &&
        !isPhone(line) &&
        !/^[\d\s./-]+$/.test(line) &&
        !/^(?:G2?|M2?|[A-F])$/i.test(line) &&
        !/^\d+(\.\d+)?\s*(cm|in|kg|lb)$/i.test(line),
    );
}

function findLicense(text: string): string | undefined {
  for (const line of text.split(/\r?\n/)) {
    const match = line.replace(/\s+/g, "").match(LICENSE);
    if (match) return maskValue(LICENSE_MASK, match[0]);
  }
  return undefined;
}

export function parseLicenseText(text: string): LicenseParseResult {
  const lines = usefulLines(text);
  const license = findLicense(text);
  const postalIdx = lines.findIndex((line) => POSTAL.test(line));

  let address: string | undefined;
  let nameLines: string[] = [];
  if (postalIdx >= 0) {
    let start = postalIdx;
    while (start > 0 && !isNameLike(lines[start - 1]!)) start -= 1;
    address = lines
      .slice(start, postalIdx + 1)
      .map(normalizePostal)
      .join(", ");
    for (let i = start - 1; i >= 0 && nameLines.length < 3; i -= 1) {
      if (!isNameLike(lines[i]!)) break;
      nameLines.push(lines[i]!);
    }
    nameLines.reverse();
  } else {
    nameLines = lines.filter(isNameLike).slice(0, 3);
  }

  const name = nameLines.join(" ").trim();
  const fields: LicenseFields = {};
  if (name) fields.name = name;
  if (license) fields.license = license;
  if (address) fields.address = address;

  if (!name && !license && !address) {
    return {
      ok: false,
      error: "Couldn't read a name, licence, or address from that photo.",
    };
  }
  return { ok: true, fields };
}
