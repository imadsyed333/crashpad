import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// node --experimental-strip-types does not resolve extensionless imports.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { parseAamva } = await import("../lib/aamva.ts");

const sample = [
  "@",
  "ANSI 636012090002DL00410288ZO03290015DL",
  "DAQA12345678901234",
  "DCSDOE",
  "DACJOHN",
  "DADQUINCY",
  "DAG123 MAIN ST",
  "DAITORONTO",
  "DAJON",
  "DAKM5V 2T6   ",
].join("\n");

assert.deepEqual(parseAamva(sample), {
  name: "John Quincy Doe",
  license: "A1234-56789-01234",
  address: "123 MAIN ST, TORONTO ON M5V 2T6",
});

const combined = ["@", "ANSI 636012090002DL00410288ZO03290015DL", "DAADOE,JANE", "DAG9 KING ST"].join("\n");
assert.equal(parseAamva(combined)?.name, "Jane Doe");
assert.equal(parseAamva(combined)?.address, "9 KING ST");

const glued = "@\nANSI 636012090002DL00410288ZO03290015DLDAQA12345678901234\rDCSDOE\rDACJOHN\rDAG1 QUEEN ST\rDAITORONTO\rDAJON\rDAKM5V2T6";
assert.deepEqual(parseAamva(glued), {
  name: "John Doe",
  license: "A1234-56789-01234",
  address: "1 QUEEN ST, TORONTO ON M5V2T6",
});

const noMiddle = ["@", "ANSI 636012090002DL00410288ZO03290015DL", "DACJANE", "DADNONE", "DCSSMITH"].join("\n");
assert.equal(parseAamva(noMiddle)?.name, "Jane Smith");

assert.equal(parseAamva("not a barcode"), null);
assert.equal(parseAamva("@\nANSI 636012090002DL00410288ZO03290015DL"), null);
