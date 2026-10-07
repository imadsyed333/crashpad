import assert from "node:assert/strict";
import { jpegToPdf } from "../lib/jpegPdf.ts";
import { parseLicenseText } from "../lib/licenseScan.ts";

const sample = [
  "ONTARIO",
  "DRIVER'S LICENCE",
  "SMITH, JANE MARIE",
  "123 QUEEN STREET WEST",
  "TORONTO, ON M5H 2N2",
  "A1234-56789-01234",
  "416-555-0199",
].join("\n");

assert.deepEqual(parseLicenseText(sample), {
  ok: true,
  fields: {
    name: "Jane Marie Smith",
    license: "A1234-56789-01234",
    address: "123 QUEEN STREET WEST, TORONTO, ON M5H 2N2",
    phoneNumber: "(416) 555-0199",
  },
});

assert.deepEqual(parseLicenseText("this photo is blank"), { ok: false });

const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]);
const pdf = jpegToPdf(jpeg, 2, 3);
const ascii = new TextDecoder();
assert.equal(ascii.decode(pdf.subarray(0, 8)), "%PDF-1.4");
const jpegAt = pdf.findIndex((_, i) => jpeg.every((byte, j) => pdf[i + j] === byte));
assert.ok(jpegAt > 0);
const startxref = Number(ascii.decode(pdf).match(/startxref\n(\d+)/)[1]);
assert.equal(ascii.decode(pdf.subarray(startxref, startxref + 8)), "xref\n0 6");
const entries = [...ascii.decode(pdf.subarray(startxref)).matchAll(/\n(\d{10}) 00000 n /g)].map(
  (match) => Number(match[1]),
);
assert.equal(entries.length, 5);
for (let n = 1; n <= 5; n += 1) {
  assert.equal(ascii.decode(pdf.subarray(entries[n - 1], entries[n - 1] + 7)), `${n} 0 obj`);
}
const image = ascii.decode(pdf.subarray(entries[4], jpegAt));
assert.match(image, /\/Width 2/);
assert.match(image, /\/Height 3/);
assert.match(image, /\/Filter \/DCTDecode/);

console.log("license-scan-check: ontario card text ok");
