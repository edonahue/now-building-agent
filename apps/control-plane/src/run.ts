import {
  classifyEpisode,
  clusterEvents,
  isEnabledRepository,
  prepareSemanticInput,
  type ActivityEvent,
  type ModelProvider,
  type SiteReadyDraft,
  draft,
} from "../../../src/index.js";
import type {
  HealthState,
  HealthStore,
  HealthcheckReporter,
  RunResult,
} from "./contracts.js";

export interface Collector {
  listEvents(
    repository: `${string}/${string}`,
    window: { start: string; end: string },
  ): Promise<readonly ActivityEvent[]>;
}
export interface DailyRunOptions {
  readonly collector: Collector;
  readonly healthStore: HealthStore;
  readonly healthchecks: HealthcheckReporter;
  readonly now?: Date;
  readonly windowHours: number;
  /** Undefined is the safe default: collection is still useful, model drafting is off. */
  readonly model?: ModelProvider;
}
const repositories = [
  "edonahue/charted-currents",
  "edonahue/networked-players",
  "edonahue/pirate-arcade-web",
  "edonahue/erich-lab",
].filter((repository) =>
  isEnabledRepository(repository),
) as `${string}/${string}`[];

function runId(now: Date): string {
  return `daily-${now.toISOString().replace(/[:.]/g, "-")}`;
}
function failureState(previous: HealthState, error: unknown): HealthState {
  return {
    ...previous,
    status: "failed",
    finishedAt: new Date().toISOString(),
    errorCode: error instanceof Error ? error.name : "unknown-error",
  };
}

/** Collection is read-only. A draft is an in-memory outcome, never a GitHub or site write. */
export async function runDaily(options: DailyRunOptions): Promise<RunResult> {
  const now = options.now ?? new Date();
  const id = runId(now);
  const start = new Date(
    now.getTime() - options.windowHours * 60 * 60 * 1000,
  ).toISOString();
  const running: HealthState = {
    schemaVersion: 1,
    runId: id,
    status: "running",
    startedAt: now.toISOString(),
    repositories,
    eventCount: 0,
    candidateCount: 0,
    draftCount: 0,
  };
  await options.healthStore.put(running);
  await options.healthchecks.start(id);
  try {
    const events = (
      await Promise.all(
        repositories.map((repository) =>
          options.collector.listEvents(repository, {
            start,
            end: now.toISOString(),
          }),
        ),
      )
    ).flat();
    const candidates = clusterEvents(events)
      .map(classifyEpisode)
      .filter((candidate) => candidate.decision !== "reject");
    const drafts: SiteReadyDraft[] = [];
    if (options.model)
      for (const candidate of candidates) {
        const input = prepareSemanticInput(candidate);
        const result = await draft(input, options.model);
        if (result.draft) drafts.push(result.draft);
      }
    const succeeded: HealthState = {
      ...running,
      status: "succeeded",
      finishedAt: new Date().toISOString(),
      eventCount: events.length,
      candidateCount: candidates.length,
      draftCount: drafts.length,
    };
    await options.healthStore.put(succeeded);
    await options.healthchecks.success(id);
    return { state: succeeded, events, drafts };
  } catch (error) {
    const failed = failureState(running, error);
    await options.healthStore.put(failed);
    await options.healthchecks.fail(id);
    throw error;
  }
}
