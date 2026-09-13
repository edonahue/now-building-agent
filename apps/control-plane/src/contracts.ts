import type { ActivityEvent, SiteReadyDraft } from "../../../src/index.js";

/** A token is acquired at the edge and must never be persisted or logged. */
export interface GitHubTokenProvider {
  getToken(): Promise<string>;
}

export interface HealthcheckReporter {
  start(runId: string): Promise<void>;
  success(runId: string): Promise<void>;
  fail(runId: string): Promise<void>;
}

export interface HealthState {
  readonly schemaVersion: 1;
  readonly runId: string;
  readonly status: "running" | "succeeded" | "failed";
  readonly startedAt: string;
  readonly finishedAt?: string;
  readonly repositories: readonly string[];
  readonly eventCount: number;
  readonly candidateCount: number;
  readonly draftCount: number;
  readonly errorCode?: string;
}

/** Only this sanitized operational record may be persisted outside GitHub. */
export interface HealthStore {
  put(state: HealthState): Promise<void>;
  get(): Promise<HealthState | undefined>;
}

export interface RunResult {
  readonly state: HealthState;
  readonly events: readonly ActivityEvent[];
  readonly drafts: readonly SiteReadyDraft[];
}
