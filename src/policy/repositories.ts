export interface RepoPolicy {
  readonly repository: `${string}/${string}`;
  readonly enabled: boolean;
  readonly allowSelfReporting: boolean;
}

export const repositoryPolicies: readonly RepoPolicy[] = [
  {
    repository: "edonahue/charted-currents",
    enabled: true,
    allowSelfReporting: true,
  },
  {
    repository: "edonahue/networked-players",
    enabled: true,
    allowSelfReporting: true,
  },
  {
    repository: "edonahue/pirate-arcade-web",
    enabled: true,
    allowSelfReporting: true,
  },
  { repository: "edonahue/erich-lab", enabled: true, allowSelfReporting: true },
  // The agent is intentionally not self-reporting; add an explicit policy only if that changes.
  {
    repository: "edonahue/now-building-agent",
    enabled: false,
    allowSelfReporting: false,
  },
];

export function isEnabledRepository(
  repository: string,
  policies = repositoryPolicies,
): boolean {
  const policy = policies.find(
    (candidate) => candidate.repository === repository,
  );
  return policy?.enabled === true && policy.allowSelfReporting;
}
