/** Canonical, portable GitHub evidence identifiers shared with the site contract. */
export type SourceRef =
  | Readonly<{ owner: string; repo: string; kind: "pr"; value: number }>
  | Readonly<{ owner: string; repo: string; kind: "commit"; value: string }>
  | Readonly<{ owner: string; repo: string; kind: "release"; value: string }>;

const ownerPattern = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i;
const repoPattern = /^[a-z0-9_.-]+$/i;
const commitPattern = /^[0-9a-f]{40}$/i;
const releaseComponent = /^(?:[A-Za-z0-9._~-]|%[0-9A-Fa-f]{2})+$/;

function normalizedRepository(
  owner: string,
  repo: string,
): { owner: string; repo: string } {
  if (
    !ownerPattern.test(owner) ||
    !repoPattern.test(repo) ||
    repo.endsWith(".git")
  ) {
    throw new Error("Invalid GitHub repository identity");
  }
  return { owner: owner.toLowerCase(), repo: repo.toLowerCase() };
}

function encodeTag(tag: string): string {
  return encodeURIComponent(tag).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function formatSourceRef(ref: SourceRef): string {
  const repository = normalizedRepository(ref.owner, ref.repo);
  if (ref.kind === "pr") {
    if (!Number.isSafeInteger(ref.value) || ref.value < 1)
      throw new Error("Invalid PR number");
    return `github:${repository.owner}/${repository.repo}:pr:${ref.value}`;
  }
  if (ref.kind === "commit") {
    if (!commitPattern.test(ref.value))
      throw new Error("A commit source reference requires a full SHA");
    return `github:${repository.owner}/${repository.repo}:commit:${ref.value.toLowerCase()}`;
  }
  if (!ref.value) throw new Error("A release source reference requires a tag");
  return `github:${repository.owner}/${repository.repo}:release:${encodeTag(ref.value)}`;
}

export function parseSourceRef(input: string): SourceRef | null {
  if (input.trim() !== input) return null;
  const match = /^github:([^/]+)\/([^:]+):(pr|commit|release):(.+)$/.exec(
    input,
  );
  if (!match) return null;
  const [, owner = "", repo = "", kind = "", raw = ""] = match;
  try {
    const identity = normalizedRepository(owner, repo);
    if (kind === "pr" && /^[1-9]\d*$/.test(raw)) {
      const value = Number(raw);
      return Number.isSafeInteger(value) ? { ...identity, kind, value } : null;
    }
    if (kind === "commit" && commitPattern.test(raw))
      return { ...identity, kind, value: raw.toLowerCase() };
    if (kind === "release" && releaseComponent.test(raw)) {
      const value = decodeURIComponent(raw);
      return value ? { ...identity, kind, value } : null;
    }
  } catch {
    /* invalid percent encoding or repository */
  }
  return null;
}

export function sourceRefUrl(ref: SourceRef): string {
  const base = `https://github.com/${ref.owner}/${ref.repo}`;
  if (ref.kind === "pr") return `${base}/pull/${ref.value}`;
  if (ref.kind === "commit") return `${base}/commit/${ref.value}`;
  return `${base}/releases/tag/${encodeTag(ref.value)}`;
}

export function sourceRefEquals(left: SourceRef, right: SourceRef): boolean {
  return formatSourceRef(left) === formatSourceRef(right);
}
