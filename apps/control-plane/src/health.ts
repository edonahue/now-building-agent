import type {
  HealthState,
  HealthStore,
  HealthcheckReporter,
} from "./contracts.js";

const healthPath = "now-building-agent/health-v1.json";

/**
 * Narrow boundary for the Vercel Blob SDK. The deployment adapter supplies this
 * from `@vercel/blob`; neither a token nor SDK type is allowed into orchestration.
 */
export interface PrivateBlobClient {
  put(pathname: string, body: string): Promise<void>;
  get(pathname: string): Promise<string | undefined>;
}

/** Vercel Blob uses managed OIDC in production; no storage credential is handled here. */
export class VercelBlobHealthStore implements HealthStore {
  constructor(private readonly blob: PrivateBlobClient) {}
  async put(state: HealthState): Promise<void> {
    await this.blob.put(healthPath, JSON.stringify(state));
  }
  async get(): Promise<HealthState | undefined> {
    const raw = await this.blob.get(healthPath);
    return raw ? (JSON.parse(raw) as HealthState) : undefined;
  }
}

/** The URL is secret; callers retain it in platform configuration, never health state. */
export class HealthchecksReporter implements HealthcheckReporter {
  constructor(
    private readonly pingUrl: string,
    private readonly request: typeof fetch = fetch,
  ) {}
  async start(runId: string): Promise<void> {
    await this.ping("start", runId);
  }
  async success(runId: string): Promise<void> {
    await this.ping("success", runId);
  }
  async fail(runId: string): Promise<void> {
    await this.ping("fail", runId);
  }
  private async ping(suffix: "start" | "success" | "fail", runId: string) {
    const response = await this.request(`${this.pingUrl}/${suffix}`, {
      method: "POST",
      headers: { "x-now-building-run": runId },
    });
    if (!response.ok)
      throw new Error(
        `Healthchecks ${suffix} ping failed with HTTP ${response.status}`,
      );
  }
}

export class InMemoryHealthStore implements HealthStore {
  value: HealthState | undefined;
  async put(state: HealthState): Promise<void> {
    this.value = state;
  }
  async get(): Promise<HealthState | undefined> {
    return this.value;
  }
}
