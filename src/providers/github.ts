import type { ActivityEvent } from "../core/activity.js";
import type { SourceRef } from "../core/source-ref.js";
import { sourceRefUrl } from "../core/source-ref.js";

/** Boundary for a future read-only GitHub adapter; raw API responses never enter core logic. */
export interface ActivityProvider {
  listEvents(
    repository: `${string}/${string}`,
    window: { start: string; end: string },
  ): Promise<readonly ActivityEvent[]>;
}

export interface GitHubPullFact {
  readonly repository: `${string}/${string}`;
  readonly number: number;
  readonly title: string;
  readonly mergedAt: string;
  readonly changedFileFamilies: ActivityEvent["changedFileFamilies"];
  readonly labels?: readonly string[];
  readonly episodeMarkers?: readonly string[];
}

export interface GitHubCommitFact {
  readonly repository: `${string}/${string}`;
  readonly sha: string;
  readonly title: string;
  readonly committedAt: string;
  readonly changedFileFamilies: ActivityEvent["changedFileFamilies"];
  readonly parentPr?: number;
  readonly relatedSourceRefs?: readonly SourceRef[];
  readonly episodeMarkers?: readonly string[];
}

export interface GitHubReleaseFact {
  readonly repository: `${string}/${string}`;
  readonly tag: string;
  readonly title: string;
  readonly publishedAt: string;
  readonly changedFileFamilies: ActivityEvent["changedFileFamilies"];
  readonly relatedSourceRefs?: readonly SourceRef[];
}

function repoParts(repository: `${string}/${string}`): [string, string] {
  const [owner, repo] = repository.split("/");
  if (!owner || !repo) throw new Error("GitHub repository must be owner/repo");
  return [owner, repo];
}
function normalizedEvent(
  repository: `${string}/${string}`,
  sourceRef: SourceRef,
  id: string,
  kind: ActivityEvent["kind"],
  occurredAt: string,
  title: string,
  changedFileFamilies: ActivityEvent["changedFileFamilies"],
  options: Pick<
    ActivityEvent,
    "labels" | "episodeMarkers" | "relatedSourceRefs"
  >,
): ActivityEvent {
  return {
    id,
    repository,
    kind,
    sourceRef,
    occurredAt,
    title,
    url: sourceRefUrl(sourceRef),
    changedFileFamilies,
    ...options,
    evidence: [
      {
        sourceRef,
        url: sourceRefUrl(sourceRef),
        kind: "implementation",
        summary: title,
      },
    ],
  };
}
export function normalizePull(fact: GitHubPullFact): ActivityEvent {
  const [owner, repo] = repoParts(fact.repository);
  return normalizedEvent(
    fact.repository,
    { owner, repo, kind: "pr", value: fact.number },
    `pr:${fact.number}`,
    "merged-pr",
    fact.mergedAt,
    fact.title,
    fact.changedFileFamilies,
    {
      labels: fact.labels ?? [],
      episodeMarkers: fact.episodeMarkers ?? [],
      relatedSourceRefs: [],
    },
  );
}
export function normalizeCommit(fact: GitHubCommitFact): ActivityEvent {
  const [owner, repo] = repoParts(fact.repository);
  return {
    ...normalizedEvent(
      fact.repository,
      { owner, repo, kind: "commit", value: fact.sha },
      `commit:${fact.sha}`,
      "commit",
      fact.committedAt,
      fact.title,
      fact.changedFileFamilies,
      {
        labels: [],
        episodeMarkers: fact.episodeMarkers ?? [],
        relatedSourceRefs: fact.relatedSourceRefs ?? [],
      },
    ),
    ...(fact.parentPr === undefined ? {} : { parentPr: fact.parentPr }),
  };
}
export function normalizeRelease(fact: GitHubReleaseFact): ActivityEvent {
  const [owner, repo] = repoParts(fact.repository);
  return normalizedEvent(
    fact.repository,
    { owner, repo, kind: "release", value: fact.tag },
    `release:${fact.tag}`,
    "release",
    fact.publishedAt,
    fact.title,
    fact.changedFileFamilies,
    {
      labels: [],
      episodeMarkers: [],
      relatedSourceRefs: fact.relatedSourceRefs ?? [],
    },
  );
}
