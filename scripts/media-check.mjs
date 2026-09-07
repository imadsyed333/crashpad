import assert from "node:assert/strict";
import {
  assertAcceptableFile,
  fallbackMimeType,
  mimeTypeForFile,
  resolveMediaType,
} from "../lib/mediaType.ts";

const emptyMp4 = new File([new Uint8Array([0])], "clip.mp4", { type: "" });
assertAcceptableFile(emptyMp4);
assert.equal(resolveMediaType(emptyMp4), "video");
assert.equal(mimeTypeForFile(emptyMp4), "video/mp4");

const octetMov = new File([new Uint8Array([0])], "clip.mov", {
  type: "application/octet-stream",
});
assertAcceptableFile(octetMov);
assert.equal(resolveMediaType(octetMov), "video");
assert.equal(mimeTypeForFile(octetMov), "video/quicktime");

const exe = new File([new Uint8Array([0])], "setup.exe", { type: "" });
assert.throws(() => assertAcceptableFile(exe), /photos and videos/);

const typedWebm = new File([new Uint8Array([0])], "clip.webm", { type: "video/webm" });
assertAcceptableFile(typedWebm);
assert.equal(resolveMediaType(typedWebm), "video");
assert.equal(mimeTypeForFile(typedWebm), "video/webm");

assert.equal(fallbackMimeType({ type: "video" }), "video/mp4");
assert.equal(fallbackMimeType({ type: "image" }), "image/jpeg");
assert.equal(fallbackMimeType({ type: "video", mimeType: "video/webm" }), "video/webm");

console.log("media-check: accept / type / MIME inference ok");
