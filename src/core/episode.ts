import type { ActivityEvent, EvidenceItem } from "./activity.js";
import { formatSourceRef } from "./source-ref.js";

export type GroupingReason =
  | "same-pr"
  | "parent-pr"
  | "shared-marker"
  | "immediate-closeout"
  | "release-after-implementation"
  | "direct-sequence"
  | "singleton";
export interface WorkEpisode {
  readonly id: string;
  readonly repository: string;
  readonly events: readonly ActivityEvent[];
  readonly reasons: readonly GroupingReason[];
}
export interface EvidencePacket {
  readonly episodeId: string;
  readonly sourceRefs: readonly string[];
  readonly items: readonly EvidenceItem[];
  readonly untrustedRepositoryText: true;
}
export function episodeId(events: readonly ActivityEvent[]): string {
  return [...events]
    .map((event) => formatSourceRef(event.sourceRef))
    .sort()
    .join("+");
}
export function evidencePacket(episode: WorkEpisode): EvidencePacket {
  return {
    episodeId: episode.id,
    sourceRefs: episode.events
      .map((event) => formatSourceRef(event.sourceRef))
      .sort(),
    items: episode.events.flatMap((event) => event.evidence),
    untrustedRepositoryText: true,
  };
}
