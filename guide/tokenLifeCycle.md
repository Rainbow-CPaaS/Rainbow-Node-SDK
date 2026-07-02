### Rainbow Token Lifecycle in NodeSDK

The Rainbow token (JWT) is the core authentication mechanism in the NodeSDK. It is used to authorize all REST API calls and to establish the XMPP connection. The SDK automatically manages its acquisition, storage, usage, and renewal.

#### Flowchart (Token Lifecycle)

<img src="/doc/sdk/node/guides/imgs/tokenLifeCycle.mmd.png" />

#### Key Components

*   **Initial Acquisition**:
    *   **Signin with Credentials**: Calls `/api/rainbow/authentication/v1.0/login` with user credentials. The server returns a JSON containing the `token`.
    *   **Signin with Token**: If an external token is provided, the SDK uses it directly.
*   **Storage**: The token is stored in `RESTService.tokenRest`. It's also decoded to extract information like `userId` and `exp`.
*   **Usage**: The `HttpService` automatically adds the `Authorization: Bearer <token>` header to every outgoing REST request.
*   **Automatic Renewal (Token Survey)**:
    *   `RESTService.startTokenSurvey()` is triggered after login.
    *   It calculates the time remaining before the token expires (based on the `exp` field in the JWT).
    *   A timer is set to refresh the token before it expires by calling `/api/rainbow/authentication/v1.0/renew`.
*   **Expiration/Errors**:
    *   If the renewal fails (e.g., network error, invalid session, or the maximum number of renewals reached on the server side), the SDK emits `evt_internal_tokenexpired`.
    *   The `Core` service then handles the transition to a `STOPPED` state or attempts a full reconnection if configured.
*   **Termination**:
    *   Calling `sdk.stop()` or `sdk.signout()` invalidates the token on the server via `/api/rainbow/authentication/v1.0/logout` and clears local timers.
    *   **Always call `stop()` before releasing the SDK reference.** The SDK keeps XMPP/WebSocket connections and timers alive in the Node.js event loop — setting your variable to `null` alone will not free memory. See [Getting Started — Stopping the SDK and avoiding memory leaks](/doc/sdk/node/guides/Getting_Started).

---

_Last updated July 2, 2026_