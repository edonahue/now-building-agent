# Architecture

Dependency direction is one way: `providers -> core <- policy`, then `publication` projects a core result. Provider code may read GitHub; it must not pass raw API objects or repository instructions into the core. The core does not import the personal site or any SDK.

`WorkEpisode` is the editorial unit. Clustering uses discrete, reported reasons—same PR, explicit parent PR, shared episode marker, immediate closeout, or immediate release—not an opaque score. Events without a deterministic relation remain separate for Phase 2.

`Candidate` has `keep`, `reject`, and `review`: rejection is limited to obvious low-value work. `review` deliberately preserves uncertainty for later semantic classification. `EvidencePacket.untrustedRepositoryText` makes the trust boundary explicit.

Publication state is supplied as records from committed site content and open agent proposals. Exact canonical source-reference overlap makes duplicate invocation safe; partial overlap remains visible as novel evidence rather than creating a duplicate story automatically.
