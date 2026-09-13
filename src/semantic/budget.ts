import type { ModelProvider, ModelRequest, ModelResponse } from "./types.js";
import { z } from "zod";

export interface TokenPrices {
  readonly inputPerMillionUsd: number;
  readonly outputPerMillionUsd: number;
}
export class BudgetedModelProvider implements ModelProvider {
  spentUsd = 0;
  constructor(
    private readonly provider: ModelProvider,
    private readonly prices: TokenPrices,
    private readonly maxUsd: number,
  ) {}
  async generate<TSchema extends z.ZodType>(
    request: ModelRequest<TSchema>,
  ): Promise<ModelResponse<z.infer<TSchema>>> {
    if (this.spentUsd >= this.maxUsd)
      throw new Error(`Live evaluation budget of $${this.maxUsd} is exhausted`);
    const response = await this.provider.generate(request);
    if (response.usage)
      this.spentUsd +=
        (response.usage.inputTokens * this.prices.inputPerMillionUsd +
          response.usage.outputTokens * this.prices.outputPerMillionUsd) /
        1_000_000;
    return response;
  }
}
