/**
 * Helpers shared by the thunks that load per-session data (permissions, user details, ...).
 *
 *  - Session guard: a response that belongs to a previous login must never be written into
 *    the store after logout / re-login, so every thunk remembers the token it started with
 *    and bails out with STALE_SESSION if the token changed meanwhile.
 *  - Retry: transient failures (network, timeout, 5xx) are retried with exponential backoff,
 *    but never across a session change and never for auth errors (401/403) or other 4xx.
 */

export const STALE_SESSION = 'STALE_SESSION';

export const MAX_RETRIES = 3; // total attempts = 1 + MAX_RETRIES
const BASE_DELAY_MS = 1000; // 1s, 2s, 4s

type GetState = () => unknown;

export const getSessionToken = (getState: GetState): string =>
  ((getState() as any)?.authorization?.token as string) || '';

export const isStaleSession = (getState: GetState, startToken: string): boolean =>
  getSessionToken(getState) !== startToken;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/** Network errors, timeouts, 408/429 and 5xx are worth retrying; other 4xx are not. */
export const isRetryableError = (err: any): boolean => {
  const status = err?.response?.status;
  if (status === undefined || status === null) return true; // network error / timeout
  return status === 408 || status === 429 || status >= 500;
};

/**
 * Runs `task` and retries on retryable failures.
 * `shouldRetryResult` lets callers treat an unsuccessful (but non-throwing) response as a failure.
 * Stops immediately when the session changes (logout / new login).
 */
export async function withRetry<T>(
  task: () => Promise<T>,
  getState: GetState,
  startToken: string,
  shouldRetryResult?: (res: T) => boolean,
): Promise<T> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await task();
      if (isStaleSession(getState, startToken)) return res; // caller handles stale
      if (shouldRetryResult && shouldRetryResult(res) && attempt < MAX_RETRIES) {
        // fall through to backoff
      } else {
        return res;
      }
    } catch (err) {
      if (
        isStaleSession(getState, startToken) ||
        !isRetryableError(err) ||
        attempt >= MAX_RETRIES
      ) {
        throw err;
      }
    }
    await sleep(BASE_DELAY_MS * 2 ** attempt);
    attempt += 1;
    if (isStaleSession(getState, startToken)) {
      throw new Error(STALE_SESSION);
    }
  }
}
