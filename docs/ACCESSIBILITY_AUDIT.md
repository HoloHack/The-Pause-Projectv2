# Accessibility engineering audit

Target: WCAG 2.2 AA where applicable, pending manual verification.

## Included by design

- `lang="en-AU"`, viewport and descriptive page title.
- Skip link and semantic header/nav/main/section/footer landmarks.
- Correct top-level heading and numbered section structure.
- Keyboard-focus styling.
- Native buttons with `aria-pressed` on single-choice exercises.
- Status announcements for scenario, network and support explanations.
- Data table plus accessible SVG bar-chart text summary.
- WebGL canvas hidden from assistive technologies; alternative explanatory text and SVG.
- Meaningful image alternative text and visibly attributed photographs.
- User-controlled speech/audio with a chapter transcript.
- No autoplay.
- Reduced-motion CSS with static support diagram and no required animation.
- Small-screen responsive layout and linear reading order.

## Manual verification still required

- Contrast ratio measurement in actual rendered interface.
- Screen-reader output on VoiceOver and NVDA.
- Keyboard tab sequence through the full page.
- High zoom/reflow and enlarged font settings.
- Real touch device target-size and text overlap review.
- WebGL fallback on unsupported hardware and context loss.
- Speech availability and pronunciation on supported browsers.
- External photo failure states.

Source: https://www.w3.org/TR/WCAG22/
