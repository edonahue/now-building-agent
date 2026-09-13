import { z } from "zod";
import type { Candidate } from "../core/significance.js";
import type { EvidencePacket } from "../core/episode.js";

export const semanticDecisionSchema = z.enum(["publish", "reject", "review"]);
export const importanceSchema = z.enum(["low", "medium", "high", "very-high"]);
export const supportedClaimSchema = z.object({
  text: z.string().trim().min(1).max(240),
  evidenceRefs: z.array(z.string().trim().min(1)).min(1).max(4),
});

export const semanticAssessmentSchema = z
  .object({
    decision: semanticDecisionSchema,
    importance: importanceSchema.optional(),
    confidence: z.number().min(0).max(1),
    supportedClaims: z.array(supportedClaimSchema).max(4),
    publicAngle: z.string().trim().min(1).max(160).optional(),
    reasons: z.array(z.string().trim().min(1).max(160)).min(1).max(4),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.decision === "publish" && value.supportedClaims.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["supportedClaims"],
        message: "A publish decision needs supported claims",
      });
    }
    if (value.decision !== "publish" && value.publicAngle) {
      context.addIssue({
        code: "custom",
        path: ["publicAngle"],
        message: "Only publish decisions may set a public angle",
      });
    }
  });
export type SemanticAssessment = z.infer<typeof semanticAssessmentSchema>;

export const draftCopySchema = z
  .object({
    title: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(240),
    claimRefs: z.array(z.string().trim().min(1)).min(1).max(4),
  })
  .strict();
export type DraftCopy = z.infer<typeof draftCopySchema>;

export interface ModelRequest<TSchema extends z.ZodType> {
  readonly operation: "classify" | "draft";
  readonly schema: TSchema;
  readonly instructions: string;
  readonly input: unknown;
}
export interface ModelResponse<T> {
  readonly output: T;
  readonly usage?: {
    readonly inputTokens: number;
    readonly outputTokens: number;
  };
  readonly model: string;
}
export interface ModelProvider {
  generate<TSchema extends z.ZodType>(
    request: ModelRequest<TSchema>,
  ): Promise<ModelResponse<z.infer<TSchema>>>;
}

export interface SiteReadyDraft {
  readonly contractVersion: 1;
  readonly candidate: Candidate;
  readonly assessment: SemanticAssessment;
  readonly title: string;
  readonly description: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly repoUrl: string;
  readonly pubDate: string;
  readonly status: "shipped" | "building" | "research" | "experiment";
  readonly sourceRefs: readonly string[];
  readonly sourceWindowStart?: string;
  readonly sourceWindowEnd?: string;
}

export interface SemanticInput {
  readonly candidate: Candidate;
  readonly evidence: EvidencePacket;
  readonly project: {
    readonly id: string;
    readonly name: string;
    readonly repoUrl: string;
    readonly status: SiteReadyDraft["status"];
  };
  readonly pubDate: string;
  readonly sourceWindowStart?: string;
  readonly sourceWindowEnd?: string;
}
