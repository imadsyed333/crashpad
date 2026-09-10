import z from "zod";

export const LOCATE_REMOTE_URL = "https://crashpad-locate.vercel.app/nearest";
const LOCATE_PROXY_URL = "/api/locate";

export const locateResultSchema = z.object({
  name: z.string(),
  distance_m: z.number(),
  direction: z.string().nullable(),
});

export type LocateResult = z.infer<typeof locateResultSchema>;

export function formatLocateDescription(result: LocateResult): string {
  if (result.direction == null) return result.name;
  return `${Math.round(result.distance_m)}m ${result.direction} of ${result.name}`;
}

export async function locateNearby(lat: number, lon: number): Promise<string | null> {
  if (!navigator.onLine) return null;
  try {
    const res = await fetch(LOCATE_PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const parsed = locateResultSchema.safeParse(await res.json());
    if (!parsed.success) return null;
    return formatLocateDescription(parsed.data);
  } catch {
    return null;
  }
}
