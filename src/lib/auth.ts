/**
 * ============================================================================
 *  STANDALONE-VS-EMBEDDED AUTH CONTRACT
 * ============================================================================
 *
 * This remote must work in TWO modes with the same code:
 *
 *  1. STANDALONE (dev at :5171): we own the login flow only minimally — for dev we just
 *     read whatever JWT is in localStorage (you can paste one in via the dev harness or a
 *     real login against the gateway through the /api proxy).
 *
 *  2. EMBEDDED (inside the shell at :5170): the SHELL owns auth. After the shell logs the
 *     user in, it stores the JWT and we must reuse THAT token so our Bearer header matches
 *     the shell's session. We never run our own login when embedded.
 *
 * The contract that makes both modes work is a SHARED, AGREED localStorage KEY plus an
 * optional in-memory window handle:
 *
 *   - localStorage["securebank.token"]  -> the raw JWT access token (PRIMARY contract).
 *       Both the shell and every remote read/write this exact key. This is the durable,
 *       cross-origin-safe channel (works even if the shell and remote briefly disagree on
 *       window globals during lazy load).
 *
 *   - window.__SECUREBANK__.getToken()  -> OPTIONAL fast path. If the shell publishes this
 *       (per MICROSERVICES_SPEC §5), we prefer it because it reflects in-memory token
 *       refreshes immediately without waiting for a storage write. We fall back to
 *       localStorage if it is absent (i.e. standalone mode).
 *
 * Keep this key in sync with the shell. If the shell ever changes the key, change THIS
 * constant only — nothing else in the remote references the raw string.
 */

/** The single source-of-truth localStorage key shared with the shell. */
export const TOKEN_STORAGE_KEY = "securebank.token";

/**
 * The optional runtime bridge the shell may expose on the global object. Declared loosely
 * so we never hard-depend on the shell being present (standalone must still compile/run).
 */
declare global {
  interface Window {
    __SECUREBANK__?: {
      /** Returns the current access token (already-refreshed) or null. */
      getToken?: () => string | null;
      /** The current i18n language, if the shell chooses to publish it. */
      getLanguage?: () => string | undefined;
    };
  }
}

/**
 * Resolve the JWT to send as `Authorization: Bearer <token>`.
 *
 * Order of preference:
 *   1. The shell's in-memory bridge (embedded mode, freshest token).
 *   2. The shared localStorage key (works in both modes).
 *
 * Returns null when there is no token (e.g. logged out / pre-login standalone).
 */
export function readAccessToken(): string | null {
  // 1. Embedded fast path — the shell's live token.
  const bridged = window.__SECUREBANK__?.getToken?.();
  if (bridged) return bridged;

  // 2. Durable shared channel — used standalone, and as the embedded fallback.
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    // localStorage can throw in locked-down embedding contexts; degrade gracefully.
    return null;
  }
}

/**
 * Persist a token under the shared key. Used by the STANDALONE dev harness only; in
 * embedded mode the shell is the writer and we never call this.
 */
export function writeAccessToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    /* no-op: see readAccessToken */
  }
}
