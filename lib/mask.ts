function stripToMaskChars(mask: string, value: string): string {
  const wantsLetter = mask.includes("A");
  const wantsDigit = mask.includes("9");
  return [...value]
    .filter((ch) => (wantsDigit && /\d/.test(ch)) || (wantsLetter && /[A-Za-z]/.test(ch)))
    .join("");
}

export function maskValue(mask: string, value: string): string {
  const raw = stripToMaskChars(mask, value);
  let ri = 0;
  let out = "";
  for (const m of mask) {
    if (ri >= raw.length) break;
    if (m === "9") {
      if (/\d/.test(raw[ri]!)) {
        out += raw[ri];
        ri += 1;
      } else break;
    } else if (m === "A") {
      if (/[A-Za-z]/.test(raw[ri]!)) {
        out += raw[ri]!.toUpperCase();
        ri += 1;
      } else break;
    } else {
      out += m;
    }
  }
  return out;
}

export const LICENSE_MASK = "A9999-99999-99999";
export const PHONE_MASK = "(999) 999-9999";
