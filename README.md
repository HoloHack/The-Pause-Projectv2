# THE PAUSE PROJECT — Integrated V2 Release Candidate

**One message. A network of consequences.** An evidence-led, five-chapter multimodal experience for Australian secondary students about bullying and cyberbullying: recognition, safer bystander choices and practical support.

## What is included

- Five original, responsive editorial chapters (Hold, Recognise, Intervene, Support, Next Move).
- Australian Bullying No Way definition and distinctions between conflict, bullying and serious one-off harm.
- eSafety 2024–25 survey figures: 53% lifetime and 38% past-year among 3,454 surveyed children aged 10–17; group data and interactive SVG chart with accessible data table.
- Fictional scenario exercise with feedback.
- Real-time **WebGL2/GLSL 3D teaching network** driven by selected bystander action, with a clear SVG fallback. Time is the fourth variable; it is not a four-spatial-dimensional simulation or a predictor of human behaviour.
- Self-drawing SVG support pathway and interactive step navigator.
- Opt-in Web Speech narration, a transcript for every chapter and optional quiet Web Audio interaction cues.
- Private local-only reflection/pledge wall, fictional examples, entry deletion and clearing; no accounts, external submission, telemetry or backend.
- Three original locally packaged editorial artworks (WebP), three real credited Unsplash photographs loaded remotely, with local artwork error fallbacks.
- Research source register, design rationale, accessibility review, task coverage matrix, QA and owner test instructions.

## Run locally

Requires **Node.js 20+** and TypeScript 5.8+ (`npm install` installs the project dev dependency if not already present).

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

Preview: `http://127.0.0.1:4173`.

`npm run dev` builds and serves the same static output for local preview. There is no hot reloading. Refresh after source edits and rerun build.

### Build process

The build intentionally uses **native browser APIs and zero production JavaScript dependencies**, so the TypeScript-compiled ES modules and HTML/CSS can run directly on GitHub Pages without a framework runtime or CDN scripts. `scripts/build.mjs` runs strict `tsc`, assembles `dist/` and copies all production assets. The GitHub workflow installs TypeScript, validates the source, type-checks, tests, builds and deploys `dist/`.

This is an intentional departure from the previous Three.js/GSAP/Lenis foundation. It avoids unverified integration and external dependency conflicts in this environment. The educational network is genuinely three-dimensional WebGL2 with purpose-written GLSL, deterministic data and time-based animation. Its presentation is driven by the lesson buttons, not decorative camera choreography.

### GitHub Pages deployment

This package is **not automatically published**. To replace the current site, first review the preview and confirm that replacing the previous release is approved.

1. Preserve the existing repository in Git or by creating a release tag.
2. Replace the repository root contents with **all** files from this ZIP, including hidden `.github/` files.
3. In GitHub repository settings → Pages, choose **GitHub Actions** as the build and deployment source.
4. Push to `main` only once the release is approved. `.github/workflows/deploy.yml` automatically runs validation and deploys `dist/`.
5. After Actions succeeds, test `https://holohack.github.io/the-pause-project/` on a desktop and a phone. Confirm that remote photography loads or falls back and that speech works on actual hardware.

The site uses relative asset paths (`./assets/app.js`, `./styles.css`, `./images/...`), so it works at a project-level GitHub Pages subpath.

## Security, privacy and classroom safety

- The CSP meta tag allows only same-origin scripts/styles/fonts and external **photographs** from `https://images.unsplash.com` in `img-src`.
- GitHub Pages ignores `public/_headers`; those headers are reference configuration for a compatible host. In particular, `frame-ancestors` cannot be enforced with meta CSP on GitHub Pages.
- Reflections use `textContent` rather than HTML and are intentionally private **only in the sense that they are not posted to a shared server**. They may be seen by another person using the same browser/profile, and local storage is not an encrypted vault. Use the clear button on shared devices.
- Input rejects obvious contact details/URLs but cannot reliably detect all identifying information. The interface asks visitors not to enter any.
- `localStorage` use is best-effort; unavailable storage falls back to temporary in-memory notes.
- No visitor accounts, public wall, external submission or tracking.
- Speech synthesis starts only after explicit user action; sound effects are off by default.
- The teaching network is explicitly an illustrative graph, not actual social data or a scientific model of outcomes.

## Accessibility and performance

- All substantive teaching content is semantic HTML.
- The chart has an accessible written summary and data table.
- The network has an SVG fallback and an up-to-date text explanation.
- Native buttons and anchors, keyboard focus, skip link, reduced-motion treatment, hidden/mobile navigation labels and a transcript provide alternatives.
- WebGL uses a single lightweight program, low geometry counts, bounded DPR, visibility pausing and context-loss handling.
- The graphics renderer is low-dependency but **not** a comprehensive screen-reader or WCAG certification. Manual accessibility evaluation remains necessary.

## Verification records

See `docs/QA_REPORT.md` and `docs/KNOWN_LIMITATIONS.md` for the results that were actually observed. A successful local build is not evidence that GitHub Pages, remote photographs, audio devices or all mobile browsers were exercised.

## Research & credits

`docs/SOURCE_REGISTER.md` links factual claims to their publishers and study populations.

`ASSET_CREDITS.md` identifies images, credits, licenses and how they serve the lessons. All photographs are illustrative, not depictions of real cyberbullying incidents.

## Owner acceptance quick test

1. Open all five chapters and test the mobile chapter menu.
2. Pick each recognition scenario and read the resulting explanation.
3. Switch the chart from Ever to Past 12 months and check the values.
4. Select every network response; check the visible graph and explanatory text.
5. Select every support navigator option; open the official resources.
6. Add a private note, reload, delete it, then test Clear all notes.
7. Toggle transcript, narration and audio; verify they remain optional.
8. Test keyboard navigation and reduced-motion mode.
9. Disable WebGL or run on a restricted device and confirm the fallback still teaches the lesson.
10. Confirm the photo fallbacks, credits and source links.

## School assignment status

The actual teacher's complete rubric and submission instructions were not present in the supplied brief. This release implements the recovered multimodality and cyberbullying topic requirements, but cannot legitimately claim compliance with unseen marking bands. The matrix in `docs/REQUIREMENTS_MATRIX.md` marks this limitation.


## GitHub Pages project path

`vite.config.ts` declares `base: "/The-Pause-Projectv2/"` for this repository. The lightweight TypeScript production build copies files with relative asset URLs (`./assets/`, `./images/`, `./styles.css`), which resolve inside the same Pages subdirectory. The build and source validation check the configured path, even though this project uses the custom `scripts/build.mjs` instead of the Vite CLI.
