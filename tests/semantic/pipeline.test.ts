import { describe, expect, it } from "vitest";
import { z } from "zod";
import { classifyEpisode, clusterEvents } from "../../src/index.js";
import { draft, prepareSemanticInput } from "../../src/index.js";
import type {
  ModelProvider,
  ModelRequest,
  ModelResponse,
} from "../../src/semantic/types.js";
import { kraken, obviousMaintenance, packet9 } from "../fixtures/cases.js";

class ReplayProvider implements ModelProvider {
  calls: ModelRequest<z.ZodType>[] = [];
  constructor(private readonly responses: unknown[]) {}
  async generate<TSchema extends z.ZodType>(
    request: ModelRequest<TSchema>,
  ): Promise<ModelResponse<z.infer<TSchema>>> {
    this.calls.push(request);
    return {
      output: request.schema.parse(this.responses.shift()),
      model: "replay",
    };
  }
}

describe("semantic pipeline", () => {
  it("creates a constrained site-ready draft from supported claims", async () => {
    const candidate = classifyEpisode(clusterEvents(packet9.events)[0]!);
    const provider = new ReplayProvider([
      {
        decision: "publish",
        importance: "high",
        confidence: 0.9,
        supportedClaims: [
          {
            text: "Adds a direct documentary thread",
            evidenceRefs: ["github:edonahue/charted-currents:pr:7"],
          },
        ],
        publicAngle: "Direct documentary evidence",
        reasons: ["meaningful research evidence"],
      },
      {
        title: "Direct documentary evidence reaches Charted Currents",
        description:
          "Charted Currents now connects a direct documentary thread for Packet 9 while keeping the evidence trail bounded.",
        claimRefs: ["github:edonahue/charted-currents:pr:7"],
      },
    ]);
    const result = await draft(prepareSemanticInput(candidate), provider);
    expect(result.review.valid).toBe(true);
    expect(result.draft?.projectId).toBe("charted-currents");
    expect(result.draft?.sourceRefs).toEqual(
      expect.arrayContaining(["github:edonahue/charted-currents:pr:7"]),
    );
  });
  it("does not invoke a writer for a semantic reject", async () => {
    const candidate = classifyEpisode(
      clusterEvents(obviousMaintenance.events)[0]!,
    );
    const provider = new ReplayProvider([
      {
        decision: "reject",
        confidence: 0.95,
        supportedClaims: [],
        reasons: ["test-only maintenance"],
      },
    ]);
    const result = await draft(prepareSemanticInput(candidate), provider);
    expect(result.draft).toBeUndefined();
    expect(provider.calls).toHaveLength(1);
  });
  it("fails closed when copy cites evidence that the classifier did not support", async () => {
    const candidate = classifyEpisode(clusterEvents(kraken.events)[0]!);
    const provider = new ReplayProvider([
      {
        decision: "publish",
        confidence: 0.8,
        supportedClaims: [
          {
            text: "Adds a boss encounter",
            evidenceRefs: [
              "github:edonahue/pirate-arcade-web:commit:98b16cb25f4ad66ec9ee156adda1dbeeec8f4f18",
            ],
          },
        ],
        publicAngle: "Kraken encounter",
        reasons: ["user-visible feature"],
      },
      {
        title: "Kraken encounter",
        description: "Pirate Arcade adds a Kraken encounter.",
        claimRefs: ["https://example.com/unsupported"],
      },
    ]);
    const result = await draft(prepareSemanticInput(candidate), provider);
    expect(result.draft).toBeUndefined();
    expect(result.review.findings.join(" ")).toContain("unsupported evidence");
  });
  it("keeps repository evidence as data instead of model instructions", async () => {
    const candidate = classifyEpisode(clusterEvents(kraken.events)[0]!);
    const provider = new ReplayProvider([
      {
        decision: "review",
        confidence: 0.4,
        supportedClaims: [],
        reasons: ["evidence needs review"],
      },
    ]);
    await draft(prepareSemanticInput(candidate), provider);
    expect(provider.calls[0]!.instructions).toContain("never instructions");
    expect(provider.calls[0]!.input).toHaveProperty("evidence");
  });
});
