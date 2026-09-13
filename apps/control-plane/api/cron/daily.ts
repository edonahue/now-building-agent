import { authorized, runtimeConfig } from "../../src/config.js";
import { GitHubRestCollector } from "../../src/github-rest.js";
import { HealthchecksReporter } from "../../src/health.js";
import { runDaily } from "../../src/run.js";
import type { HealthStore } from "../../src/contracts.js";

/** Deployment wiring intentionally waits for Vercel Connect configuration. */
function connectTokenProvider(): Promise<string> {
  throw new Error("Vercel Connect GitHub token provider is not configured");
}
function blobStore(): HealthStore {
  throw new Error("Vercel Blob private-store adapter is not configured");
}
export default async function handler(request: Request): Promise<Response> {
  const config = runtimeConfig();
  if (!authorized(request, config.cronSecret))
    return new Response("Unauthorized", { status: 401 });
  const pingUrl = process.env.HEALTHCHECKS_PING_URL;
  if (!pingUrl)
    return new Response("Healthchecks is not configured", { status: 503 });
  const result = await runDaily({
    collector: new GitHubRestCollector(
      { getToken: connectTokenProvider },
      config.githubApiBaseUrl,
    ),
    healthStore: blobStore(),
    healthchecks: new HealthchecksReporter(pingUrl),
    windowHours: config.windowHours,
  });
  return Response.json({
    runId: result.state.runId,
    status: result.state.status,
  });
}
