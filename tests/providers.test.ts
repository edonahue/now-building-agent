import { describe, expect, it } from "vitest";
import {
  normalizeCommit,
  normalizePull,
  normalizeRelease,
} from "../src/providers/github.js";

describe("GitHub fact normalization", () => {
  it("does not expose raw provider shapes to the core", () => {
    const event = normalizePull({
      repository: "edonahue/example",
      number: 12,
      title: "Merged change",
      mergedAt: "2026-09-01T00:00:00Z",
      changedFileFamilies: ["application"],
    });
    expect(event.sourceRef).toMatchObject({ kind: "pr", value: 12 });
    expect(event.url).toBe("https://github.com/edonahue/example/pull/12");
  });
  it("normalizes full commit SHAs and release tags", () => {
    const commit = normalizeCommit({
      repository: "edonahue/example",
      sha: "a".repeat(40),
      title: "Direct change",
      committedAt: "2026-09-01T00:00:00Z",
      changedFileFamilies: ["application"],
    });
    const release = normalizeRelease({
      repository: "edonahue/example",
      tag: "v1.0.0/beta",
      title: "Release",
      publishedAt: "2026-09-01T01:00:00Z",
      changedFileFamilies: ["application"],
    });
    expect(commit.url).toContain(`/commit/${"a".repeat(40)}`);
    expect(release.url).toContain("/releases/tag/v1.0.0%2Fbeta");
  });
});
