import { LOCATE_REMOTE_URL } from "@/lib/locate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lat, lon } = body ?? {};
    if (typeof lat !== "number" || typeof lon !== "number") {
      return new Response(null, { status: 400 });
    }
    const res = await fetch(LOCATE_REMOTE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
      signal: AbortSignal.timeout(8000),
    });
    return new Response(await res.text(), {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
