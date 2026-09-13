import { describe, expect, it } from "vitest";
import { formatSourceRef, parseSourceRef, sourceRefUrl } from "../src/index.js";
describe("SourceRef", () => {
  it("round trips canonical PR, full SHA, and encoded release forms", () => {
    for (const value of [
      "github:edonahue/networked-players:pr:245",
      "github:edonahue/pirate-arcade-web:commit:98b16cb25f4ad66ec9ee156adda1dbeeec8f4f18",
      "github:edonahue/example:release:v1.0.0%2Fbeta",
    ]) {
      const parsed = parseSourceRef(value);
      expect(parsed).not.toBeNull();
      expect(formatSourceRef(parsed!)).toBe(value);
    }
  });
  it("rejects noncanonical or unsafe references", () => {
    expect(parseSourceRef("github:edonahue/example:commit:abc")).toBeNull();
    expect(parseSourceRef(" github:edonahue/example:pr:1")).toBeNull();
    expect(parseSourceRef("github:edonahue/example:pr:0")).toBeNull();
  });
  it("derives the evidence URL only from a parsed identifier", () => {
    expect(
      sourceRefUrl(parseSourceRef("github:edonahue/networked-players:pr:245")!),
    ).toBe("https://github.com/edonahue/networked-players/pull/245");
  });
});
