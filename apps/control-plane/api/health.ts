import { authorized, runtimeConfig } from "../src/config.js";
import { VercelBlobHealthStore } from "../src/health.js";
import { VercelPrivateBlobClient } from "../src/vercel-adapters.js";

export default async function handler(request: Request): Promise<Response> {
  const config = runtimeConfig();
  if (!authorized(request, config.healthSecret))
    return new Response("Unauthorized", { status: 401 });
  const state = await new VercelBlobHealthStore(
    new VercelPrivateBlobClient(),
  ).get();
  return Response.json(state ?? { schemaVersion: 1, status: "unknown" }, {
    headers: { "cache-control": "no-store" },
  });
}
