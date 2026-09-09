import assert from "node:assert/strict";
import { diffMedia, shouldDeleteBlobOnRemove } from "../lib/collisionEdit.ts";

const original = [{ id: "a" }, { id: "b" }];
const working = [{ id: "b" }, { id: "c" }];
const { added, removed } = diffMedia(original, working);
assert.deepEqual(
  added.map((m) => m.id),
  ["c"],
);
assert.deepEqual(
  removed.map((m) => m.id),
  ["a"],
);

assert.deepEqual(diffMedia([], []), { added: [], removed: [] });
assert.deepEqual(diffMedia(original, original), { added: [], removed: [] });
assert.deepEqual(
  diffMedia(original, [{ id: "a" }, { id: "b" }, { id: "d" }]).added.map((m) => m.id),
  ["d"],
);
assert.deepEqual(
  diffMedia(original, []).removed.map((m) => m.id),
  ["a", "b"],
);

assert.equal(shouldDeleteBlobOnRemove("a", undefined), true);
assert.equal(shouldDeleteBlobOnRemove("a", original), false);
assert.equal(shouldDeleteBlobOnRemove("c", original), true);

// Missing live collision must not be treated as empty original — that drops removals.
const snapshot = [{ id: "kept" }, { id: "removed" }];
const workingAfterDelete = [{ id: "kept" }];
assert.deepEqual(diffMedia([], workingAfterDelete).removed, []);
assert.deepEqual(
  diffMedia(snapshot, workingAfterDelete).removed.map((m) => m.id),
  ["removed"],
);

console.log("collision-edit-check: media diff ok");
