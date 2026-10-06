import { driverFromExtract, LICENSE_DATA_SCHEMA } from "@/lib/license";
import z from "zod";

const LLAMA_CLOUD = "https://api.cloud.llamaindex.ai";
const EXTRACT_TIMEOUT_MS = 25_000;

const idSchema = z.object({ id: z.string().min(1) });

function fail() {
  return new Response(null, { status: 502 });
}

async function pollExtract(jobId: string, key: string, signal: AbortSignal): Promise<unknown> {
  for (;;) {
    const res = await fetch(`${LLAMA_CLOUD}/api/v2/extract/${jobId}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal,
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { status?: string; extract_result?: unknown };
    if (body.status === "COMPLETED") return body.extract_result ?? null;
    if (body.status === "FAILED" || body.status === "CANCELLED") return null;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export async function POST(request: Request) {
  const key = process.env.LLAMA_CLOUD_API_KEY;
  if (!key) return fail();
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return fail();

    const signal = AbortSignal.timeout(EXTRACT_TIMEOUT_MS);
    const upload = new FormData();
    upload.set("file", file);
    upload.set("purpose", "extract");
    const uploaded = await fetch(`${LLAMA_CLOUD}/api/v1/beta/files`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: upload,
      signal,
    });
    if (!uploaded.ok) return fail();
    const fileId = idSchema.safeParse(await uploaded.json());
    if (!fileId.success) return fail();

    const created = await fetch(`${LLAMA_CLOUD}/api/v2/extract`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_input: fileId.data.id,
        configuration: {
          tier: "cost_effective",
          extraction_target: "per_doc",
          data_schema: LICENSE_DATA_SCHEMA,
          system_prompt:
            "Extract fields from an Ontario driver's license. Use an empty string when a field is not printed.",
        },
      }),
      signal,
    });
    if (!created.ok) return fail();
    const job = idSchema.safeParse(await created.json());
    if (!job.success) return fail();

    const extracted = await pollExtract(job.data.id, key, signal);
    const driver = driverFromExtract(extracted);
    if (!driver) return fail();
    return Response.json(driver);
  } catch {
    return fail();
  }
}
