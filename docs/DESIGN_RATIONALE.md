# Design rationale — anti-performative audit

## Main thesis

A message can travel through a connected group. A visitor can understand and influence **their own next action**, not control everybody else's behaviour. The site's interactions connect the two ideas.

## Key media choices

| Element | Learning value | Accessibility and cost control |
|---|---|---|
| Single paused message hero illustration | Creates the literal moment-before-sharing premise | Static WebP with description; no mandatory 3D |
| Three-facet bullying explanation | Makes power, repetition and harm recognisable | Text remains primary; symbols are decorative |
| Three fictional situations | Tests distinctions between conflict and patterns | Native buttons and written feedback; no scoring or diagnosis |
| eSafety chart | Explains empirical Australian prevalence and timeframe | SVG + accessible table; no invented interpolation |
| Live 3D Impact Network | Makes amplification and alternative pathways spatially understandable | Tiny deterministic graph, action-linked changes and SVG fallback |
| Qualitative response explanations | Prevents misinterpretation of the network as a prediction | Always present in DOM; announced on selection |
| Real photography | Restores ordinary school-age human context between abstract diagrams | Credited, illustrative only, lazy loaded, local fallback |
| Self-drawing support pathway | Demonstrates possible support routes and the idea of forward progress | Caption emphasises non-mandatory order; static in reduced motion |
| Private reflection wall | Helps transfer knowledge to a small future action | Optional, local only, no names/identification, text-only rendering |
| Narration and audio | Provides aural mode and accessible alternate way of receiving information | User-initiated, transcripts, can be turned off |
| Final support bridge artwork | Reinforces action and support without triumphalism | Static image and simple copy |

## Visual system

Near-black ink with a warm amber signalling decision and sage signalling supportive action. Colour has semantic associations but is always accompanied by text, shape or labels. Wide spacing and serif emphasis build editorial craft without making facts hard to scan.

## Real-world responsible-design constraints

The UI does not depict actual incidents, imply that photographed individuals are involved in bullying, score victims or bystanders, or invent outcome success rates. The WebGL graph is a small deterministic spatial metaphor **with explicit educational state transitions**. It is not a 4D physics simulation in the scientific sense.

## Architecture decision

Due to the build environment lacking npm network access and a guarantee of the legacy renderer's integrated behaviour, V2 deliberately uses standards-based TypeScript, WebGL2, SVG, Web Audio and Web Speech with no runtime third-party dependencies. This sacrifices framework reuse and premium postprocessing to achieve a coherent, testable educational system. There are no duplicate animation libraries or asynchronous external script requirements.
