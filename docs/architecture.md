# Architecture

Dependency direction is one way: `providers -> core <- policy`, then `publication` projects a core result. Provider code may read GitHub; it must not pass raw API objects or repository instructions into the core. The core does not import the personal site or any SDK.

`WorkEpisode` is the editorial unit. Clustering uses discrete, provider-supplied reasons—same PR, explicit parent/source link, normalized shared episode marker, or immediate release—not an opaque score or title matching. Events without a deterministic relation remain separate for Phase 2.

`Candidate` has `keep`, `reject`, and `review`: rejection is limited to obvious low-value work, while structural application/data/release facts can be kept. `review` deliberately preserves uncertainty for later semantic classification. `EvidencePacket.untrustedRepositoryText` makes the trust boundary explicit.

Publication state is supplied as records from committed site content and open agent proposals. Exact canonical source-reference overlap makes duplicate invocation safe; partial overlap is an explicit `amendment`, never an automatic duplicate story.
