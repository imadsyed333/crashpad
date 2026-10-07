import { LICENSE_MASK, maskValue, PHONE_MASK } from "./mask";
import type { Driver } from "./types";
import z from "zod";

const LICENSE_PROXY_URL = "/api/license";

export const licenseScanSchema = z.object({
  name: z.string(),
  license: z.string(),
  phoneNumber: z.string(),
  address: z.string(),
});

export const LICENSE_DATA_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string", description: "Full name printed on the Ontario driver's license" },
    license: { type: "string", description: "Driver's license number, letters and digits only" },
    phoneNumber: { type: "string", description: "Phone number if printed, otherwise an empty string" },
    address: { type: "string", description: "Street address printed on the license" },
  },
  required: ["name", "license", "phoneNumber", "address"],
};

const FIELDS = ["name", "license", "phoneNumber", "address"] as const;

/** Map an extract payload to driver fields. Null when the shape is wrong or every field is blank. */
export function driverFromExtract(raw: unknown): Driver | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;
  const strings: Record<string, unknown> = {};
  for (const key of FIELDS) {
    if (!(key in source)) return null;
    const value = source[key];
    if (value == null) strings[key] = "";
    else if (typeof value !== "string") return null;
    else strings[key] = value;
  }
  const parsed = licenseScanSchema.safeParse(strings);
  if (!parsed.success) return null;
  const driver: Driver = {
    name: parsed.data.name.trim(),
    address: parsed.data.address.trim(),
    license: maskValue(LICENSE_MASK, parsed.data.license),
    phoneNumber: maskValue(PHONE_MASK, parsed.data.phoneNumber),
  };
  if (!driver.name && !driver.license && !driver.phoneNumber && !driver.address) return null;
  return driver;
}

export async function scanLicense(file: File): Promise<Driver | null> {
  if (!navigator.onLine) return null;
  try {
    const body = new FormData();
    body.set("file", file);
    const res = await fetch(LICENSE_PROXY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    return driverFromExtract(await res.json());
  } catch {
    return null;
  }
}
