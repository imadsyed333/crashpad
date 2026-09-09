import assert from "node:assert/strict";
import { screenFromPath } from "../lib/screens.ts";

assert.equal(screenFromPath("/"), "home");
assert.equal(screenFromPath(""), "home");
assert.equal(screenFromPath("/vehicle"), "vehicle");
assert.equal(screenFromPath("/vehicle/"), "vehicle");
assert.equal(screenFromPath("/collisions/form/safety"), "safety");
assert.equal(screenFromPath("/collisions/form/details"), "details");
assert.equal(screenFromPath("/collisions/form/media"), "media");
assert.equal(screenFromPath("/collisions/form/vehicles"), "vehicles");
assert.equal(screenFromPath("/collisions/form/vehicle"), "vehicleForm");
assert.equal(screenFromPath("/collisions/form/witnesses"), "witnesses");
assert.equal(screenFromPath("/collisions/form/review"), "review");
assert.equal(screenFromPath("/collisions/a1b2c3d4-e5f6"), "collision");
assert.equal(screenFromPath("/collisions/form"), "notFound");
assert.equal(screenFromPath("/collisions/form/unknown"), "notFound");
assert.equal(screenFromPath("/nope"), "notFound");
