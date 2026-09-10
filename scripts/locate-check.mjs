import assert from "node:assert/strict";
import { formatLocateDescription, locateResultSchema } from "../lib/locate.ts";

assert.equal(
  formatLocateDescription({
    name: "Jane and Finch",
    distance_m: 150,
    direction: "NE",
  }),
  "150m NE of Jane and Finch",
);

assert.equal(
  formatLocateDescription({
    name: "Jane and Finch",
    distance_m: 150.7,
    direction: "NE",
  }),
  "151m NE of Jane and Finch",
);

assert.equal(
  formatLocateDescription({
    name: "Jane and Finch",
    distance_m: 12,
    direction: null,
  }),
  "Jane and Finch",
);

assert.equal(
  locateResultSchema.safeParse({
    name: "Oak St",
    distance_m: 8,
    direction: "S",
  }).success,
  true,
);
assert.equal(locateResultSchema.safeParse({ name: "Oak St" }).success, false);
assert.equal(
  locateResultSchema.safeParse({
    name: "Oak St",
    distance_m: 8,
    direction: 1,
  }).success,
  false,
);

console.log("locate-check: description format ok");
