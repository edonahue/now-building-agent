import type { SemanticAssessment, SiteReadyDraft } from "./types.js";

const bannedPatterns = [
  /\bexcited to share\b/i,
  /\bleverag(?:e|ing) cutting-edge\b/i,
  /\bpowerful new\b/i,
  /\bseamlessly\b/i,
  /\bgame-changing\b/i,
  /\b(revolutionized|transformed)\b/i,
  /\bbuilt with ai\b/i,
];
const unsupportedPatterns = [
  /\b(launched|production|adoption|users?|customers?)\b/i,
  /\b(faster|improved performance|performance improvement)\b/i,
];

export interface CopyReview {
  readonly valid: boolean;
  readonly findings: readonly string[];
}

export function reviewCopy(
  title: string,
  description: string,
  assessment: SemanticAssessment,
): CopyReview {
  const findings: string[] = [];
  const text = `${title} ${description}`;
  if (title.length > 80) findings.push("title exceeds 80 characters");
  if (description.length > 240)
    findings.push("description exceeds 240 characters");
  if (
    /[.!?](?:\s|$)/g.test(description) &&
    (description.match(/[.!?](?:\s|$)/g)?.length ?? 0) > 2
  )
    findings.push("description uses more than two sentences");
  if (/\bI\b/.test(text))
    findings.push("copy defaults to project-centered voice, not first person");
  if (bannedPatterns.some((pattern) => pattern.test(text)))
    findings.push("copy uses prohibited promotional language");
  if (
    unsupportedPatterns.some((pattern) => pattern.test(text)) &&
    !assessment.supportedClaims.some((claim) =>
      /\b(launch|production|adoption|user|performance|faster)\b/i.test(
        claim.text,
      ),
    )
  )
    findings.push("copy makes an unsupported outcome claim");
  if (title.toLocaleLowerCase() === description.toLocaleLowerCase())
    findings.push("title duplicates description");
  return { valid: findings.length === 0, findings };
}

export function validateClaimRefs(
  refs: readonly string[],
  assessment: SemanticAssessment,
): string[] {
  const allowed = new Set(
    assessment.supportedClaims.flatMap((claim) => claim.evidenceRefs),
  );
  return refs.filter((ref) => !allowed.has(ref));
}

export function formatReviewReport(
  draft: SiteReadyDraft | undefined,
  assessment: SemanticAssessment,
  review: CopyReview,
): string {
  const lines = [
    `decision: ${assessment.decision}`,
    `confidence: ${assessment.confidence}`,
    `reasons: ${assessment.reasons.join("; ")}`,
  ];
  if (draft)
    lines.push(
      `title: ${draft.title}`,
      `description: ${draft.description}`,
      `sourceRefs: ${draft.sourceRefs.join(", ")}`,
    );
  lines.push(
    `copy review: ${review.valid ? "pass" : review.findings.join("; ")}`,
  );
  return lines.join("\n");
}
