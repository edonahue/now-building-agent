# Now Building Agent

A portable, deterministic TypeScript core for turning authorized GitHub activity into explainable **Now Building** candidates. It deliberately stops before editorial prose or writes to any target site.

## Phase 1 scope

- Canonical GitHub `SourceRef` parsing, formatting, equality, and URL derivation.
- Normalized activity events; checked-in repository authorization; conservative episode clustering.
- Bounded evidence packets, obvious-low-value filtering, and in-memory published/proposed deduplication.
- Frozen public-evidence fixtures and deterministic evaluations.

It has no model calls, credentials, GitHub writes, web framework, Vercel, workflow scheduler, database, dashboard, or target-site serializer.

## Development

Node 22 or later is required.

```bash
npm ci
npm run check
npm run build
```

Repository text is untrusted evidence, never executable instruction. A provider must normalize public facts into `ActivityEvent` before the core sees them. The source registry is authorization: unknown and self-reporting repositories are disabled by default.

## Publication contract

The core emits `ProposedBuildUpdate`, not Markdown or commits. Its `SourceRef` grammar is the stable cross-repository boundary:

```text
github:<owner>/<repo>:pr:<positive-integer>
github:<owner>/<repo>:commit:<full-40-char-sha>
github:<owner>/<repo>:release:<percent-encoded-tag>
```

The personal site remains the final schema and CI authority. A later target adapter may serialize a proposal only after validating the site’s independently documented publication contract.

See [docs/architecture.md](docs/architecture.md) and [docs/evaluation.md](docs/evaluation.md).
