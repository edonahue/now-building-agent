import { formatSourceRef, parseSourceRef } from "../core/source-ref.js";
import type { WorkEpisode } from "../core/episode.js";
export interface PublicationRecord {
  readonly id: string;
  readonly sourceRefs: readonly string[];
  readonly state: "published" | "proposed";
}
export interface DedupeResult {
  readonly outcome: "new" | "duplicate" | "amendment";
  readonly consumedRefs: readonly string[];
  readonly novelRefs: readonly string[];
}
export function dedupeEpisode(
  episode: WorkEpisode,
  records: readonly PublicationRecord[],
): DedupeResult {
  const current = episode.events.map((event) =>
    formatSourceRef(event.sourceRef),
  );
  const consumed = new Set(
    records
      .flatMap((record) => record.sourceRefs)
      .map((value) => {
        const parsed = parseSourceRef(value);
        return parsed ? formatSourceRef(parsed) : value;
      }),
  );
  const consumedRefs = current.filter((ref) => consumed.has(ref));
  const outcome =
    consumedRefs.length === current.length
      ? "duplicate"
      : consumedRefs.length === 0
        ? "new"
        : "amendment";
  return {
    outcome,
    consumedRefs,
    novelRefs: current.filter((ref) => !consumed.has(ref)),
  };
}
