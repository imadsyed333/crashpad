import { afterEach, describe, expect, it, vi } from "vitest";
import { locateNearby } from "./locate";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("locateNearby", () => {
  it("returns null when offline", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    vi.stubGlobal("fetch", vi.fn());
    expect(await locateNearby(43.7, -79.5)).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns null when the response is not ok", async () => {
    vi.stubGlobal("navigator", { onLine: true });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 502 })),
    );
    expect(await locateNearby(43.7, -79.5)).toBeNull();
  });

  it("returns null when the body is invalid", async () => {
    vi.stubGlobal("navigator", { onLine: true });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ name: "Oak St" }), { status: 200 }),
      ),
    );
    expect(await locateNearby(43.7, -79.5)).toBeNull();
  });

  it("formats a valid locate result", async () => {
    vi.stubGlobal("navigator", { onLine: true });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            name: "Jane and Finch",
            distance_m: 150.7,
            direction: "NE",
          }),
          { status: 200 },
        ),
      ),
    );
    expect(await locateNearby(43.7, -79.5)).toBe("151m NE of Jane and Finch");
  });
});
