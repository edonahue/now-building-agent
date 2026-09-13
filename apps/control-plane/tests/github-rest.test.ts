import { describe, expect, it } from "vitest";
import { GitHubRestCollector } from "../src/github-rest.js";

describe("read-only GitHub collection", () => {
  it("paginates normalized facts and derives file families before the core", async () => {
    const requests: string[] = [];
    const request: typeof fetch = async (input, init) => {
      const url = String(input);
      requests.push(url);
      expect(new Headers(init?.headers).get("authorization")).toBe(
        "Bearer short-lived-token",
      );
      if (url.includes("/pulls?") && url.includes("page=2"))
        return Response.json([]);
      if (url.includes("/pulls?"))
        return Response.json(
          [
            {
              number: 4,
              title: "A merged change",
              merged_at: "2026-09-13T09:00:00Z",
              merge_commit_sha: "a".repeat(40),
              labels: [],
            },
          ],
          {
            headers: {
              link: '<https://api.github.test/repos/edonahue/example/pulls?state=closed&page=2>; rel="next"',
            },
          },
        );
      if (url.includes("/pulls/4/files"))
        return Response.json([{ filename: "src/app.ts" }]);
      if (url.includes("/commits?"))
        return Response.json([
          {
            sha: "a".repeat(40),
            commit: {
              message: "A merged change",
              committer: { date: "2026-09-13T09:00:00Z" },
            },
          },
        ]);
      if (url.includes("/releases?")) return Response.json([]);
      throw new Error(`Unexpected GitHub URL: ${url}`);
    };
    const collector = new GitHubRestCollector(
      { getToken: async () => "short-lived-token" },
      "https://api.github.test",
      request,
    );
    const events = await collector.listEvents("edonahue/example", {
      start: "2026-09-12T00:00:00Z",
      end: "2026-09-14T00:00:00Z",
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      kind: "merged-pr",
      changedFileFamilies: ["application"],
    });
    expect(requests.some((url) => url.includes("page=2"))).toBe(true);
  });
  it("fails closed on a GitHub error rather than returning partial activity", async () => {
    const collector = new GitHubRestCollector(
      { getToken: async () => "token" },
      "https://api.github.test",
      async () => new Response("rate limited", { status: 429 }),
    );
    await expect(
      collector.listEvents("edonahue/example", {
        start: "2026-09-12T00:00:00Z",
        end: "2026-09-14T00:00:00Z",
      }),
    ).rejects.toThrow("HTTP 429");
  });
});
