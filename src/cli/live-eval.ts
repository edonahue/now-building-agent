import { runLiveEvaluation } from "../evaluation/live.js";
import { OpenAIModelProvider } from "../providers/openai.js";

function requiredNumber(name: string): number {
  const value = Number(process.env[name]);
  if (!Number.isFinite(value) || value < 0)
    throw new Error(`${name} must be a non-negative number`);
  return value;
}
if (process.env.RUN_LIVE_EVAL !== "1") {
  throw new Error(
    "Live evaluation is disabled by default. Set RUN_LIVE_EVAL=1 explicitly.",
  );
}
const model = process.env.NOW_BUILDING_MODEL;
if (!model) throw new Error("NOW_BUILDING_MODEL is required");
const report = await runLiveEvaluation(
  new OpenAIModelProvider(model),
  {
    inputPerMillionUsd: requiredNumber("OPENAI_INPUT_PER_MILLION_USD"),
    outputPerMillionUsd: requiredNumber("OPENAI_OUTPUT_PER_MILLION_USD"),
  },
  requiredNumber("NOW_BUILDING_EVAL_MAX_USD"),
);
console.log(report.join("\n\n"));
