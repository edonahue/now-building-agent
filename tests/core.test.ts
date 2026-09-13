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
  networked,
  obviousMaintenance,
  packet9,
  roundOneFollowups,
} from "./fixtures/events.js";
describe("deterministic editorial core", () => {
  it("absorbs Packet 9 closeout under its parent episode", () => {
    const episodes = clusterEvents(packet9);
    expect(episodes).toHaveLength(1);
    expect(episodes[0]!.reasons).toContain("same-pr");
    expect(classifyEpisode(episodes[0]!).decision).toBe("keep");
  });
  it("keeps distinct significant Networked Players episodes separate", () => {
    const episodes = clusterEvents(networked);
    expect(episodes).toHaveLength(2);
    expect(
      episodes.map((episode) => classifyEpisode(episode).decision),
    ).toEqual(["keep", "keep"]);
  });
  it("attaches Kraken polish without making a second story", () => {
    const episodes = clusterEvents(kraken);
    expect(episodes).toHaveLength(1);
    expect(evidencePacket(episodes[0]!).sourceRefs).toHaveLength(2);
  });
  it("groups a meaningful corrective sequence without deciding its public prose", () => {
    const episode = clusterEvents(mollCorrection)[0]!;
    expect(episode.events).toHaveLength(2);
    expect(classifyEpisode(episode).decision).toBe("keep");
  });
  it("groups explicit Round 1 hardening without making three automatic stories", () => {
    const episodes = clusterEvents(roundOneFollowups);
    expect(episodes).toHaveLength(1);
    expect(episodes[0]!.reasons).toContain("shared-marker");
  });
  it("rejects only obviously low-value maintenance", () => {
    for (const episode of clusterEvents(obviousMaintenance)) {
      expect(classifyEpisode(episode).decision).toBe("reject");
    }
  });
  it("is idempotent over an overlapping previously published source window", () => {
    const episode = clusterEvents(packet9)[0]!;
    const refs = evidencePacket(episode).sourceRefs;
    expect(
      dedupeEpisode(episode, [
        { id: "existing", sourceRefs: refs, state: "published" },
      ]).duplicate,
    ).toBe(true);
  });
  it("does not let unknown or self activity self-authorize", () => {
    expect(isEnabledRepository("edonahue/unknown")).toBe(false);
    expect(isEnabledRepository("edonahue/now-building-agent")).toBe(false);
  });
});
