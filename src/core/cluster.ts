import type { ActivityEvent } from "./activity.js";
import { episodeId, type GroupingReason, type WorkEpisode } from "./episode.js";

const markers = /\b(packet\s*\d+|round\s*\d+|kraken(?:'s wake)?|moll)\b/gi;
const closeout = /\b(closeout|accepted|hosted|follow-?up|polish)\b/i;
const hour = 60 * 60 * 1000;
function markerSet(event: ActivityEvent): Set<string> {
  return new Set(
    [...event.title.matchAll(markers)].map((match) =>
      match[1]!.toLowerCase().replace(/\s+/g, " "),
    ),
  );
}
function relationship(
  left: ActivityEvent,
  right: ActivityEvent,
): GroupingReason | null {
  if (left.repository !== right.repository) return null;
  const leftPr =
    left.sourceRef.kind === "pr" ? left.sourceRef.value : left.parentPr;
  const rightPr =
    right.sourceRef.kind === "pr" ? right.sourceRef.value : right.parentPr;
  if (leftPr !== undefined && leftPr === rightPr) return "same-pr";
  if (left.parentPr !== undefined && left.parentPr === right.parentPr)
    return "parent-pr";
  const shared = [...markerSet(left)].some((marker) =>
    markerSet(right).has(marker),
  );
  if (shared) return "shared-marker";
  const elapsed = Math.abs(
    Date.parse(left.occurredAt) - Date.parse(right.occurredAt),
  );
  if (
    elapsed <= 48 * hour &&
    (closeout.test(left.title) || closeout.test(right.title))
  )
    return "immediate-closeout";
  if (
    elapsed <= 24 * hour &&
    (left.kind === "release" || right.kind === "release")
  )
    return "release-after-implementation";
  return null;
}

/** Deterministic, conservative connected components. Events without a reason remain singletons. */
export function clusterEvents(events: readonly ActivityEvent[]): WorkEpisode[] {
  const sorted = [...events].sort(
    (a, b) =>
      a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id),
  );
  const parent = sorted.map((_, index) => index);
  const find = (index: number): number =>
    parent[index] === index ? index : (parent[index] = find(parent[index]!));
  const join = (left: number, right: number) => {
    parent[find(left)] = find(right);
  };
  const edgeReasons = new Map<string, GroupingReason[]>();
  for (let left = 0; left < sorted.length; left += 1)
    for (let right = left + 1; right < sorted.length; right += 1) {
      const reason = relationship(sorted[left]!, sorted[right]!);
      if (reason) {
        join(left, right);
        edgeReasons.set(`${left}:${right}`, [reason]);
      }
    }
  const buckets = new Map<number, number[]>();
  sorted.forEach((_, index) => {
    const root = find(index);
    buckets.set(root, [...(buckets.get(root) ?? []), index]);
  });
  return [...buckets.values()].map((indices) => {
    const episodeEvents = indices.map((index) => sorted[index]!);
    const reasons = [
      ...new Set(
        indices.flatMap((left) =>
          indices.flatMap(
            (right) =>
              edgeReasons.get(
                `${Math.min(left, right)}:${Math.max(left, right)}`,
              ) ?? [],
          ),
        ),
      ),
    ];
    return {
      id: episodeId(episodeEvents),
      repository: episodeEvents[0]!.repository,
      events: episodeEvents,
      reasons: reasons.length ? reasons : ["singleton"],
    };
  });
}
