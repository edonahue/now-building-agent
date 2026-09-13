import { authorized, runtimeConfig } from "../src/config.js";
import type { HealthStore } from "../src/contracts.js";
function blobStore(): HealthStore {
  throw new Error("Vercel Blob private-store adapter is not configured");
}

export default async function handler(request: Request): Promise<Response> {
  const config = runtimeConfig();
  if (!authorized(request, config.healthSecret))
    return new Response("Unauthorized", { status: 401 });
  const state = await blobStore().get();
  return Response.json(state ?? { schemaVersion: 1, status: "unknown" }, {
    headers: { "cache-control": "no-store" },
  });
}
