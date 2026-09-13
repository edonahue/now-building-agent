import { get, put } from "@vercel/blob";
import { getToken } from "@vercel/connect";
import type { GitHubTokenProvider } from "./contracts.js";
import type { PrivateBlobClient } from "./health.js";

const connector = "github/now-building-readonly";
const repositories = [
  "edonahue/charted-currents",
  "edonahue/networked-players",
  "edonahue/pirate-arcade-web",
  "edonahue/erich-lab",
];

/** Requests an ephemeral, per-run GitHub token with no write permissions. */
export class VercelConnectGitHubTokenProvider implements GitHubTokenProvider {
  async getToken(): Promise<string> {
    return getToken(connector, {
      subject: { type: "app" },
      authorizationDetails: [
        {
          type: "github_app_installation",
          repositories,
          permissions: ["contents:read"],
        },
      ],
    });
  }
}

/** Uses Vercel-managed OIDC supplied by the runtime; no token is read here. */
export class VercelPrivateBlobClient implements PrivateBlobClient {
  async put(pathname: string, body: string): Promise<void> {
    await put(pathname, body, {
      access: "private",
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
  }
  async get(pathname: string): Promise<string | undefined> {
    const result = await get(pathname, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return undefined;
    return new Response(result.stream).text();
  }
}
