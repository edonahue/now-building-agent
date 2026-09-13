import { authorized, runtimeConfig } from "../../src/config.js";
import { GitHubRestCollector } from "../../src/github-rest.js";
import { HealthchecksReporter } from "../../src/health.js";
import { runDaily } from "../../src/run.js";
import { VercelBlobHealthStore } from "../../src/health.js";
import {
  VercelConnectGitHubTokenProvider,
  VercelPrivateBlobClient,
} from "../../src/vercel-adapters.js";

export default async function handler(request: Request): Promise<Response> {
  const config = runtimeConfig();
  if (!authorized(request, config.cronSecret))
    return new Response("Unauthorized", { status: 401 });
  const pingUrl = process.env.HEALTHCHECKS_PING_URL;
  if (!pingUrl)
    return new Response("Healthchecks is not configured", { status: 503 });
  const result = await runDaily({
    collector: new GitHubRestCollector(
      new VercelConnectGitHubTokenProvider(),
      config.githubApiBaseUrl,
    ),
    healthStore: new VercelBlobHealthStore(new VercelPrivateBlobClient()),
    healthchecks: new HealthchecksReporter(pingUrl),
    windowHours: config.windowHours,
  });
  return Response.json({
    runId: result.state.runId,
    status: result.state.status,
  });
}
