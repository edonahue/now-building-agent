import type {
  ActivityEvent,
  ChangedFileFamily,
} from "../../src/core/activity.js";
import { parseSourceRef, sourceRefUrl } from "../../src/core/source-ref.js";

export function event(input: {
  id: string;
  repository: `${string}/${string}`;
  kind: ActivityEvent["kind"];
  ref: string;
  occurredAt: string;
  title: string;
  families: readonly ChangedFileFamily[];
  parentPr?: number;
}): ActivityEvent {
  const sourceRef = parseSourceRef(input.ref);
  if (!sourceRef) throw new Error(`Fixture has invalid ref ${input.ref}`);
  return {
    ...input,
    sourceRef,
    url: sourceRefUrl(sourceRef),
    changedFileFamilies: input.families,
    labels: [],
    evidence: [
      {
        sourceRef,
        url: sourceRefUrl(sourceRef),
        kind: "implementation",
        summary: input.title,
      },
    ],
  };
}

export const packet9 = [
  event({
    id: "cc-pr7",
    repository: "edonahue/charted-currents",
    kind: "merged-pr",
    ref: "github:edonahue/charted-currents:pr:7",
    occurredAt: "2026-09-06T12:00:00Z",
    title: "Packet 9 direct prize papers documentary thread",
    families: ["data", "application"],
  }),
  event({
    id: "cc-closeout",
    repository: "edonahue/charted-currents",
    kind: "commit",
    ref: "github:edonahue/charted-currents:commit:ce86adeff4df4043924ad9987f49d5b5cc25dd7b",
    occurredAt: "2026-09-06T18:00:00Z",
    title: "Packet 9 accepted hosted closeout",
    families: ["data"],
    parentPr: 7,
  }),
];
export const networked = [
  event({
    id: "np245",
    repository: "edonahue/networked-players",
    kind: "merged-pr",
    ref: "github:edonahue/networked-players:pr:245",
    occurredAt: "2026-09-04T23:52:12Z",
    title: "Executable roster band policy with measured slots filled",
    families: ["application", "data"],
  }),
  event({
    id: "np246",
    repository: "edonahue/networked-players",
    kind: "merged-pr",
    ref: "github:edonahue/networked-players:pr:246",
    occurredAt: "2026-09-08T00:37:53Z",
    title: "Graph-expansion Round 1: 179 to 217 albums",
    families: ["application", "data"],
  }),
];
export const kraken = [
  event({
    id: "pa-kraken",
    repository: "edonahue/pirate-arcade-web",
    kind: "commit",
    ref: "github:edonahue/pirate-arcade-web:commit:98b16cb25f4ad66ec9ee156adda1dbeeec8f4f18",
    occurredAt: "2026-09-05T10:00:00Z",
    title: "Kraken boss encounter for Kraken's Wake v2",
    families: ["application"],
  }),
  event({
    id: "pa-polish",
    repository: "edonahue/pirate-arcade-web",
    kind: "commit",
    ref: "github:edonahue/pirate-arcade-web:commit:4aabfcdbb9c590d8d47ac4a8abe5472955e04278",
    occurredAt: "2026-09-05T14:00:00Z",
    title: "Kraken polish single roar",
    families: ["application", "tests"],
  }),
];
