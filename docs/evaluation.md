# Evaluation corpus

Fixtures are compact normalized facts with public identifiers and timestamps, not raw API dumps. Their source refs are human-traceable GitHub provenance.

| Fixture                                             | Expected deterministic result                         |
| --------------------------------------------------- | ----------------------------------------------------- |
| Charted Currents Packet 9 PR #7 + accepted closeout | One kept episode; closeout absorbed.                  |
| Networked Players PR #245                           | Kept executable-policy episode.                       |
| Networked Players Round 1 PR #246                   | Kept distinct expansion episode.                      |
| Pirate Arcade Kraken + polish commit                | One kept user-visible episode.                        |
| Dependency/test/format-only cases                   | Reject only when all evidence is obviously low value. |
| Same/overlapping source windows                     | Stable duplicate detection by exact canonical refs.   |

The next phase should add the Moll corrective sequence and #247–#251 as frozen fixture records, including provenance notes and intentionally ambiguous expected `review` cases. Optional live GitHub canaries must remain separate from this deterministic suite.
