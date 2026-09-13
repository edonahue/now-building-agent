import type { ActivityEvent } from "../../src/core/activity.js";
import { normalizeCommit, normalizePull } from "../../src/providers/github.js";

/** Reduced public GitHub facts; retrieved 2026-09-13. Raw API payloads are intentionally not retained. */
export interface FixtureCase {
  readonly id: string;
  readonly sourceUrls: readonly string[];
  readonly asOf: "2026-09-13";
  readonly events: readonly ActivityEvent[];
  readonly expected: {
    readonly episodes: number;
    readonly decision: "keep" | "reject" | "review";
  };
  readonly phase2Note: string;
}

const packet9Pr = normalizePull({
  repository: "edonahue/charted-currents",
  number: 7,
  title:
    "Packet 9 — Direct Prize Papers Documentary Thread via Nationaal Archief",
  mergedAt: "2026-09-06T04:48:37Z",
  changedFileFamilies: ["data", "application"],
  episodeMarkers: ["charted-currents:packet-9"],
});
const packet9Closeout = normalizeCommit({
  repository: "edonahue/charted-currents",
  sha: "ce86adeff4df4043924ad9987f49d5b5cc25dd7b",
  title: "Packet 9 accepted/hosted closeout",
  committedAt: "2026-09-06T18:00:00Z",
  changedFileFamilies: ["data"],
  parentPr: 7,
  episodeMarkers: ["charted-currents:packet-9"],
});
export const packet9: FixtureCase = {
  id: "charted-currents-packet-9",
  sourceUrls: [packet9Pr.url, packet9Closeout.url],
  asOf: "2026-09-13",
  events: [packet9Pr, packet9Closeout],
  expected: { episodes: 1, decision: "keep" },
  phase2Note: "One research episode; closeout must not become another story.",
};

const mollCommit = normalizeCommit({
  repository: "edonahue/charted-currents",
  sha: "d7088e6098574c555833c3201644bc7e547b5475",
  title:
    "realign Herman Moll 1715 period map with affine graticule and inset mask",
  committedAt: "2026-09-06T14:02:08Z",
  changedFileFamilies: ["data", "application"],
  parentPr: 8,
  episodeMarkers: ["charted-currents:moll-georeference"],
});
const mollPr = normalizePull({
  repository: "edonahue/charted-currents",
  number: 8,
  title:
    "Corrective Interstitial — Herman Moll Period Map Georeference Quality Pass",
  mergedAt: "2026-09-08T04:50:20Z",
  changedFileFamilies: ["data", "application", "tests"],
  episodeMarkers: ["charted-currents:moll-georeference"],
});
export const mollCorrection: FixtureCase = {
  id: "charted-currents-moll-georeference",
  sourceUrls: [mollCommit.url, mollPr.url],
  asOf: "2026-09-13",
  events: [mollCommit, mollPr],
  expected: { episodes: 1, decision: "keep" },
  phase2Note:
    "Retain correction evidence; semantic review decides public relevance.",
};

export const networkedPolicy: FixtureCase = {
  id: "networked-players-roster-band-policy",
  sourceUrls: ["https://github.com/edonahue/networked-players/pull/245"],
  asOf: "2026-09-13",
  events: [
    normalizePull({
      repository: "edonahue/networked-players",
      number: 245,
      title:
        "Make select-graph-rich-candidates enforce the committed roster band",
      mergedAt: "2026-09-04T23:52:12Z",
      changedFileFamilies: ["application", "data"],
    }),
  ],
  expected: { episodes: 1, decision: "keep" },
  phase2Note: "Measured executable-policy episode.",
};
export const roundOne: FixtureCase = {
  id: "networked-players-round-1-expansion",
  sourceUrls: ["https://github.com/edonahue/networked-players/pull/246"],
  asOf: "2026-09-13",
  events: [
    normalizePull({
      repository: "edonahue/networked-players",
      number: 246,
      title: "Graph-expansion Round 1: 179 → 217 albums",
      mergedAt: "2026-09-08T00:37:53Z",
      changedFileFamilies: ["application", "data"],
      episodeMarkers: ["networked-players:round-1"],
    }),
  ],
  expected: { episodes: 1, decision: "keep" },
  phase2Note: "Major distinct expansion episode.",
};
export const roundOneHardening: FixtureCase = {
  id: "networked-players-round-1-hardening",
  sourceUrls: [247, 248, 249, 250, 251].map(
    (number) => `https://github.com/edonahue/networked-players/pull/${number}`,
  ),
  asOf: "2026-09-13",
  events: [
    [
      247,
      "Give the daily-manifest extender a schema-v2 form",
      "2026-09-08T02:00:51Z",
    ],
    [
      248,
      "Stamp the parameters each builder actually ran with",
      "2026-09-08T02:50:02Z",
    ],
    [
      249,
      "Record that contributor pages are derived, not permanent",
      "2026-09-08T06:48:04Z",
    ],
    [
      250,
      "Read build parameters back from the previous artifact",
      "2026-09-08T07:10:31Z",
    ],
    [
      251,
      "Add the two missing artifact fan-out targets",
      "2026-09-08T08:01:08Z",
    ],
  ].map(([number, title, mergedAt]) =>
    normalizePull({
      repository: "edonahue/networked-players",
      number: Number(number),
      title: String(title),
      mergedAt: String(mergedAt),
      changedFileFamilies: ["application", "data"],
      episodeMarkers: ["networked-players:round-1-hardening"],
    }),
  ),
  expected: { episodes: 1, decision: "keep" },
  phase2Note: "Hardening evidence should not become five public stories.",
};

const krakenCommit = normalizeCommit({
  repository: "edonahue/pirate-arcade-web",
  sha: "98b16cb25f4ad66ec9ee156adda1dbeeec8f4f18",
  title: "Kraken boss encounter for Kraken's Wake v2",
  committedAt: "2026-09-05T23:07:03Z",
  changedFileFamilies: ["application"],
});
const krakenPolish = normalizeCommit({
  repository: "edonahue/pirate-arcade-web",
  sha: "4aabfcdbb9c590d8d47ac4a8abe5472955e04278",
  title: "single Kraken roar, collapsed arrival, one-shot debug seed",
  committedAt: "2026-09-06T01:10:51Z",
  changedFileFamilies: ["application", "tests"],
  relatedSourceRefs: [krakenCommit.sourceRef],
});
export const kraken: FixtureCase = {
  id: "pirate-arcade-kraken",
  sourceUrls: [krakenCommit.url, krakenPolish.url],
  asOf: "2026-09-13",
  events: [krakenCommit, krakenPolish],
  expected: { episodes: 1, decision: "keep" },
  phase2Note: "One user-visible Kraken episode; polish belongs to it.",
};
export const obviousMaintenance: FixtureCase = {
  id: "pirate-arcade-test-and-dependency-maintenance",
  sourceUrls: [
    "https://github.com/edonahue/pirate-arcade-web/commit/006421bc63602719c3b4a9cca8967ffb716ad3f2",
    "https://github.com/edonahue/pirate-arcade-web/commit/8fcb001de4fa402ab52c97ff32daebf5b1890d66",
  ],
  asOf: "2026-09-13",
  events: [
    normalizeCommit({
      repository: "edonahue/pirate-arcade-web",
      sha: "006421bc63602719c3b4a9cca8967ffb716ad3f2",
      title: "stabilize treasure-wind test around paused-state freshness",
      committedAt: "2026-09-06T04:29:18Z",
      changedFileFamilies: ["tests"],
    }),
    normalizeCommit({
      repository: "edonahue/pirate-arcade-web",
      sha: "8fcb001de4fa402ab52c97ff32daebf5b1890d66",
      title: "bump dev-dependencies",
      committedAt: "2026-07-01T05:26:54Z",
      changedFileFamilies: ["dependency"],
    }),
  ],
  expected: { episodes: 2, decision: "reject" },
  phase2Note: "Do not promote maintenance into a public story.",
};
