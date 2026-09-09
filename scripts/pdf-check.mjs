import assert from "node:assert/strict";
import { buildCollisionPdf } from "../lib/pdf.ts";

const collision = {
  id: "check-1",
  date: new Date("2026-03-15T14:30:00Z"),
  location: {
    description: "Main St & 5th Ave",
    coordinates: { latitude: 43.653226, longitude: -79.383184 },
  },
  description: "Rear-end at the light. Hack ) Tj /JavaScript (oops",
  vehicles: [
    {
      id: "v1",
      make: "Honda",
      model: "Civic",
      color: "Blue",
      licensePlate: "ABCD-123",
      insuranceCompany: "Co-operators",
      policyNumber: "POL-99",
      driver: {
        name: "Alex Rivera",
        license: "R1234-56789-01234",
        address: "12 King St",
        phoneNumber: "(416) 555-0100",
      },
    },
  ],
  media: [{ id: "m1", uri: "blob:n/a", type: "image" }],
  witnesses: [
    {
      id: "w1",
      name: "Sam Lee",
      address: "9 Queen St",
      phoneNumber: "(416) 555-0199",
    },
  ],
  officer: null,
};

const bytes = buildCollisionPdf(collision);
const text = new TextDecoder("latin1").decode(bytes);

assert.ok(text.startsWith("%PDF-"), "PDF header");
assert.ok(text.includes("%%EOF"), "PDF EOF");
assert.match(text, /\/Root 1 0 R/);
assert.match(text, /Main St & 5th Ave/);
assert.match(text, /Honda/);
assert.match(text, /Alex Rivera/);
assert.match(text, /Sam Lee/);
assert.match(text, /43\.653226/);
assert.match(text, /Total Media Files/);
assert.doesNotMatch(text, /Officer Information/);
assert.match(text, /Hack \\\) Tj \/JavaScript \\\(oops/);
assert.doesNotMatch(text, /[^\\]\) Tj \/JavaScript/);

const long = {
  ...collision,
  description: Array.from({ length: 80 }, (_, i) => `Paragraph ${i + 1}. ${"word ".repeat(40)}`).join("\n"),
};
const longBytes = buildCollisionPdf(long);
const longText = new TextDecoder("latin1").decode(longBytes);
assert.ok(longText.startsWith("%PDF-"));
assert.ok(longText.includes("%%EOF"));
assert.match(longText, /\/Count [2-9]/);

console.log("pdf-check: header / fields / escape / multi-page ok");
