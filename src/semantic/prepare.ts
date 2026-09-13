import type { Candidate } from "../core/significance.js";
import { evidencePacket } from "../core/episode.js";
import type { SemanticInput } from "./types.js";

const projectMetadata: Record<string, SemanticInput["project"]> = {
  "edonahue/charted-currents": {
    id: "charted-currents",
    name: "Charted Currents",
    repoUrl: "https://github.com/edonahue/charted-currents",
    status: "research",
  },
  "edonahue/networked-players": {
    id: "networked-players",
    name: "Networked Players",
    repoUrl: "https://github.com/edonahue/networked-players",
    status: "building",
  },
  "edonahue/pirate-arcade-web": {
    id: "pirate-arcade-web",
    name: "Pirate Arcade",
    repoUrl: "https://github.com/edonahue/pirate-arcade-web",
    status: "shipped",
  },
  "edonahue/erich-lab": {
    id: "erich-lab",
    name: "Erich Lab",
    repoUrl: "https://github.com/edonahue/erich-lab",
    status: "experiment",
  },
};
function episodeDate(timestamp: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}
export function prepareSemanticInput(candidate: Candidate): SemanticInput {
  const { episode } = candidate;
  const project = projectMetadata[episode.repository];
  if (!project)
    throw new Error(`No project metadata for ${episode.repository}`);
  const timestamps = episode.events.map((event) => event.occurredAt).sort();
  const start = timestamps[0];
  const end = timestamps.at(-1);
  if (!start || !end) throw new Error("An episode needs source events");
  return {
    candidate,
    evidence: evidencePacket(episode),
    project,
    pubDate: episodeDate(end),
    sourceWindowStart: start,
    sourceWindowEnd: end,
  };
}
