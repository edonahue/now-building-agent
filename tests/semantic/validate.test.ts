import { describe, expect, it } from "vitest";
import { reviewCopy } from "../../src/semantic/validate.js";

const assessment = {
  decision: "publish" as const,
  confidence: 1,
  supportedClaims: [
    {
      text: "A measured result",
      evidenceRefs: ["github:edonahue/example:pr:1"],
    },
  ],
  reasons: ["evidence"],
};
describe("copy review", () => {
  it("rejects promotional and unsupported copy", () => {
    const result = reviewCopy(
      "A powerful new system",
      "I am excited to share a game-changing launch with faster performance.",
      assessment,
    );
    expect(result.valid).toBe(false);
    expect(result.findings.length).toBeGreaterThan(0);
  });
  it("accepts restrained project-centered copy", () => {
    expect(
      reviewCopy(
        "Executable roster-band guardrail",
        "Networked Players now enforces roster-band selection in the build path.",
        assessment,
      ),
    ).toEqual({ valid: true, findings: [] });
  });
});
