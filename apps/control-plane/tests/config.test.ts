import { describe, expect, it } from "vitest";
import { authorized, runtimeConfig } from "../src/config.js";

describe("runtime configuration", () => {
  const env = { CRON_SECRET: "cron", NOW_BUILDING_HEALTH_SECRET: "health" };
  it("keeps drafting disabled unless explicitly enabled", () => {
    expect(runtimeConfig(env).draftEnabled).toBe(false);
    expect(
      runtimeConfig({ ...env, NOW_BUILDING_DRAFT_ENABLED: "1" }).draftEnabled,
    ).toBe(true);
  });
  it("requires secrets and rejects an unsafe window", () => {
    expect(() =>
      runtimeConfig({ NOW_BUILDING_HEALTH_SECRET: "health" }),
    ).toThrow("CRON_SECRET");
    expect(() =>
      runtimeConfig({ ...env, NOW_BUILDING_WINDOW_HOURS: "1" }),
    ).toThrow("WINDOW");
  });
  it("uses exact bearer comparisons for non-public routes", () => {
    expect(
      authorized(
        new Request("https://example.test", {
          headers: { authorization: "Bearer cron" },
        }),
        "cron",
      ),
    ).toBe(true);
    expect(authorized(new Request("https://example.test"), "cron")).toBe(false);
  });
});
