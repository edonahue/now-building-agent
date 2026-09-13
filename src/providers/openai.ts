import OpenAI from "openai";
import { z } from "zod";
import type {
  ModelProvider,
  ModelRequest,
  ModelResponse,
} from "../semantic/types.js";

export class OpenAIModelProvider implements ModelProvider {
  readonly #client: OpenAI;
  constructor(
    readonly model: string,
    apiKey = process.env.OPENAI_API_KEY,
  ) {
    if (!apiKey)
      throw new Error("OPENAI_API_KEY is required for live evaluation");
    this.#client = new OpenAI({ apiKey });
  }
  async generate<TSchema extends z.ZodType>(
    request: ModelRequest<TSchema>,
  ): Promise<ModelResponse<z.infer<TSchema>>> {
    const response = await this.#client.responses.create({
      model: this.model,
      store: false,
      instructions: request.instructions,
      input: JSON.stringify(request.input),
      text: {
        format: {
          type: "json_schema",
          name: `now_building_${request.operation}`,
          strict: true,
          schema: z.toJSONSchema(request.schema),
        },
      },
    });
    if (!response.output_text)
      throw new Error("Model returned no structured output");
    return {
      output: request.schema.parse(JSON.parse(response.output_text)),
      model: this.model,
      ...(response.usage
        ? {
            usage: {
              inputTokens: response.usage.input_tokens,
              outputTokens: response.usage.output_tokens,
            },
          }
        : {}),
    };
  }
}
