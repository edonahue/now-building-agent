import type { ActivityEvent } from "./activity.js";
import { episodeId, type GroupingReason, type WorkEpisode } from "./episode.js";
import { formatSourceRef } from "./source-ref.js";

const hour = 60 * 60 * 1000;
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
  if (
    left.parentPr !== undefined &&
    right.parentPr !== undefined &&
    left.parentPr === right.parentPr
  )
    return "parent-pr";
  if (
    left.relatedSourceRefs.some(
      (ref) => formatSourceRef(ref) === formatSourceRef(right.sourceRef),
    ) ||
    right.relatedSourceRefs.some(
      (ref) => formatSourceRef(ref) === formatSourceRef(left.sourceRef),
    )
  )
    return "explicit-link";
  const sharedMarker = left.episodeMarkers.some((marker) =>
    right.episodeMarkers.includes(marker),
  );
  if (sharedMarker) return "shared-marker";
  const elapsed = Math.abs(
    Date.parse(left.occurredAt) - Date.parse(right.occurredAt),
  );
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
