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
});
