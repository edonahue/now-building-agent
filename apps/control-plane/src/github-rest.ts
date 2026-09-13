import type {
  ActivityEvent,
  ChangedFileFamily,
} from "../../../src/core/activity.js";
import {
  normalizeCommit,
  normalizePull,
  normalizeRelease,
} from "../../../src/providers/github.js";
import type { GitHubTokenProvider } from "./contracts.js";

type FetchLike = typeof fetch;
type GitHubPull = {
  number: number;
  title: string;
  merged_at: string | null;
  merge_commit_sha?: string | null;
  labels?: { name: string }[];
};
type GitHubCommit = {
  sha: string;
  commit: { message: string; committer?: { date?: string } };
};
type GitHubCommitDetail = GitHubCommit & { files?: { filename: string }[] };
type GitHubRelease = {
  tag_name: string;
  name: string | null;
  published_at: string | null;
};

function title(message: string): string {
  return message.split("\n", 1)[0]?.trim() || "Untitled GitHub activity";
}
function assertResponse(response: Response, resource: string): Response {
  if (response.ok) return response;
  throw new Error(`GitHub ${resource} failed with HTTP ${response.status}`);
}
function familyFromPath(path: string): ChangedFileFamily {
  if (/^(package-lock\.json|package\.json|pnpm-lock|yarn\.lock)/.test(path))
    return "dependency";
  if (/^(\.github\/workflows|\.circleci|\.gitlab-ci)/.test(path)) return "ci";
  if (/(__tests__|tests\/|\.test\.|\.spec\.)/.test(path)) return "tests";
  if (/^(docs\/|README|CHANGELOG)/i.test(path)) return "documentation";
  if (/\.(md|txt)$/i.test(path)) return "documentation";
  if (/\.(json|csv|geojson|yaml|yml)$/i.test(path)) return "data";
  return "application";
}

/** Read-only REST client. GitHub response shapes terminate in this module. */
export class GitHubRestCollector {
  constructor(
    private readonly tokenProvider: GitHubTokenProvider,
    private readonly apiBaseUrl = "https://api.github.com",
    private readonly request: FetchLike = fetch,
  ) {}
  async listEvents(
    repository: `${string}/${string}`,
    window: { start: string; end: string },
  ): Promise<readonly ActivityEvent[]> {
    const pulls = await this.listPulls(repository, window);
    const [commits, releases] = await Promise.all([
      this.listCommits(repository, window, pulls.mergeCommitShas),
      this.listReleases(repository, window),
    ]);
    return [...pulls.events, ...commits, ...releases].sort(
      (left, right) =>
        left.occurredAt.localeCompare(right.occurredAt) ||
        left.id.localeCompare(right.id),
    );
  }
  private async response(path: string): Promise<Response> {
    const token = await this.tokenProvider.getToken();
    const response = await this.request(`${this.apiBaseUrl}${path}`, {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
      },
    });
    return assertResponse(response, path);
  }
  private async json<T>(path: string): Promise<T> {
    return (await this.response(path)).json() as Promise<T>;
  }
  private async pages<T>(path: string): Promise<T[]> {
    const values: T[] = [];
    let next: string | undefined = path;
    let count = 0;
    while (next) {
      if (count++ >= 10)
        throw new Error(`GitHub pagination limit reached for ${path}`);
      const response = await this.response(next);
      values.push(...((await response.json()) as T[]));
      const link = response.headers.get("link") ?? "";
      const nextMatch = link.match(/<([^>]+)>;\s*rel="next"/);
      next = nextMatch?.[1]?.replace(this.apiBaseUrl, "");
    }
    return values;
  }
  private async listPulls(
    repository: `${string}/${string}`,
    window: { start: string; end: string },
  ) {
    const pulls = await this.pages<GitHubPull>(
      `/repos/${repository}/pulls?state=closed&sort=updated&direction=desc&per_page=100`,
    );
    const events = await Promise.all(
      pulls
        .filter(
          (pull) =>
            pull.merged_at &&
            pull.merged_at >= window.start &&
            pull.merged_at <= window.end,
        )
        .map(async (pull) => {
          const files = await this.pages<{ filename: string }>(
            `/repos/${repository}/pulls/${pull.number}/files?per_page=100`,
          );
          return normalizePull({
            repository,
            number: pull.number,
            title: pull.title,
            mergedAt: pull.merged_at!,
            changedFileFamilies: [
              ...new Set(files.map((file) => familyFromPath(file.filename))),
            ],
            labels: pull.labels?.map((label) => label.name) ?? [],
          });
        }),
    );
    return {
      events,
      mergeCommitShas: new Set(
        pulls
          .filter((pull) => pull.merged_at)
          .map((pull) => pull.merge_commit_sha)
          .filter((sha): sha is string => Boolean(sha)),
      ),
    };
  }
  private async listCommits(
    repository: `${string}/${string}`,
    window: { start: string; end: string },
    mergedPullCommitShas: ReadonlySet<string>,
  ) {
    const commits = await this.pages<GitHubCommit>(
      `/repos/${repository}/commits?since=${encodeURIComponent(window.start)}&until=${encodeURIComponent(window.end)}&per_page=100`,
    );
    return Promise.all(
      commits
        .filter(
          (commit) =>
            commit.commit.committer?.date &&
            !mergedPullCommitShas.has(commit.sha),
        )
        .map(async (commit) => {
          const detail = await this.json<GitHubCommitDetail>(
            `/repos/${repository}/commits/${commit.sha}`,
          );
          return normalizeCommit({
            repository,
            sha: commit.sha,
            title: title(commit.commit.message),
            committedAt: commit.commit.committer!.date!,
            changedFileFamilies: [
              ...new Set(
                (detail.files ?? []).map((file) =>
                  familyFromPath(file.filename),
                ),
              ),
            ],
          });
        }),
    );
  }
  private async listReleases(
    repository: `${string}/${string}`,
    window: { start: string; end: string },
  ) {
    const releases = await this.pages<GitHubRelease>(
      `/repos/${repository}/releases?per_page=100`,
    );
    return releases
      .filter(
        (release) =>
          release.published_at &&
          release.published_at >= window.start &&
          release.published_at <= window.end,
      )
      .map((release) =>
        normalizeRelease({
          repository,
          tag: release.tag_name,
          title: release.name ?? release.tag_name,
          publishedAt: release.published_at!,
          changedFileFamilies: ["application"],
        }),
      );
  }
}
