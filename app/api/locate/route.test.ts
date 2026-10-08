import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function locateRequest(body: unknown) {
  return new Request("http://localhost/api/locate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/locate", () => {
  it("returns 400 when lat or lon is not a number", async () => {
    const res = await POST(locateRequest({ lat: "43.7", lon: -79.5 }));
    expect(res.status).toBe(400);
  });

  it("forwards the upstream status and body", async () => {
    const payload = JSON.stringify({
      name: "Oak St",
      distance_m: 8,
      direction: "S",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(payload, { status: 200 })),
    );
    const res = await POST(locateRequest({ lat: 43.7, lon: -79.5 }));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe(payload);
    expect(res.headers.get("content-type")).toBe("application/json");
  });

  it("returns 502 when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const res = await POST(locateRequest({ lat: 43.7, lon: -79.5 }));
    expect(res.status).toBe(502);
  });
});
