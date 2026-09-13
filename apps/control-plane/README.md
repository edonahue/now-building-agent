# Phase 3 control plane

This is the Vercel-specific, read-only operational shell around the portable
core in `../../src`. It is deliberately a separate application: the core has
no Vercel, Blob, Connect, scheduler, credential, or target-site dependency.

## Implemented behavior

- Vercel Cron invokes `GET /api/cron/daily` at 10:15 UTC, with an exact
  `CRON_SECRET` bearer check.
- A read-only GitHub REST collector handles bounded pagination and turns API
  responses into portable facts before handing them to the core.
- Every enabled repository is scanned with a rolling 7-day window by default.
  A repeated or overlapping run is safe because this phase only collects and
  drafts in memory; it has no GitHub or website write capability.
- Model drafting is opt-in (`NOW_BUILDING_DRAFT_ENABLED=1`) and not wired into
  the route yet. Default deployments therefore do **not** make model calls.
- A small, private, sanitized health record is the only proposed durable
  operational state. It contains counts and status, never repository prose,
  draft copy, GitHub tokens, model prompts, or a Healthchecks URL.
- `/api/health` requires its separate bearer secret and returns no cached
  response.

## Deployment prerequisites (not provisioned by this repository)

1. Create a separate Vercel project rooted at `apps/control-plane`.
2. Connect a **private** Vercel Blob store. At deployment time, implement
   `PrivateBlobClient` with `@vercel/blob` `put`/read calls using managed OIDC;
   do not pass or persist a Blob token in application code.
3. Configure Vercel Connect for GitHub with read access only to the four
   allowlisted public repositories. Implement `connectTokenProvider` with the
   Connect-issued short-lived token; never add a PAT fallback.
4. Create one Healthchecks.io daily monitor with a 24-hour period and six-hour
   grace. Set its secret ping URL only as `HEALTHCHECKS_PING_URL`.
5. Set `CRON_SECRET` and `NOW_BUILDING_HEALTH_SECRET` as different Vercel
   environment secrets. Keep `NOW_BUILDING_DRAFT_ENABLED` absent or `0` until
   the Phase 2 evaluation corpus is explicitly approved for scheduled use.

Until items 2–4 are complete, both runtime route adapters deliberately fail
closed. Nothing is silently downgraded to a long-lived GitHub credential or
public health endpoint.

## Required runtime configuration

| Name                         | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| `CRON_SECRET`                | Authorizes the scheduled route.           |
| `NOW_BUILDING_HEALTH_SECRET` | Authorizes the health endpoint.           |
| `HEALTHCHECKS_PING_URL`      | Secret external-monitor ping URL.         |
| `NOW_BUILDING_WINDOW_HOURS`  | Optional 24–336 hour window; default 168. |
| `NOW_BUILDING_DRAFT_ENABLED` | Optional `1`; disabled by default.        |

`GITHUB_API_BASE_URL` is test-only configuration for a GitHub-compatible
endpoint. Production stays on `https://api.github.com`.
