import { classifyEpisode } from "../core/significance.js";
import { clusterEvents } from "../core/cluster.js";
import { normalizeCommit, normalizePull } from "../providers/github.js";
import { BudgetedModelProvider, type TokenPrices } from "../semantic/budget.js";
import { draft } from "../semantic/pipeline.js";
import { prepareSemanticInput } from "../semantic/prepare.js";
import type { ModelProvider } from "../semantic/types.js";
import { formatReviewReport } from "../semantic/validate.js";

export function liveEvaluationInputs() {
  const pr = normalizePull({
    repository: "edonahue/charted-currents",
    number: 7,
    title:
      "Packet 9 — Direct Prize Papers Documentary Thread via Nationaal Archief",
    mergedAt: "2026-09-06T04:48:37Z",
    changedFileFamilies: ["data", "application"],
    episodeMarkers: ["charted-currents:packet-9"],
  });
  const closeout = normalizeCommit({
    repository: "edonahue/charted-currents",
    sha: "ce86adeff4df4043924ad9987f49d5b5cc25dd7b",
    title: "Packet 9 accepted/hosted closeout",
    committedAt: "2026-09-06T18:00:00Z",
    changedFileFamilies: ["data"],
    parentPr: 7,
    episodeMarkers: ["charted-currents:packet-9"],
  });
  return clusterEvents([pr, closeout]).map((episode) =>
    prepareSemanticInput(classifyEpisode(episode)),
  );
}

export async function runLiveEvaluation(
  provider: ModelProvider,
  prices: TokenPrices,
  maxUsd: number,
): Promise<string[]> {
  const budgeted = new BudgetedModelProvider(provider, prices, maxUsd);
  const reports: string[] = [];
  for (const input of liveEvaluationInputs()) {
    const result = await draft(input, budgeted);
    reports.push(
      formatReviewReport(result.draft, result.assessment, result.review),
    );
  }
  reports.push(`estimated spend: $${budgeted.spentUsd.toFixed(6)}`);
  return reports;
}
