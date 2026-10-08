import assert from "node:assert/strict";
import { focusFieldError } from "../lib/focusField.ts";

const focused = [];
const scrolled = [];
const input = {
  focus() {
    focused.push("input");
  },
};
const field = {
  querySelector(selector) {
    assert.equal(selector, "input, textarea, select");
    return input;
  },
  focus() {
    focused.push("field");
  },
  scrollIntoView() {
    scrolled.push("field");
  },
};

assert.equal(
  focusFieldError({
    querySelector(selector) {
      assert.equal(selector, ".field.error");
      return field;
    },
  }),
  true,
);
assert.deepEqual(focused, ["input"]);
assert.deepEqual(scrolled, ["field"]);

assert.equal(focusFieldError({ querySelector: () => null }), false);

const bare = {
  focus() {
    focused.push("bare");
  },
  scrollIntoView() {
    scrolled.push("bare");
  },
  querySelector: () => null,
};
assert.equal(focusFieldError({ querySelector: () => bare }), true);
assert.deepEqual(focused, ["input", "bare"]);
assert.deepEqual(scrolled, ["field", "bare"]);

console.log("focus-field-check ok");
