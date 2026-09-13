import { describe, expect, it } from "vitest";
import {
  classifyEpisode,
  clusterEvents,
  dedupeEpisode,
  evidencePacket,
  isEnabledRepository,
} from "../src/index.js";
import {
  kraken,
  mollCorrection,
  networkedPolicy,
  obviousMaintenance,
  packet9,
  roundOne,
  roundOneHardening,
} from "./fixtures/cases.js";
import { normalizeCommit } from "../src/providers/github.js";
describe("deterministic editorial core", () => {
  it("absorbs Packet 9 closeout under its parent episode", () => {
    const episodes = clusterEvents(packet9.events);
    expect(episodes).toHaveLength(1);
    expect(episodes[0]!.reasons).toContain("same-pr");
    expect(classifyEpisode(episodes[0]!).decision).toBe("keep");
  });
  it("keeps distinct significant Networked Players episodes separate", () => {
    const episodes = clusterEvents([
      ...networkedPolicy.events,
      ...roundOne.events,
    ]);
    expect(episodes).toHaveLength(2);
    expect(
      episodes.map((episode) => classifyEpisode(episode).decision),
    ).toEqual(["keep", "keep"]);
  });
  it("attaches Kraken polish without making a second story", () => {
    const episodes = clusterEvents(kraken.events);
    expect(episodes).toHaveLength(1);
    expect(evidencePacket(episodes[0]!).sourceRefs).toHaveLength(2);
  });
  it("groups a meaningful corrective sequence without deciding its public prose", () => {
    const episode = clusterEvents(mollCorrection.events)[0]!;
    expect(episode.events).toHaveLength(2);
    expect(classifyEpisode(episode).decision).toBe("keep");
  });
  it("groups explicit Round 1 hardening without making three automatic stories", () => {
    const episodes = clusterEvents(roundOneHardening.events);
    expect(episodes).toHaveLength(1);
    expect(episodes[0]!.reasons).toContain("shared-marker");
  });
  it("rejects only obviously low-value maintenance", () => {
    for (const episode of clusterEvents(obviousMaintenance.events)) {
      expect(classifyEpisode(episode).decision).toBe("reject");
    }
  });
  it("does not merge same-word or cross-repository events without a structured relation", () => {
    const sameWord = [
      normalizeCommit({
        repository: "edonahue/pirate-arcade-web",
        sha: "1".repeat(40),
        title: "Kraken change",
        committedAt: "2026-09-01T00:00:00Z",
        changedFileFamilies: ["application"],
      }),
      normalizeCommit({
        repository: "edonahue/pirate-arcade-web",
        sha: "2".repeat(40),
        title: "Kraken cleanup",
        committedAt: "2026-09-01T01:00:00Z",
        changedFileFamilies: ["application"],
      }),
      normalizeCommit({
        repository: "edonahue/charted-currents",
        sha: "3".repeat(40),
        title: "Kraken elsewhere",
        committedAt: "2026-09-01T01:00:00Z",
        changedFileFamilies: ["application"],
      }),
    ];
    expect(clusterEvents(sameWord)).toHaveLength(3);
  });
  it("is idempotent over an overlapping previously published source window", () => {
    const episode = clusterEvents(packet9.events)[0]!;
    const refs = evidencePacket(episode).sourceRefs;
    expect(
      dedupeEpisode(episode, [
        { id: "existing", sourceRefs: refs, state: "published" },
      ]).outcome,
    ).toBe("duplicate");
  });
  it("identifies a partially consumed episode as an amendment, not a duplicate", () => {
    const episode = clusterEvents(kraken.events)[0]!;
    const [first] = evidencePacket(episode).sourceRefs;
    expect(
      dedupeEpisode(episode, [
        { id: "existing", sourceRefs: [first!], state: "proposed" },
      ]).outcome,
    ).toBe("amendment");
  });
  it("does not let unknown or self activity self-authorize", () => {
    expect(isEnabledRepository("edonahue/unknown")).toBe(false);
    expect(isEnabledRepository("edonahue/now-building-agent")).toBe(false);
  });
});
