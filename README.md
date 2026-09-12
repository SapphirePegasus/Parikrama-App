# Parikrama

A read-only companion app for festival celebrations: browse festivals and
areas pulled from Supabase, then tap any location to open it directly in
Google Maps. No accounts, no writes — just a friendly way to browse and
navigate.

Rebuilt on **Expo SDK 57** (React Native 0.86, React 19.2, New Architecture).

## Setup

```bash
npm install
cp .env.example .env
# then fill in the values below in .env
npx expo start
```

### Environment variables (`.env`)

| Variable | Required | Notes |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_KEY` | Yes | Supabase **anon/public** key — safe to embed client-side; access is controlled by RLS policies on each table, not by hiding this key. Never use the `service_role` key here. |
| `EXPO_PUBLIC_SENTRY_DSN` | No | Leave blank to run with Sentry disabled locally |

The app will throw a clear error on startup if the two required Supabase
variables are missing, instead of failing silently later.

### Expected Supabase tables

The app expects these tables to already exist (schema/column names carried
over unchanged from the original app, so no backend migration is needed):

- `ParikramaLocations` — cities
- `ParikramaFestivals` — festivals
- `ParikramaAreas` — areas within a city, linked to festivals
- `ParikramaCelebrations` — individual celebration pandals/locations
- `ParikramaUtilities` — nearby utility POIs (e.g. restrooms, parking)
- `ParikramaConfig` — optional remote config (theme color overrides, about
  page text, onboarding slide content) — the app works fine without any
  rows in this table, it just falls back to sensible defaults

## What changed from the original (SDK 53) version

This wasn't just a version bump — it's a rebuild, since the original was an
early learning project. Notable changes:

**Removed:**
- **Notes screen** — a local AsyncStorage notepad unrelated to the app's
  actual concept (browsing Supabase data). Confirmed unused before removal.
- **DeviceAnalytics** — silently collected a full device fingerprint (model,
  OS, memory, app version) and sent it to Supabase on every launch with no
  user consent or disclosure. This was a real privacy/compliance risk and
  has been removed entirely, replaced with proper opt-in crash/error
  monitoring via Sentry instead.
- Several dependencies that were declared but never actually imported
  anywhere in the code (`expo-blur`, `expo-haptics`, `expo-symbols`,
  `react-native-webview`, unused `@react-navigation/*` sub-packages, and two
  genuinely empty 0-byte files).

**Fixed:**
- The "Add Festival" / "Feedback" menu items were opening external Google
  Form URLs by misusing `router.push({ pathname: externalUrl })` — that's
  not what `expo-router` is for. Now uses `expo-web-browser` for a proper
  in-app browser.
- `useThemeColor` previously had every single themed component independently
  fetch the remote config table from Supabase on mount — with N themed
  components on a screen, that was N redundant network calls for identical
  data. Config is now fetched once at the root via `AppConfigContext` and
  shared.
- `StyleSheet.absoluteFillObject` was removed from React Native's type
  exports as of this RN version; updated to the current `StyleSheet.absoluteFill`
  (used in a style array, not spread as a plain object).
- `useColorScheme()` can now return `"unspecified"` (an Android concept) in
  addition to `light`/`dark`/`null` — the old `?? "light"` fallback only
  caught `null`. Added an explicit normalizer.
- A `useRef(value).current` pattern reading a ref directly during render
  (in the onboarding slide animation) was flagged by the newer React Hooks
  lint rules as compiler-unsafe; switched to lazy `useState(() => value)`.

**Migrated:**
- `@expo/vector-icons` → `@react-native-vector-icons/ionicons` (the former
  was deprecated as of Expo SDK 56). Icon names were unchanged since the
  app was already using current-style names.

**Architecture note — React Compiler:** the new SDK 57 default template
enables the experimental React Compiler (`experiments.reactCompiler`). I
evaluated it here and found its stricter lint rules flag the standard,
correct "fetch on mount" effect pattern (used throughout — `AppConfigContext`,
`useCachedQuery`) as risky, requiring restructuring every data-fetching hook
around the linter's specific accepted syntax shapes. For an app this size,
that churn wasn't worth it, so it's left **off** in `app.json`. This can be
revisited later; nothing here would need to change to turn it back on except
re-testing.

## Known issues (tracked, not blocking)

- `npm audit` reports moderate-severity findings tracing to `uuid <11.1.1`
  via `xcode` → `@expo/config-plugins`, which is a **build-time-only**
  dependency chain used during `expo prebuild`/native project generation —
  it does not ship inside the app's JS bundle or run on end-user devices.
  `npm audit fix --force` would resolve it by *downgrading*
  `expo-splash-screen`, which is the wrong fix. This is an upstream Expo CLI
  tooling issue to monitor, not something to work around here.
- ESLint 10 was released while this was being built. `eslint-config-expo@57.0.1`
  declares support for `eslint >=8.10`, so ESLint 9.x (used here, fully
  verified clean) is the safer choice until 10.x has had time to be tested
  against this exact config combination. Dev-tooling only — doesn't affect
  the shipped app.
- **Web static export crashes during SSR.** `npx expo export --platform web`
  fails with `ReferenceError: window is not defined` — Supabase's client
  (via `@react-native-async-storage/async-storage`'s web implementation,
  which reads `window.localStorage`) gets evaluated during static
  server-side rendering, where no DOM exists. This does **not** affect
  Android/iOS builds or `expo start --web` in dev mode with a browser
  attached — it's specific to the static export/pre-render step. This
  `web.output: "static"` config was inherited unchanged from the original
  SDK 53 `app.json`; it's not clear it was ever exercised there either. Fix
  would involve lazily initializing the Supabase client client-side-only
  (e.g. guarding on `typeof window !== "undefined"` or moving
  initialization into a client-only boundary) — happy to do this if you
  need static web export to actually work; not done here since it's
  orthogonal to the Android/iOS build you're testing.

## Project structure

```
app/            expo-router screens (file-based routing)
components/     Reusable UI components
context/        React context providers (app config, selected city)
hooks/          Data-fetching and theming hooks
lib/            Supabase client, Sentry init, shared maps-link helper
assets/         Fonts and images
```

## Scripts

```bash
npm run start       # Start the dev server
npm run android     # Start and open on Android
npm run ios         # Start and open on iOS
npm run web         # Start and open on web
npm run lint        # ESLint
npm run typecheck   # TypeScript, no emit
```

## Deployment

This reuses the original app's identity so it stays the same app on
EAS/stores rather than becoming an orphaned new one:

- Bundle identifier: `com.sapphirepegasus.parikrama`
- Scheme: `parikramaapp`
- EAS project ID: `f222f080-62c9-4650-9c72-17445c9ee517`

If any of those are wrong for your situation (e.g. you *want* a fresh EAS
project), update `app.json` and `eas.json` accordingly before your first
build.

### Sentry source map upload (optional, for production builds)

Basic error reporting works with just `EXPO_PUBLIC_SENTRY_DSN` set. For
readable production stack traces (source maps), you'll additionally need to
set a `SENTRY_AUTH_TOKEN` as an **EAS secret** (`eas secret:create`) —
never commit it to `.env` or `app.json`.
