import * as Sentry from "@sentry/react-native";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

/**
 * Initializes Sentry error/crash monitoring.
 *
 * This intentionally does NOT collect device fingerprint data (model, OS
 * build, memory, etc.) beyond what Sentry attaches by default for crash
 * context. If you need custom breadcrumbs, add them explicitly and
 * deliberately rather than logging everything.
 *
 * If EXPO_PUBLIC_SENTRY_DSN is not set (e.g. local development without a
 * Sentry project configured yet), this is a no-op rather than a crash —
 * error monitoring is important, but it should never be a hard requirement
 * to run the app locally.
 */
export function initSentry() {
  if (!dsn) {
    if (__DEV__) {
      console.warn(
        "[sentry] EXPO_PUBLIC_SENTRY_DSN not set — Sentry is disabled for this run."
      );
    }
    return;
  }

  Sentry.init({
    dsn,
    // Keep this conservative in production. 1.0 (100%) is fine for early
    // development to see everything, but should be lowered before a real
    // production rollout to control event volume/cost.
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    // Disable in development by default so local errors don't pollute
    // your Sentry project while iterating.
    enabled: !__DEV__,
    debug: __DEV__,
  });
}

export { Sentry };
