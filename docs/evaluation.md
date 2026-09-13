# Evaluation corpus

Fixtures are compact normalized facts with public identifiers and timestamps, not raw API dumps. Each fixture records its source URLs, a retrieval date, normalized facts, expected deterministic behavior, and a Phase 2 note. Repository prose remains untrusted evidence.

| Fixture                                             | Expected deterministic result                            |
| --------------------------------------------------- | -------------------------------------------------------- |
| Charted Currents Packet 9 PR #7 + accepted closeout | One kept episode; closeout absorbed.                     |
| Networked Players PR #245                           | Kept executable-policy episode.                          |
| Networked Players Round 1 PR #246                   | Kept distinct expansion episode.                         |
| Pirate Arcade Kraken + polish commit                | One kept user-visible episode.                           |
| Charted Currents Moll correction + PR #8            | Group correction evidence; retain it for later judgment. |
| Networked Players #247–#251 Round 1 hardening       | One explainable hardening cluster, not five stories.     |
| Dependency/test/format-only cases                   | Reject only when all evidence is obviously low value.    |
| Same/overlapping source windows                     | Stable duplicate detection by exact canonical refs.      |

The suite also covers partial-overlap deduplication and provider normalization. Optional live GitHub canaries must remain separate from deterministic tests.
