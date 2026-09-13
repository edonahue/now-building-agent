import { describe, expect, it } from "vitest";
import { clusterEvents } from "../../../src/index.js";
import { normalizeCommit } from "../../../src/providers/github.js";
import { InMemoryHealthStore } from "../src/health.js";
import { runDaily } from "../src/run.js";

const event = normalizeCommit({
  repository: "edonahue/pirate-arcade-web",
  sha: "a".repeat(40),
  title: "Kraken encounter",
  committedAt: "2026-09-13T09:00:00Z",
  changedFileFamilies: ["application"],
});
const healthchecks = {
  start: async () => {},
  success: async () => {},
  fail: async () => {},
};

describe("daily control-plane run", () => {
  it("collects authorized repositories and records sanitized success state without a model", async () => {
    const store = new InMemoryHealthStore();
    const result = await runDaily({
      collector: { listEvents: async () => [event] },
      healthStore: store,
      healthchecks,
      now: new Date("2026-09-13T10:15:00Z"),
      windowHours: 168,
    });
    expect(result.drafts).toEqual([]);
    expect(result.state).toMatchObject({
      status: "healthy_candidates",
      eventCount: 4,
      candidateCount: 4,
      draftCount: 0,
    });
    expect(store.value?.errorCode).toBeUndefined();
  });
  it("does not make an unstructured direct commit a merged episode", () => {
    expect(clusterEvents([event])).toHaveLength(1);
  });
  it("records failure and pings the external monitor when collection fails", async () => {
    const store = new InMemoryHealthStore();
    let failed = false;
    await expect(
      runDaily({
        collector: {
          listEvents: async () => {
            throw new Error("GitHub rate limited");
          },
        },
        healthStore: store,
        healthchecks: {
          ...healthchecks,
          fail: async () => {
            failed = true;
          },
        },
        now: new Date("2026-09-13T10:15:00Z"),
        windowHours: 168,
      }),
    ).resolves.toMatchObject({ state: { status: "degraded" } });
    expect(store.value?.status).toBe("degraded");
    expect(store.value?.failedRepositories).toHaveLength(4);
    expect(failed).toBe(true);
  });
});
