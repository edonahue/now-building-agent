# Now Building Agent

A portable, deterministic TypeScript core for turning authorized GitHub activity into explainable **Now Building** candidates. It deliberately stops before editorial prose or writes to any target site.

## Implemented scope

- Canonical GitHub `SourceRef` parsing, formatting, equality, and URL derivation.
- Normalized activity events; checked-in repository authorization; conservative episode clustering.
- Bounded evidence packets, obvious-low-value filtering, and in-memory published/proposed deduplication.
- Frozen public-evidence fixtures and deterministic evaluations.
- A provider-neutral semantic classifier/writer pipeline with strict schemas,
  factual/style validation, and a site-ready draft object that never writes.

The default suite has no model calls, credentials, GitHub writes, web framework, Vercel, workflow scheduler, database, dashboard, or target-site serializer. Phase 2 adds an opt-in OpenAI evaluation adapter; it is disabled unless `RUN_LIVE_EVAL=1` is explicitly set.

The separately deployable Phase 3 control-plane scaffold lives in
[`apps/control-plane`](apps/control-plane). It is read-only and fails closed
until Vercel Connect, private Blob, and external monitoring are intentionally
provisioned; it does not change the portable core's dependency boundary.

## Development

Node 22 or later is required.

```bash
npm ci
npm run check
npm run build
```

Live evaluation is deliberately separate from CI. It requires an existing `OPENAI_API_KEY`, an explicit model name, current per-million-token price inputs, and an explicit evaluation cap; it never writes to GitHub or the target site.

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
