import type { Candidate } from "../core/significance.js";
import type { EvidencePacket } from "../core/episode.js";
export interface ProposedBuildUpdate {
  readonly contractVersion: 1;
  readonly candidate: Candidate;
  readonly evidence: EvidencePacket;
  readonly sourceRefs: readonly string[];
}
export function propose(
  candidate: Candidate,
  evidence: EvidencePacket,
): ProposedBuildUpdate {
  return {
    contractVersion: 1,
    candidate,
    evidence,
    sourceRefs: evidence.sourceRefs,
  };
}
