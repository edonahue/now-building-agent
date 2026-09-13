import type { SourceRef } from "./source-ref.js";

export type ActivityKind = "merged-pr" | "commit" | "release";
export type ChangedFileFamily =
  | "application"
  | "data"
  | "documentation"
  | "dependency"
  | "tests"
  | "ci"
  | "formatting"
  | "generated";

export interface ActivityEvent {
  readonly id: string;
  readonly repository: `${string}/${string}`;
  readonly kind: ActivityKind;
  readonly sourceRef: SourceRef;
  readonly occurredAt: string;
  readonly title: string;
  readonly url: string;
  readonly parentPr?: number;
  readonly branch?: string;
  readonly changedFileFamilies: readonly ChangedFileFamily[];
  readonly labels: readonly string[];
  readonly evidence: readonly EvidenceItem[];
}

export interface EvidenceItem {
  readonly sourceRef: SourceRef;
  readonly url: string;
  readonly kind:
    "implementation" | "measurement" | "release" | "closeout" | "prose";
  readonly summary: string;
}
