import type { ChangedFileFamily } from "./activity.js";
import type { WorkEpisode } from "./episode.js";
export type DeterministicDecision = "keep" | "reject" | "review";
export interface Candidate {
  readonly episode: WorkEpisode;
  readonly decision: DeterministicDecision;
  readonly reasons: readonly string[];
}
const lowValue = new Set<ChangedFileFamily>([
  "dependency",
  "formatting",
  "tests",
  "ci",
  "generated",
]);
export function classifyEpisode(episode: WorkEpisode): Candidate {
  const families = new Set(
    episode.events.flatMap((event) => event.changedFileFamilies),
  );
  if (
    [...families].length > 0 &&
    [...families].every((family) => lowValue.has(family))
  )
    return {
      episode,
      decision: "reject",
      reasons: ["only-obvious-low-value-file-families"],
    };
  if (
    episode.events.some((event) => event.kind === "release") ||
    families.has("application") ||
    families.has("data")
  )
    return {
      episode,
      decision: "keep",
      reasons: ["structural-meaningful-signal-preserved-for-semantic-review"],
    };
  return {
    episode,
    decision: "review",
    reasons: ["ambiguous-episode-is-not-auto-rejected"],
  };
}
