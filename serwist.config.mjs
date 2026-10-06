import { readFileSync } from "node:fs";
import { serwist } from "@serwist/next/config";

function shellRevision() {
  try {
    return readFileSync(".next/BUILD_ID", "utf8").trim();
  } catch {
    return "dev";
  }
}

export default serwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/", revision: shellRevision() }],
  // LSTM cores and eng.traineddata.gz are larger than the 2MB precache default.
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
});
