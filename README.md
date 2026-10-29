# Pueblo

Scoreboard app for the card game Pueblo. Built with Expo (SDK 58) and React Native.

## Develop

```bash
npm install
npm start        # dev server (needs a development build: eas build --profile development)
npm test         # scoring logic tests
npm run doctor   # Expo health checks
```

## Layout

- `src/game/logic.js` — pure scoring functions (totals, standings, history, game over). Tested in `logic.test.js`.
- `src/game/store.js` — the single game store (Zustand), saved to the device with AsyncStorage.
- `src/screens/` — one file per screen. Screens read and write the store; they don't pass game data through navigation.
- `src/components/ui.js` — shared UI building blocks (buttons, cards, avatars, progress bars, footer).
- `src/theme.js` — design tokens: light and dark colours, type scale, spacing. Use `useStyles` to build themed styles.

## Crash reporting (Sentry)

Sentry only starts when `EXPO_PUBLIC_SENTRY_DSN` is set. To turn it on:

1. Create a React Native project in Sentry and copy its DSN.
2. Add it as an EAS environment variable: `eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value <dsn> --environment production`.
3. For readable stack traces, also add `SENTRY_ORG`, `SENTRY_PROJECT` and a secret `SENTRY_AUTH_TOKEN`, then remove `SENTRY_DISABLE_AUTO_UPLOAD` from `eas.json`.

## Release

Build numbers are managed by EAS (`appVersionSource: remote`, `autoIncrement` on production).

```bash
eas build --platform ios --profile production
eas submit --platform ios
```
