# Rainbow Node SDK (LTS) — Security Audit Remediation Report

## Context

An `npm audit` run against Rainbow-Node-SDK-LTS reported **67 findings** (4 critical, 30 high, 21 moderate, 11 low). A root-cause analysis showed these findings trace back to **5 dependency chains**, not 67 independent issues. This report summarizes what was found, what was fixed, and what remains.

Fixes are shipped in **Rainbow-Node-SDK-LTS 2.42.0-lts.7**.

## What was fixed

| Root cause | Findings resolved | Fix |
|---|---|---|
| `dns` package (dead dependency) | 38 (3 critical, 15 high, 11 moderate, 9 low) | Removed. The package was never actually loaded at runtime — Node's built-in `dns` module always takes priority over an npm package of the same name — so it was pure dead weight pulling in a large chain of outdated transitive dependencies (old Express/Socket.IO/body-parser/etc. via a legacy `tomahawk` dependency). |
| `uuid` (vulnerable version) | 1 (moderate) | Updated to a patched version. |
| `request` (risk reduction) | 0 — `request` remains installed, see below | The one code path that used the deprecated `request` library **unconditionally** (binary file downloads) now uses `got`, the same modern HTTP client used everywhere else in the SDK. This doesn't remove any audit line (the package is still installed for the reason below) but closes the only exposure that couldn't be avoided through configuration. |
| `adaptive-expressions` / `adaptivecards-templating` | 4 (1 high, 2 moderate, 1 low) | Moved to development-only dependencies. These packages are used exclusively by an internal example script, never by the SDK library code itself. npm never installs another package's development dependencies, so anyone installing the SDK as a dependency no longer gets these packages — or their vulnerabilities — at all. |

**Net effect for a normal SDK consumer: ~43 of the 67 findings are eliminated entirely.**

## What remains, and why

- **`request` chain (~17 findings: hoek, hawk, qs, form-data, tough-cookie, tunnel-agent, mime)** — `request` is intentionally kept as an opt-in fallback behind the `useGotLibForHttp` configuration option, which **defaults to `true`** (using `got`). The legacy `request`-based code only runs if you explicitly set `useGotLibForHttp: false`. If you don't set this option, this code path never executes at runtime — though `npm audit` will still list these findings, since the package remains installed.
- **`jsdoc-x` chain (~6 findings: jsdoc, taffydb, tmp, markdown-it, linkify-it)** — used only to generate the SDK's documentation during development. It's a development-only dependency and is never installed when you add the SDK to your own project.

## Recommended action

- Upgrade to `Rainbow-Node-SDK-LTS 2.42.0-lts.7` or later.
- If your configuration does not set `useGotLibForHttp: false`, no further action is required regarding this audit.
- If you do rely on `useGotLibForHttp: false`, be aware that this legacy path carries known vulnerable transitive dependencies. Consider migrating to the default `got`-based path when possible.
