import assert from "node:assert/strict";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// ponytail: node --experimental-strip-types does not resolve extensionless imports. Upgrade: drop the hook if the check runner grows a TS resolver.
const hook = `
export async function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\\.(ts|js|mjs|json)$/.test(specifier)) {
    return nextResolve(specifier + ".ts", context);
  }
  return nextResolve(specifier, context);
}
`;
register(`data:text/javascript,${encodeURIComponent(hook)}`, pathToFileURL("./"));

const { driverFromExtract } = await import("../lib/license.ts");

assert.deepEqual(
  driverFromExtract({
    name: "Jane Doe",
    license: "A12345678901234",
    phoneNumber: "5551234567",
    address: "123 Main St",
  }),
  {
    name: "Jane Doe",
    license: "A1234-56789-01234",
    phoneNumber: "(555) 123-4567",
    address: "123 Main St",
  },
);

assert.deepEqual(
  driverFromExtract({
    name: "Jane Doe",
    license: null,
    phoneNumber: null,
    address: "123 Main St",
  }),
  {
    name: "Jane Doe",
    license: "",
    phoneNumber: "",
    address: "123 Main St",
  },
);

assert.equal(
  driverFromExtract({
    name: "  ",
    license: "",
    phoneNumber: "",
    address: "",
  }),
  null,
);
assert.equal(driverFromExtract({ name: 1, license: "", phoneNumber: "", address: "" }), null);
assert.equal(driverFromExtract({ name: "Jane Doe" }), null);
assert.equal(driverFromExtract(null), null);

console.log("license-check: extract mapping ok");
