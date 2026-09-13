const required = (value: string | undefined, name: string): string => {
  if (!value) throw new Error(`${name} is required`);
  return value;
};

export interface RuntimeConfig {
  readonly cronSecret: string;
  readonly healthSecret: string;
  readonly githubApiBaseUrl: string;
  readonly draftEnabled: boolean;
  readonly windowHours: number;
}

export function runtimeConfig(env = process.env): RuntimeConfig {
  const windowHours = Number(env.NOW_BUILDING_WINDOW_HOURS ?? "168");
  if (!Number.isInteger(windowHours) || windowHours < 24 || windowHours > 336)
    throw new Error(
      "NOW_BUILDING_WINDOW_HOURS must be an integer from 24 to 336",
    );
  return {
    cronSecret: required(env.CRON_SECRET, "CRON_SECRET"),
    healthSecret: required(
      env.NOW_BUILDING_HEALTH_SECRET,
      "NOW_BUILDING_HEALTH_SECRET",
    ),
    githubApiBaseUrl: env.GITHUB_API_BASE_URL ?? "https://api.github.com",
    draftEnabled: env.NOW_BUILDING_DRAFT_ENABLED === "1",
    windowHours,
  };
}

export function authorized(request: Request, secret: string): boolean {
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
