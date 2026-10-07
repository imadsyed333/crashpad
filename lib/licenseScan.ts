import { LICENSE_MASK, PHONE_MASK, maskValue } from "./mask";

// ponytail: expects a printed Ontario card in English (SURNAME, GIVEN NAMES,
// then a street line and a city line). Handwritten or out-of-province layouts miss.
// Upgrade: a layout per province.

const LICENSE_RE = /\b[A-Za-z]\d{4}[ \t-]?\d{5}[ \t-]?\d{5}\b/;
const PHONE_RE = /(?:\+?1[\s.-]*)?\(?([2-9]\d{2})\)?[\s.-]*([2-9]\d{2})[\s.-]*(\d{4})\b/;
const NAME_RE = /^([A-Za-z][A-Za-z'’. -]*),\s+([A-Za-z][A-Za-z'’. -]*)$/;

export type LicenseScanFields = {
  name?: string;
  license?: string;
  address?: string;
  phoneNumber?: string;
};

export type LicenseScanResult = { ok: true; fields: LicenseScanFields } | { ok: false };

function titleCase(value: string): string {
  return value.toLowerCase().replace(/[a-z]+/g, (word) => word[0]!.toUpperCase() + word.slice(1));
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function parseLicenseText(text: string): LicenseScanResult {
  const lines = text.split(/\r?\n/).map(collapse).filter(Boolean);
  const licenseMatch = text.match(LICENSE_RE);
  const licenseRaw = licenseMatch?.[0];
  const license = licenseRaw ? maskValue(LICENSE_MASK, licenseRaw) : "";

  let phoneNumber = "";
  for (const line of lines) {
    const rest = licenseRaw ? line.replace(licenseRaw, " ") : line;
    const phone = rest.match(PHONE_RE);
    if (!phone) continue;
    phoneNumber = maskValue(PHONE_MASK, `${phone[1]}${phone[2]}${phone[3]}`);
    break;
  }

  const nameIndex = lines.findIndex((line) => NAME_RE.test(line));
  let name = "";
  let address = "";
  if (nameIndex >= 0) {
    const match = lines[nameIndex]!.match(NAME_RE)!;
    name = `${titleCase(match[2]!)} ${titleCase(match[1]!)}`;
    const addressLines: string[] = [];
    for (const line of lines.slice(nameIndex + 1)) {
      if (addressLines.length === 2) break;
      const rest = (licenseRaw ? line.replace(licenseRaw, "") : line).trim();
      if (!rest) continue;
      if (PHONE_RE.test(rest) && !/[A-Za-z]/.test(rest)) continue;
      addressLines.push(line);
    }
    address = addressLines.join(", ");
  }

  if (!license && !name) return { ok: false };

  const fields: LicenseScanFields = {};
  if (name) fields.name = name;
  if (license) fields.license = license;
  if (address) fields.address = address;
  if (phoneNumber) fields.phoneNumber = phoneNumber;
  return { ok: true, fields };
}
