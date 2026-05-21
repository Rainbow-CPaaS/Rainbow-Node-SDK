# Changelog

All notable changes to this project will be documented in this file.

## [2.44.0] - 2026-05-22

### Fixed

- **`Bubble.ts` / `updateBubble`** — crash `TypeError: Cannot read properties of undefined (reading 'jid')` when `getContactById` fails during bubble update (`ownerContact` could be `undefined` on network error). Fixed with optional chaining (`ownerContact?.jid`).
- **`BubblesService.ts` / `refreshMemberAndOrganizerLists`** — same crash when `bubble.ownerContact` is `undefined` after a failed contact fetch. Fixed with optional chaining (`bubble.ownerContact?.jid`).
- **`HttpService.ts` / `calculateDelay`** — retry off-by-one: condition `(nbRetryBeforeFailed - attemptCount) > 1` meant `nbRetryBeforeFailed = 1` yielded 0 retries, and `nbRetryBeforeFailed = N` yielded `N-1` retries. Fixed to `> 0`. Affects all HTTP methods (GET, PUT, DELETE…).
- **`RESTService.ts` / `getContactInformationByID`** — called `http.get` with default `nbRetryBeforeFailed = 0`, so transient `ECONNRESET` errors were never retried. Now passes `nbRetryBeforeFailed = 1`.

### Changed

- **`HttpService.ts`** — direct HTTP/HTTPS agents (non-proxy) now use `agentkeepalive` (`HttpAgent` / `HttpsAgent`) instead of Node.js built-in `http.Agent` / `https.Agent`. The `agentkeepalive` package actively destroys idle free sockets after `freeSocketTimeout` (default 5 000 ms), preventing `ECONNRESET` caused by reusing connections closed server-side. The 5 s default is chosen for bot/SDK usage patterns where HTTP requests come in bursts triggered by XMPP events with long idle periods between them.
- **`config.ts` / `agentOptions.timeout`** — reduced from 120 002 ms to 55 000 ms (below server keep-alive idle timeout of ~60 s).
- **`index.ts` / `agentOptions.timeout`** — idem, reduced from 120 002 ms to 55 000 ms.

### Added

- **`agentkeepalive`** npm dependency — provides `freeSocketTimeout` option to proactively remove stale keep-alive sockets from the pool before the server closes them.
- **`agentOptions.freeSocketTimeout`** configuration key — controls how long idle free sockets are kept in the pool (default 5 000 ms). Configurable via `rest.gotOptions.agentOptions.freeSocketTimeout`. Set lower than the server keep-alive idle timeout to prevent stale socket reuse.
- **`HttpService.ts` / `stop()`** — now calls `reqAgentHttp.destroy()` and `reqAgentHttps.destroy()` to release all open sockets on shutdown; without this, `agentkeepalive` kept sockets alive and prevented the process from exiting.
