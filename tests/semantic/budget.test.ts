import { describe, expect, it } from "vitest";
import { z } from "zod";
import { BudgetedModelProvider } from "../../src/semantic/budget.js";
import type {
  ModelProvider,
  ModelRequest,
  ModelResponse,
} from "../../src/semantic/types.js";

class TokenProvider implements ModelProvider {
  async generate<TSchema extends z.ZodType>(
    request: ModelRequest<TSchema>,
  ): Promise<ModelResponse<z.infer<TSchema>>> {
    return {
      output: request.schema.parse({ ok: true }),
      model: "fake",
      usage: { inputTokens: 1_000_000, outputTokens: 0 },
    };
  }
}
describe("live evaluation budget", () => {
  it("stops subsequent calls at the configured ceiling", async () => {
    const provider = new BudgetedModelProvider(
      new TokenProvider(),
      { inputPerMillionUsd: 1, outputPerMillionUsd: 1 },
      1,
    );
    const request = {
      operation: "classify" as const,
      schema: z.object({ ok: z.boolean() }),
      instructions: "test",
      input: {},
    };
    await provider.generate(request);
    await expect(provider.generate(request)).rejects.toThrow("budget");
  });
});
