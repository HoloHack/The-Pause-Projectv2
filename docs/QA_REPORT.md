# QA report — The Pause Project V2

**Build date:** 24 November 2026 (user's Australian-local project context).  
**Status:** Complete production build candidate; integrated live-browser and deployed-host acceptance remain unverified.

## Tests actually run

| Check | Result | Evidence |
|---|---|---|
| `npm run typecheck` (`tsc --noEmit`) | **PASS** | TypeScript 5.8.3 strict check returned exit status 0 |
| `npm run lint` | **PASS** | Structural content, sources, CSP, image assets, shader presence, safe text insertion and unfinished-marker checks |
| `npm test` | **PASS: 6/6** | Node built-in test runner: all six source tests passed |
| `npm run build` | **PASS** | Built complete `dist/` using compiled TypeScript ES modules, styles, HTML, assets and deployment support files |
| `python3 tests/static_integrity.py` | **PASS** | 48 unique element IDs, 5 image elements, 38 links, all internal links valid, alt text on all photos, CSP-safe external link attributes, 305 parseable CSS top-level rules, no CSS parse errors |
| Python Playwright / local Chromium navigations | **BLOCKED BY ENVIRONMENT** | Chromium returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` for localhost, file and even `data:` navigation |
| Live WebGL2 shader compilation, real desktop/mobile FPS | **NOT VERIFIED** | Browser navigation unavailable; source shader compile paths statically checked only |
| Browser narration / actual audio output | **NOT VERIFIED** | Device and browser access not available |
| Real Unsplash photographic network transfer | **NOT VERIFIED** | Build container cannot reach the external image host; local failure fallbacks implemented |
| GitHub Actions / real Pages deployment | **NOT RUN** | No public deployment or remote repository changes were authorised as part of ZIP packaging |

## Automated coverage boundaries

The tests establish source and compilation integrity, **not absence of runtime defects**. The included browser smoke test is a reproducible acceptance procedure, not a passed test in this environment.

## Manual acceptance still required

Run `tests/browser_smoke.py` in a browser-capable environment; inspect desktop, tablet, narrow mobile and reduced-motion screenshots; complete keyboard and screen-reader evaluation; check actual WebGL2 shader creation and fallback; verify speech and audio; check real photo transfer; check the deployed GitHub Pages URL and GitHub Actions logs.

## Release blockers

- No known TypeScript compilation failures or static test failures remain.
- Runtime/browser validation is unresolved because the container blocks Chromium navigation.
- Teacher-specific rubric confirmation remains unresolved because the official marking rubric was omitted from the provided task.

These points should be surfaced during owner acceptance rather than silently marked as passed.


## Post-push audit — 24 November 2026

The first connected GitHub Actions run (`45332733036`, commit `ea79326`) independently passed dependency installation, strict TypeScript, content validation, all six then-current source tests, and the production build. Deployment failed at `actions/configure-pages@v5` because GitHub Pages was not yet enabled for this new repository; `upload-pages-artifact` and the deployment job were skipped.

The public URL was checked, but no published site could be loaded before Pages activation. GitHub does not expose the Pages administration setting through the connected app. The repository owner must select **Settings → Pages → Build and deployment → Source → GitHub Actions** once. The existing workflow is otherwise in place.

Local Chromium blocked all direct HTTP/file navigation with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. To test the actual compiled DOM and interactions despite that restriction, an in-memory Playwright harness loaded the production HTML, compiled JavaScript, and CSS in `about:blank` with the CSP meta directive removed solely for this restricted test harness. At 1440×900, 768×1024, 390×844, 320×680, and reduced-motion 390×844, it exercised chart switching, scenario feedback, network-choice explanations and fallback, support navigation, transcript controls, local wall sanitisation/deletion, mobile menu, and layout overflow. All five passed with zero uncaught page errors and zero horizontal overflow. This is not equivalent to a live-host test, and in that sandbox WebGL was unavailable; shader compilation, real photography transfers, audio output, and hosted CSP remain unverified.

Manual screenshot review exposed a hero-art composition issue: the original cropped montage removed the actual message tile. A new portrait version of the same metaphor replaced the image and is now displayed in the focal area. The source test suite includes a dedicated hero-dimension regression check.
