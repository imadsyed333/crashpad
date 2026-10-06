import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = mkdtempSync(join(tmpdir(), "ocr-check-"));
const outfile = join(dir, "parse.mjs");
await build({
  entryPoints: [new URL("../lib/licenseParse.ts", import.meta.url).pathname],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  logLevel: "silent",
});
const { parseLicenseText } = await import(pathToFileURL(outfile).href);
rmSync(dir, { recursive: true, force: true });

const happy = parseLicenseText(`
ONTARIO
DRIVER'S LICENCE / PERMIS DE CONDUIRE
1 SMITH
2 JANE MARIE
8 100 QUEEN ST W
TORONTO ON M5H 2N2
4d A1234-56789-01234
3 DOB 1990/01/15
9 CLASS G
15 F
180 cm
(416) 555-0199
`);
assert.equal(happy.ok, true);
if (happy.ok) {
  assert.equal(happy.fields.name, "SMITH JANE MARIE");
  assert.equal(happy.fields.license, "A1234-56789-01234");
  assert.equal(happy.fields.address, "100 QUEEN ST W, TORONTO ON M5H 2N2");
  assert.deepEqual(Object.keys(happy.fields).sort(), ["address", "license", "name"]);
}

const compact = parseLicenseText("A12345678901234");
assert.equal(compact.ok, true);
if (compact.ok) assert.deepEqual(compact.fields, { license: "A1234-56789-01234" });

const spaced = parseLicenseText("A1234 56789 01234");
assert.equal(spaced.ok, true);
if (spaced.ok) assert.equal(spaced.fields.license, "A1234-56789-01234");

const garbage = parseLicenseText("!!!\n12345\nONTARIO\nCLASS G\n");
assert.equal(garbage.ok, false);
if (!garbage.ok) assert.ok(garbage.error.length > 0);

console.log("ocr-check: licence parse ok");
