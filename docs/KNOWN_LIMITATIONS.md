# Known limitations and production honesty

1. **Teacher rubric not supplied.** The recovered task requirements are implemented, but teacher-specific marking bands, word counts and submission conditions cannot be verified.
2. **No live GitHub Pages deployment performed.** This package is delivered as a release candidate and does not replace the existing public site. Push/merge only after owner approval.
3. **Remote photo transfer cannot be checked in the current offline build environment.** The app uses three credited Unsplash photos and shows local WebP fallbacks if their transfer fails. Recheck URLs and the Unsplash License before public launch.
4. **Generated images are editorial metaphors.** Their authorship is documented, and they are not documentary proof of any event.
5. **WebGL2 support varies.** The SVG fallback and text lessons remain available when a graphics context cannot be created. Integrated GPU performance needs real-device measurement.
6. **Web Speech voices and audio-device output vary by browser and platform.** Narration is user-triggered and transcripts remain available. Do not promise consistent pronunciation/voice quality.
7. **No public wall.** Reflections are local only. Browser storage may be read by another user of the same device, may be disabled, and can be cleared by the browser. Input screening does not guarantee that no identifying details are entered.
8. **Meta CSP limitations.** GitHub Pages ignores `_headers`. Meta-delivered CSP cannot enforce all response-only directives, especially `frame-ancestors`.
9. **Accessibility audit scope.** Automated browser and keyboard tests do not establish complete WCAG compliance. Manual screen-reader and assistive-technology evaluation is required.
10. **Simulated network is not a scientific forecast.** It only illustrates directional choices within fictional pathways; no probabilities or outcomes are inferred.
11. **The site's V2 source replaces rather than patches the earlier framework architecture.** It preserves purpose and documented content but does not include the entire legacy Three.js/GSAP code. This is described explicitly in README.
