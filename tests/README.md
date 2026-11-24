# Verification scripts

- `npm run typecheck` — strict TypeScript (`tsc --noEmit`).
- `npm run lint` — source/CSP/content/asset contract validation.
- `npm test` — six Node source tests.
- `npm run build` — strict type check and complete static production bundle.
- `python3 tests/static_integrity.py` — compiled HTML link/ID/alt checks and CSS parser checks (`tinycss2`).
- `python3 tests/browser_smoke.py` — five Chromium viewport/reduced-motion flows with scenario, chart, network, support and wall interactions (requires `playwright` and an installed Chromium binary; launch path may need adjusting).

The browser script deliberately intercepts the remote Unsplash image host to simulate a school network blocking outside photographs; the expected result is working local artwork fallbacks.

Browser navigation in the original evaluation container was blocked by Chromium's administrator policy even for a `data:` page, so the script was **provided but not passed in that environment**. The failure is an environment permission restriction, not proof that the application failed. It also means GPU shader compilation, physical audio and responsive screenshot results are not verified there.
