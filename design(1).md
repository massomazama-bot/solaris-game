# Game View Design — Railway Runner

## Instructions for Antigravity

Implement the playable `/game` view using this file as its visual specification and `game-prd.md` as its behavioral specification. Inspect the existing project before changing code and retain its framework, routing, and working gameplay systems. This is a new game-view design document; it does not replace the CYBER OF X landing-page specification.

**Required outcome:** a colorful, polished, third-person 3D railway endless runner closely matching the supplied screenshots in track construction, camera perspective, gold coins, cartoon character proportions, color contrast, and lighting. It must remain fully playable using arrow keys and WASD. A screenshot background with a sprite moving over it is not a complete implementation.

### Requirement precedence

1. This document overrides the earlier PRD's dark cyberpunk game environment, android styling, energy shards, and gameplay HUD placement.
2. Replace shards with gold coins everywhere in the game UI and pickup presentation. Preserve pickup value: each coin adds 10 points.
3. Keep the existing Games → `/game` entry flow, automatic running, three lanes, collision rules, increasing difficulty, pause, restart, and local best score.
4. Keep the landing page unchanged. Its dark magenta design does not carry into the active game scene.
5. Reference fidelity governs visual decisions; approximate tuning numbers here are starting points, not extracted source values.

## 1. Reference interpretation

Use the three supplied images as visual inputs, not as complete game assets. The second and third show effectively the same city composition; treat them as one primary look, not separate environments.

| Reference | Filename | What to match |
| --- | --- | --- |
| A: bridge railway | `74b38bc6-0c78-4843-8f14-3594a72b724a.png` | Three tracks, six rails, repeated wooden sleepers, warm textured ground, overhead wires and gantries, yellow parapets, depth haze |
| B: colorful city runner | `70bf6007-5343-4e5b-896e-98e4338bc9d9.png` | Main scene direction: orange/red buildings, pink sky, teal rails, green tram, gold coin trail, rear-view cartoon runner, compact HUD |
| C: city duplicate | `2a2a1998-2b03-4241-bbd9-26d2fc89332d.png` | Reinforces the same character scale, camera, coin scale, and urban color palette |

Build the city corridor as the primary environment. The bridge image is a secondary reference for track detail and infrastructure; a full second biome is not required. Do not blend the blue bridge sky and pink city sky into an inconsistent primary scene.

Exclude screenshot viewer furniture: search bar, white page margin, browser back control, expand button, image-edit icon, and rounded clipping from the surrounding app. Do not reproduce the screenshots' literal score values, event counts, masks, eggs, multipliers, or social-avatar card as fake functionality.

The references are raster images, not source models, textures, fonts, or lighting files. Exact pixel equivalence cannot be guaranteed from them alone. Match visible characteristics closely and compare rendered screenshots; do not call a loosely similar gray-box scene finished.

## 2. Art direction

The world is cheerful, saturated, sunny, and toy-like. Use stylized 3D assets with softened edges, clear silhouettes, painted textures, and readable material separation. Foreground ground detail is warm and crisp; distant architecture fades toward a light peach haze.

Visual priority:

1. Three unmistakable railway lanes converging into depth.
2. Large luminous gold coins forming a readable route.
3. A small expressive runner near the lower center.
4. Colorful urban buildings framing both sides.
5. Green trams and clear barriers as gameplay hazards.
6. Overhead cables, awnings, windows, and restrained street decoration.

Avoid dark neon scenery, purple fog, sci-fi armor, photorealistic grime, flat untextured ground, thin glowing lines substituted for rails, and excessive post-processing blur. Maintain the reference's warm light versus cool rail/building accents.

## 3. Camera and framing

Use a perspective chase camera looking forward and slightly down. The camera follows forward motion, but remains centered on the track during lane changes so the three-lane layout stays stable. Small smoothed lateral follow is optional only if it improves the reference match.

| Property | Starting target |
| --- | --- |
| Vertical field of view | 50–60 degrees |
| Camera height | Approximately 4–5 world units |
| Camera distance behind player | Approximately 6–8 world units |
| Vanishing region | Horizontal center; roughly 30–40% of viewport height from the top |
| Player projected height | Approximately 16–20% of viewport height |
| Player ground contact | Roughly 80–87% of viewport height from the top |
| Horizon content | Tram, receding gantries, pastel haze, and distant architecture |

Tune camera position, target, and FOV together to satisfy the projected framing. The world-unit values are not independent mandates. Keep the whole character visible during jumps; do not swing the camera upward to follow every jump.

### Portrait references and desktop layout

The references are portrait. The desktop game remains 16:9 per the prior specification. Preserve the runner's relative height and the vertical perspective; reveal more streetscape on the sides rather than stretching the portrait image or enlarging the runner to fill the frame. In landscape, keep the actionable track corridor concentrated in the central approximately 55–65% of the screen and use buildings to frame it.

Support a portrait camera layout for narrow viewports, but retain the keyboard-required notice on touch-only devices until touch play is implemented. A portrait layout alone is not touch support.

## 4. Railway construction

**Three lanes means three complete tracks: six rails total.** Each track consists of two raised metal rails mounted on repeated wooden sleepers over warm stone/ballast. Lane centers align with track centers, not individual rails.

Suggested scale:

- Lane centers at x = -2.6, 0, +2.6 world units.
- Rail offsets approximately ±0.65 from each lane center.
- Sleeper width approximately 1.8 units; spacing approximately 0.65 units.
- Rails are raised slightly above the ground with visible top faces and darker sides.
- Add small attachment plates or simplified fasteners near the foreground where affordable.

Use silver-blue/teal highlights on city rail tops, dark brown/blue-gray sides, amber-brown sleepers, and ochre cobblestone ground. The bridge reference uses darker rails; prioritize the city's brighter rail tops for the main scene.

Ground texture must have visible stone shapes, softened seams, and irregular color patches. Use repeatable textures with variation to avoid obvious segment seams. Sleepers repeat at consistent world-space intervals and compress naturally with perspective. No painted single-plane track substitute for the final view.

### Depth and infrastructure

- Repeated teal/dark-blue gantries span above the entire track corridor.
- Thin overhead wires follow the route toward the vanishing point; use actual curves or segmented lines with modest sag.
- Place infrastructure behind the nearest playable hazards; gantries should not be mistaken for slide obstacles.
- Track segments join seamlessly and recycle out of view.
- A gentle distant bend is desirable. Start with straight collision geometry if necessary, then bend the whole world consistently. Never curve only the rail mesh while leaving coins, trains, lane targets, and collisions on another path.

## 5. City environment

Build tall, tightly arranged stylized facades on both sides: coral, orange, red, yellow, teal, and blue. Use large window shapes, shallow balconies, roof edges, striped shop awnings, sidewalks, and occasional cafe furniture. Add a few festive pennants or hanging decorations high above the route where they do not obscure hazards.

Buildings should overlap in depth rather than form a single flat wall. Vary height and facade color while sharing a consistent cartoon scale. Sidewalks and raised curbs define the track corridor. Tables, chairs, and plants stay outside the playable lanes.

For a future bridge segment, reuse the track system with golden parapets, square flower planters, red/cream flowers, blue distance silhouettes, and a light blue sky. Do not make this extra biome a blocker for the city MVP.

## 6. Color and lighting

Estimated art-direction swatches, not exact pixel samples:

| Role | Suggested color | Application |
| --- | --- | --- |
| Sky upper | `#F28DBA` | Pink city sky |
| Horizon | `#FFD7A0` | Warm atmospheric depth |
| Ground base | `#C58236` | Track bed and stone |
| Ground shadow | `#8B5027` | Seams and under-object contact |
| Rail top | `#82C9D4` | Cool metallic separation |
| Rail side | `#355A65` | Depth on rails |
| Sleeper wood | `#8F5D2D` | Repeated ties |
| Building orange | `#F79025` | Main facade family |
| Building coral | `#E84936` | Warm contrast |
| Building teal | `#168DAB` | Cool facade accents |
| Tram green | `#79B34C` | Vehicle body |
| Coin face | `#FFD82E` | Bright collectible face |
| Coin rim | `#F49B08` | Bevel and embossed detail |
| Coin highlight | `#FFF79A` | Specular edge and subtle glow |
| HUD blue | `#078FBD` | Pause/menu buttons |

Use a warm directional key light from above/front-left, broad sky fill, and soft contact shadows. Warm surfaces remain saturated; shaded surfaces retain color and detail. Avoid crushed blacks and uniformly flat ambient-only lighting.

Use restrained bloom on coins and collectible sparkles only. Do not blow out the entire street or create giant yellow disks that hide obstacles. Apply a consistent color-management and tone-mapping pipeline; verify final colors in the rendered scene rather than compensating with arbitrary material brightness.

Distance fog should lighten distant buildings toward peach/pink, making near rails and the runner stand out. Keep fog beyond the required hazard-reading range. Foreground coins should be the brightest small objects, while the horizon remains broad and softly lit.

## 7. Gold coins

Coins are thick gold disks, not spheres, flat yellow circles, crystals, or energy shards. Model a beveled rim, recessed face, and embossed star-like emblem. The face must be readable from the chase camera. Rotate coins slowly around the vertical axis and add a small vertical bob without moving their gameplay pickup locations.

- Diameter: about 0.55–0.7 of runner height.
- Thickness: approximately 10–15% of diameter.
- Place normal coin centers around the runner's torso height.
- Arrange longitudinal trails along lane centers with even world-space spacing, initially around 2.5–3 units.
- Use optional jump arcs only when every coin's position agrees with the playable jump trajectory.
- Show several upcoming coins receding into depth, as in the city reference.
- On pickup: remove the coin once, emit a short gold sparkle burst, play a brief chime if unmuted, and increment the real HUD count.
- Pool coin meshes/effects and instance shared geometry where practical.

Retain the PRD scoring formula with renamed semantics: `score = floor(distanceInMeters) + coinsCollected * 10`. Do not introduce a multiplier merely because one appears in the source screenshot.

## 8. Playable character

Use a fully modeled, animated cartoon street runner seen primarily from behind. Match the reference's readable silhouette: large cream/light hood or cap, compact torso, blue/teal upper clothing or small backpack, denim-blue legs, and oversized light-soled sneakers. Use a distinct simple patch on the back rather than illegible copied lettering.

### Proportions and materials

- Approximately 3.5–4 heads tall with a slightly oversized head and shoes.
- Rounded hands and limbs, softened clothing folds, compact backpack.
- Warm cream hood, saturated teal/blue garment, medium-blue trousers, light shoes with colored trim.
- Matte painted fabric and rubber surfaces; no chrome skin or robotic armor.
- Maintain a clear outline against the warm ground, using cool clothing colors and contact shadow.
- The runner is approximately 16–20% of viewport height, not an enormous avatar covering upcoming obstacles.

A capsule or primitive mannequin may be used for the first movement check only. The accepted final scene requires a recognizable character mesh, articulated limbs, and the full animation set.

### Required animations

| State | Visual behavior |
| --- | --- |
| Ready | Subtle idle breath and weight shift |
| Running | Alternating arm swing and leg stride, modest torso lean and vertical bounce |
| Lane change | Brief lean toward the target lane, blended into running |
| Jump | Push-off, tucked or bent legs during flight, clear landing recovery |
| Slide | Deep lowered posture with body visibly beneath an overhead bar |
| Collision | Short stumble or impact response followed by results |
| Pause | Animation and world freeze together |

Keep the rig animation visually in place if simulation owns forward displacement. Do not apply root motion and simulation movement twice. Animation duration must fit the actual jump/slide window; collision volumes change with gameplay state, not arbitrary animation frames. Soft oval contact shadow follows the runner; it stays on the ground during jumps and becomes slightly lighter/smaller with height.

## 9. Hazards and vehicles

| Gameplay type | Visual replacement | Rule retained |
| --- | --- | --- |
| Solid blocker | Rounded green tram/train with cream roof, large dark windows, headlights, and visible lower body | Change lanes; cannot jump or slide through it |
| Low barrier | Compact red/white striped railway barricade | Jump or switch lanes |
| Overhead gate | Clearly supported maintenance bar with an open gap below | Slide or switch lanes |

Use stationary trams as the MVP's vehicle blockers, consistent with the earlier exclusion of moving hazards. Do not add rooftop running, chasing police, train surfing, or moving-vehicle rules without defining those mechanics separately.

Full-height gantries are scenery; slide gates must have a visibly low horizontal bar. Train size must fill its lane convincingly without visually blocking neighboring safe lanes. Visible surfaces and collision geometry must agree. Keep coins off impassable obstacle interiors.

## 10. HUD and overlays

Use compact arcade UI over the game, inspired by the references: bold rounded white digits, slight dark shadow/outline, translucent dark blue backplates, and bright blue rounded-square pause controls. Avoid the angular magenta landing-page HUD for active play.

| Position | Component |
| --- | --- |
| Top left | Pause button with white pause bars |
| Top center/right | Real run score, optionally zero-padded to six digits |
| Under score | Coin count with a small gold coin icon |
| Small secondary label | Distance and local best, only where they remain unobtrusive |
| Ready/pause menu | Audio toggle, instructions, and Home action |

Use a heavy rounded sans serif for digits; an available rounded bold face is an acceptable substitute. Font identity cannot be recovered exactly from the screenshots. HUD elements remain DOM-based where practical for crisp text, focus states, and responsive sizing.

No event-mask progress, seasonal egg counter, multiplier, or social high-score avatar unless implemented as real features. Do not hardcode 099990, 297, 266, or any other reference number.

Ready: show the scene behind a clean panel with Play, controls, and Home. Pause: freeze the scene with a light darkening overlay and Resume/Restart/Home. Results: show score, distance, coins, personal best, Play Again, and Home. Use blue controls, white text, and gold highlights consistently.

## 11. Functionality that must remain intact

| Input | Action |
| --- | --- |
| Left arrow / A | Move one lane left |
| Right arrow / D | Move one lane right |
| Up arrow / W | Jump |
| Down arrow / S | Slide |
| Escape | Pause/resume according to current game state |
| Enter | Start from ready or retry from results |

- Automatic forward running; center-lane start; first 5 active seconds safe.
- Ignore operating-system key repeat for lane changes; clamp targets to three lanes.
- Allow lane changes during jumps/slides; no double jump or stacked slides.
- Keep approximately 120–180ms lane changes, 750ms jump, and 650ms slide as initial tuning.
- Retain 10 units/second starting speed, +0.5 per 15 active seconds, capped at 20, subject to playtesting.
- At least one reachable route through every obstacle sequence; retain at least 1.2 seconds of actionable hazard visibility.
- One damaging collision ends a run; pickup, score, and game-over events fire once.
- Pause on hidden tab/window blur; return requires explicit resume.
- Score, distance, difficulty, animations, and coins freeze while paused.
- Retry resets the run without reloading; best score persists locally when storage works.
- Prevent arrow scrolling only while game input is focused; release listeners and audio on exit.
- Games opens `/game`; direct route loads and refreshes work.

## 12. Engineering and asset guidance

Reuse existing gameplay code. Build environment, character, pickup, and HUD presentation around it. Use the current renderer if it can meet the visual target; otherwise choose a browser 3D renderer compatible with the existing project. Do not migrate frameworks solely for this visual update.

Separate visual meshes from collision volumes, with development-only collision debug views. Share track materials, instance repeated sleepers/coins, pool scenery, and recycle track chunks. Reduce distant ornament detail before reducing lane readability or character quality. Target 60fps on the agreed desktop device, with bounded object counts over long sessions.

Required final assets: runner mesh/rig/animations; rail and sleeper geometry; tiled warm ground material; modular facades; green tram; two barrier types; coin mesh and emblem; gantry/wires; contact shadows; coin/impact effects; basic run/pickup audio. Asset paths are to be chosen in the project; these assets are not bundled with this Markdown file.

If an asset is unavailable, use a clearly tracked temporary replacement during development and resolve it before claiming visual fidelity. Do not substitute a static screenshot for functioning geometry, and do not claim exact matching when source assets differ.

## 13. Implementation and verification order

1. Verify existing controls, scoring, pause, and restart before modifying visuals.
2. Match camera, runner screen size, track width, and vanishing point with a small test scene.
3. Build detailed rails/sleepers/ground and repeat them without seams.
4. Add the city facades, sky, haze, and lighting; compare with the city reference.
5. Add the final runner and animation states, gold coins, tram, and barriers.
6. Replace HUD presentation and shard labels while preserving score behavior.
7. Capture running, jump, slide, pause, and results screenshots at 1920×1080 and a portrait viewport.
8. Compare scene-only crops to the references; exclude screenshot viewer UI from comparisons.
9. Playtest both control sets, hazards, high-speed pattern fairness, route cleanup, and repeated restarts.

Use a deterministic development seed to reproduce the same coin trail, tram, and camera pose for visual comparison. Prioritize perspective and scale first, then color/light, then geometry detail. A working prototype is not visually complete merely because controls pass.

## 14. Completion checklist

- [ ] Three distinct railway tracks and all six rails are visible with repeated wooden sleepers.
- [ ] Foreground ground texture has warm stone detail; rails have raised cool-colored tops and darker sides.
- [ ] Camera gives the same strong forward depth and lower-center runner placement as the references.
- [ ] Gold beveled coins have readable faces, a restrained glow, and real collectible behavior.
- [ ] City architecture is saturated orange/red/yellow with teal accents and a pink-to-peach sky.
- [ ] Lighting is bright and warm with soft contact shadows and readable distant haze.
- [ ] The final animated cartoon runner has the specified silhouette and complete jump/slide/run states.
- [ ] Green trams and barriers align with lanes and actual collision volumes.
- [ ] HUD shows real score/coins, without invented event counters or multipliers.
- [ ] Both arrow keys and WASD, pause, retry, local best, and Games navigation still work.
- [ ] Desktop 16:9 widens the scene without stretching models or hiding the player during jumps.
- [ ] Gameplay remains fair at maximum speed and does not slow progressively over repeated runs.
- [ ] No screenshot search bar, image-edit controls, white viewer borders, or browser furniture appear in the game.
- [ ] Landing-page design remains unchanged; this bright treatment is scoped to the game view.

## Antigravity implementation brief

> Update the existing playable game using this design.md. Closely match the attached railway-runner references: three detailed tracks with six rails and wooden sleepers, warm textured ground, bright colorful city facades, pink sky, soft sunny lighting, green trams, large embossed gold coins, and an animated rear-view cartoon runner. Preserve all behavior in game-prd.md except the explicit visual changes and shards-to-coins rename defined here. Build actual playable 3D geometry, not a screenshot mockup. Keep arrow/WASD movement, jump, slide, scoring, fair spawning, pause, restart, local best, and Games → /game routing. Compare rendered screenshots before declaring completion and report any remaining visual or asset gaps accurately.
