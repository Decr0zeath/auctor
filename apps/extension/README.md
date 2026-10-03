# Auctor browser extension

Removes the feeds you land on and adds a pause before the ones you choose to enter. Chrome, Edge, Brave, and Firefox, built with [WXT](https://wxt.dev/).

## Develop

Needs Node 24 and pnpm (via `corepack enable`). From this folder:

| Command | What it does |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Open Chromium with the extension loaded, reloading on change (`pnpm dev:firefox` for Firefox) |
| `pnpm build` | Build to `.output/chrome-mv3` (`pnpm build:firefox` for `.output/firefox-mv2`) |
| `pnpm zip` | Package for the stores (`pnpm zip:firefox` also packages the source) |
| `pnpm check` | Type check, lint, format check, and unit tests, as CI runs them |
| `pnpm test:e2e` | Run the built extension against the live sites (run `pnpm build` and `pnpm exec playwright install chromium` first) |

To try a build in your own browser, open `chrome://extensions`, turn on Developer mode, choose **Load unpacked**, and select `.output/chrome-mv3`.

## How it's organized

```
src/
├── catalog/      ← the platform-neutral contract: surfaces, modes, settings rules, prompt wording
├── sites/        ← how each site's surfaces are found in the browser, as data
├── engine/       ← applies a site's rules to a page: hiding, the prompt, replacement panels
├── ui/           ← the settings screen, shared by the popup and the options page
├── entrypoints/  ← what WXT builds: the content script, popup, and options page
└── storage.ts    ← settings and passes in extension storage
```

`catalog/` has no browser code, so the Android app can follow the same rules. See [`docs/surfaces.md`](../../docs/surfaces.md).

## Adding a site

1. Add the site to `SITES` and its surfaces to `SURFACES` in `src/catalog/surfaces.ts`.
2. Write `src/sites/<site>.ts` with `defineSite`. The compiler checks that every surface of the site has rules.
3. List it in `src/sites/index.ts`. Content script matches follow automatically.
4. Add the surfaces to [`docs/surfaces.md`](../../docs/surfaces.md) (a unit test checks this) and cover them in `src/engine/plan.test.ts`.

Prefer rules in this order, because the later ones break more often when a site changes:

1. **URL patterns** (`gate`, `redirect`, and `on`): stable across redesigns.
2. **ARIA roles and stable IDs** in selectors.
3. **Class and element names**: last resort, and expect to maintain them.

## Permissions

Only `storage`. The content script runs only on the sites in `src/sites/`, and nothing leaves the browser.
