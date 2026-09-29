# CYBER RUN — Product Requirements Document

Version: 1.0  
Status: Proposed MVP specification  
Product: Playable browser game launched from CYBER OF X  
Working title: CYBER RUN

## 1. Product summary

Build an original three-lane endless runner inside the CYBER OF X website. Selecting **GAMES** in the existing navigation opens the game screen. The player starts a run, automatically moves forward, dodges obstacles, jumps over barriers, slides under overhead hazards, and collects energy shards. Keyboard controls support both arrow keys and WASD.

The gameplay takes inspiration from the lane-switching endless-runner genre associated with Subway Surfers. Use original cyberpunk characters, environments, audio, interface, and branding. The setting should connect visually to the existing CYBER OF X design: dark industrial architecture, violet ambient light, and magenta accents.

This document specifies the proposed MVP. Numerical tuning values are starting targets to validate through playtesting, not measurements from another game.

## 2. Confirmed requirements and assumptions

### User requirements

- Clicking Games opens a playable endless runner.
- Gameplay resembles a Subway Surfers-style runner.
- Both arrow keys and WASD control the character.
- The game belongs within the current CYBER OF X website.

### MVP assumptions

- Games launches the runner directly rather than opening a game catalog.
- Gameplay is single-player, desktop-first, and runs in the browser.
- Use the `/game` route in the same tab, with a visible return-to-home action.
- No account, installation, or payment is required.
- A run ends after one damaging collision.
- Personal best and settings persist locally when browser storage is available.
- Touch controls, accounts, online leaderboards, and monetization are outside the first release.

## 3. Goals and success criteria

1. A visitor can reach a playable game through one navigation click and one Start action.
2. Movement feels responsive and works equally with arrow keys and WASD.
3. Players can understand why they collided and immediately retry.
4. Obstacle patterns remain avoidable as difficulty increases.
5. The game looks like part of CYBER OF X rather than a disconnected embed.

The MVP is successful when every core acceptance scenario in Section 14 passes. Engagement targets should be set after initial testing rather than invented before baseline data exists.

## 4. User journey

| Step | Player action | Product response |
| --- | --- | --- |
| Discover | Click GAMES in the site header | Navigate to `/game`; mark Games active |
| Load | Wait for required assets | Show loading status and a recoverable error if loading fails |
| Learn | View ready screen | Show title, controls, objective, Start, audio setting, and Back to Home |
| Start | Click Start or press Enter while the game has focus | Focus the game surface and show a 3–2–1 countdown |
| Play | Use arrows or WASD | Run forward automatically; dodge, jump, slide, and collect |
| Pause | Press Escape or use Pause | Freeze the simulation and show Resume, Restart, and Home |
| Lose | Hit a damaging obstacle | Stop the run and show results |
| Retry | Click Play Again or press Enter on results | Reset the run and start a new countdown without reloading the page |
| Leave | Select Home | Stop the game loop/audio and return to the landing page |

Do not auto-start movement on route entry. Users need time to read the controls and focus the game.

## 5. Core gameplay

### Track and camera

- Three fixed lanes: left, center, and right.
- Third-person chase camera behind an original runner or android.
- The player starts in the center lane.
- Forward movement is automatic; backward movement is not supported.
- Recycle track segments to create a continuous route without unbounded memory growth.
- Maintain enough forward visibility to read hazards before reaching them.

### Keyboard controls

| Action | Arrow keys | WASD / alternative | Behavior |
| --- | --- | --- | --- |
| Move left | Left arrow | A | Move exactly one lane left per fresh key press |
| Move right | Right arrow | D | Move exactly one lane right per fresh key press |
| Jump | Up arrow | W | Jump when grounded and not sliding |
| Slide | Down arrow | S | Slide when grounded and not jumping |
| Pause / resume | — | Escape | Pause a run or resume a manually paused run |
| Start / retry | — | Enter | Start from ready or retry from results |

Input rules:

- Holding a movement key must not repeatedly traverse lanes through operating-system key repeat.
- Support uppercase and lowercase WASD; prefer physical key codes for consistent game bindings.
- Clamp lane targets to the leftmost and rightmost lanes.
- Allow lane switching while jumping or sliding.
- Ignore jump during a jump or slide; ignore slide during a jump or existing slide. No double jump or action stacking.
- If opposite horizontal inputs arrive in the same simulation step, cancel that step's horizontal request. If jump and slide arrive together while grounded, jump takes precedence.
- A second distinct lane input during a transition updates the target lane by one step, within bounds; interpolate smoothly from the current position.
- Do not map S or Down to backward motion: both mean slide.
- Prevent arrow-key page scrolling only while the focused game handles those keys. Do not capture input in text fields or unrelated page controls.
- Clear pressed-key state on pause, blur, and route exit to prevent stuck movement.

### Movement tuning

| Parameter | Initial target |
| --- | --- |
| Lane transition | 120–180ms, visually smooth |
| Jump duration | Approximately 750ms total |
| Slide duration | Approximately 650ms |
| Starting forward speed | 10 world units/second |
| Speed progression | Add 0.5 units/second per 15 active seconds |
| Maximum speed | 20 world units/second |
| Initial safe period | First 5 active seconds contain no damaging obstacles |

Use time-based movement, not distance per rendered frame. Pause must stop the gameplay clock and difficulty progression.

### Obstacles and pickups

| Type | Visual language | Required response |
| --- | --- | --- |
| Solid blocker | Opaque industrial crate or stationary vehicle | Change lanes |
| Low barrier | Low glowing barricade with a clear top edge | Jump over or change lanes |
| Overhead gate | Raised beam with a visible opening below | Slide under or change lanes |
| Energy shard | Small luminous collectible | Move through it to collect |

All damaging collisions end the run. Exclude pits, moving hazards, combat, power-ups, and revive mechanics from the MVP. Pickups should illustrate safe routes without leading players into unavoidable collisions.

Collision behavior must match the obstacle type. A low barrier is cleared only when the runner's collision volume is sufficiently above it; an overhead gate is cleared only while the reduced slide volume fits below it. Use slightly forgiving collision volumes within visible geometry. Avoid tunneling at high speed through swept collision checks or a sufficiently small fixed simulation step.

## 6. Fair procedural generation

- Generate from authored, validated obstacle patterns rather than unconstrained random placement.
- At every pattern boundary, at least one reachable continuation must exist from the allowed entry states.
- Never spawn a wall of three unavoidable solid blockers.
- Check lane travel time and jump/slide state across successive rows; an empty lane alone does not prove a pattern is reachable.
- Keep newly actionable hazards visible with at least 1.2 seconds of lead time at the current speed. Increase world-space spacing as speed rises when needed.
- Leave time to recover between incompatible actions, such as slide immediately followed by jump.
- Introduce single hazards first, then combinations after the opening safe period.
- Cap difficulty and speed so the game remains playable indefinitely in principle.
- Support deterministic generation seeds in development to reproduce unfair patterns and collision issues.

## 7. Score and persistence

| Metric | Definition |
| --- | --- |
| Distance | Forward distance traveled during active gameplay, displayed in meters |
| Shards | Number of energy shards collected during the current run |
| Score | `floor(distanceInMeters) + (shardsCollected × 10)` |
| Best score | Highest completed-run score stored on the current browser |

Use one world unit as one displayed meter for the initial implementation. Score and distance stop during pause, countdown, and game over. Persist a new best at game over. Store the best score, mute preference, and schema version in browser storage. Validate stored values and recover safely from missing or malformed data. If storage is blocked, keep the game playable with session-only values.

Personal best is local and can be edited or cleared by the user; it is not a verified competitive leaderboard.

## 8. Screens and interface

### Ready and loading

Use a dark 16:9 game viewport on desktop, original CYBER RUN title, concise objective, and a compact control legend. Show a clear loading indicator until required assets are ready. Enable Start only when playable. A loading failure provides Retry and Back to Home.

### Gameplay HUD

- Top left: score and distance.
- Top center: shard count, if it does not obstruct the route.
- Top right: pause and audio controls.
- Brief controls hint during the safe opening period; then fade it out.
- Keep hazards, lanes, and the player unobstructed.

### Pause overlay

Show PAUSED with Resume, Restart, and Back to Home. Restart discards the active run and creates a fresh one. Resume uses a short countdown so the player can regain their position.

### Results overlay

Show RUN COMPLETE, score, distance, collected shards, personal best, and NEW BEST when applicable. Offer Play Again and Back to Home. A clear crash animation or brief hit feedback explains the loss without delaying retry excessively.

### Visual integration

Follow `design.md` for the surrounding site style: near-black surfaces, violet environment light, magenta primary accents, angular borders, and technical headings. Preserve the existing landing page layout when adding the Games destination.

Use a separate active-play composition. The giant METAVERSE headline and landing-page statistics must not cover the track. Use bright, distinct obstacle silhouettes; decorative neon should not obscure them. The earlier removal of the landing-page hero character does not prohibit an original playable runner inside the game.

## 9. Game states and lifecycle

| State | Valid next states | Responsibilities |
| --- | --- | --- |
| Loading | Ready, Error | Fetch required assets; report progress where meaningful |
| Error | Loading, route exit | Offer retry and exit; no active simulation |
| Ready | Countdown, route exit | Show instructions and start controls |
| Countdown | Running, Paused, route exit | Prepare a start/resume; ignore movement until active |
| Running | Paused, GameOver, route exit | Process input, movement, spawning, collision, and scoring |
| Paused | Countdown, route exit | Freeze simulation; resume or reset for a new run |
| GameOver | Countdown, route exit | Finalize score once; show results; allow retry |

Tab hiding or window focus loss automatically pauses a countdown or run. Returning to the tab must not resume automatically. Route exit disposes listeners, render loops, timers, and audio resources. Restart resets obstacles, pickups, input, score, speed, elapsed time, and player animation state without duplicating listeners.

## 10. Technical requirements

- Implement as an integrated browser game with client-side simulation; no game server is required for MVP.
- Recommended rendering approach: lightweight WebGL 3D or 2.5D with a chase camera. Fit the implementation to the existing site's framework rather than replacing the site stack.
- Separate input handling, simulation, rendering, procedural generation, collision, audio, and local persistence.
- Use a fixed simulation timestep or equivalent deterministic time-based update strategy, independent of rendering frequency.
- Pool/recycle scenery, obstacle, and pickup objects. Remove offscreen objects and cap active counts.
- Start audio only after user interaction; mute must silence all game sounds.
- Direct navigation and refresh at `/game` must work, not only client-side clicks.
- Handle renderer/context failure with a recoverable message and retry; do not leave a frozen blank screen.
- Keep the game viewport responsive without stretching the image. Resize must preserve run state and valid lane/collision coordinates.

## 11. Performance and accessibility targets

- Target smooth 60fps on a declared representative desktop test device; reduce particles, shadows, and background detail before sacrificing input responsiveness.
- Target visible input response within 100ms, excluding the full lane-transition duration.
- Target a playable ready screen within 5 seconds on the agreed test connection; establish asset and device budgets during implementation.
- Run a 10-minute session and repeated restarts to confirm object counts and memory do not grow without bounds.
- Verify current stable desktop Chrome, Edge, Firefox, and Safari during implementation. These are test targets, not a compatibility claim.
- Keep menus operable by keyboard with visible focus, semantic buttons, and useful accessible names.
- Do not trap Tab navigation; pause when interaction leaves active play as appropriate.
- Use shape and height as well as color to differentiate hazards.
- Provide mute and reduced decorative motion. Disable camera shake and unnecessary flashing under reduced-motion settings.
- Narrow or touch-only screens may show a clear keyboard-required notice for MVP. Do not display unusable touch controls or claim mobile play support before implementing it.

The MVP's real-time visual gameplay is not a fully nonvisual experience; menu accessibility alone must not be described as complete gameplay accessibility.

## 12. MVP scope and deferred features

| Included | Deferred |
| --- | --- |
| Direct Games navigation and `/game` route | Game catalog and multiple titles |
| Three lanes; run, jump, slide | Combat and complex movement abilities |
| Arrow and WASD bindings | Touch swipes, gamepad, control rebinding |
| Three obstacle types and shards | Power-ups, missions, revives, shops |
| Fair pattern spawning and gradual difficulty | Multiple biomes and moving hazards |
| Score, pause, results, restart, local best | Accounts, cloud saves, online leaderboards |
| Original environment, runner, and basic audio | Licensed franchise characters or assets |
| Desktop responsive viewport | Native apps and full mobile support |

## 13. Implementation sequence

1. **Playable shell:** connect Games to `/game`; build loading, ready, focus, and route cleanup.
2. **Movement prototype:** implement three lanes, chase camera, both key sets, jump, slide, and pause.
3. **Game loop:** add validated patterns, pickups, collisions, speed progression, score, and game over.
4. **Complete session:** add restart, personal best, audio preference, loading recovery, and background-tab pause.
5. **Visual integration:** apply the existing design language and original assets while preserving hazard readability.
6. **Release checks:** exercise acceptance scenarios, cross-browser input, performance, and long-session stability.

Prioritize correct input and fair collisions before decorative polish.

## 14. Acceptance scenarios

| ID | Scenario | Pass condition |
| --- | --- | --- |
| AC-01 | Click Games from the landing page | `/game` opens in the same tab with instructions and a working Start action |
| AC-02 | Load `/game` directly and refresh | Game loads successfully with no dependency on prior home navigation |
| AC-03 | Start a run | Countdown completes; runner begins forward movement in the center lane |
| AC-04 | Test each arrow and WASD binding | Both control schemes produce the same respective actions |
| AC-05 | Hold Left/A, then press again | Holding does not auto-repeat; each fresh press moves at most one target lane |
| AC-06 | Move beyond outer lanes | Player stays within the three-lane track |
| AC-07 | Jump a low barrier and slide under a gate | Correctly timed action avoids collision; incorrect timing causes game over |
| AC-08 | Hit a solid blocker while jumping or sliding | Collision still ends the run; these actions do not bypass solid blockers |
| AC-09 | Collect a shard | Shard disappears once, count increments once, and score gains 10 points |
| AC-10 | Pause for several seconds | Player, obstacles, distance, score, and difficulty remain unchanged |
| AC-11 | Hide the tab or blur the window | Game pauses and requires an explicit resume after returning |
| AC-12 | Reach game over | Score finalizes once; results and retry controls appear |
| AC-13 | Retry repeatedly | Clean runs start without page reload, retained hazards, stale keys, or extra game loops |
| AC-14 | Beat best score and refresh | Local best persists when storage is available; blocked storage does not crash play |
| AC-15 | Play at maximum speed | Validated obstacle patterns still provide reachable safe actions and lead time |
| AC-16 | Use arrow keys outside the focused game | Normal page/control keyboard behavior remains available |
| AC-17 | Resize, navigate Home, then reopen Games | No stretched viewport, leaked audio, duplicate input, or background simulation |
| AC-18 | Simulate an asset-load or renderer failure | Useful recovery UI appears with retry and home options |
| AC-19 | Run for 10 minutes and restart 20 times | Active object/listener counts remain bounded; performance does not progressively degrade |

## 15. Optional product measurement

If analytics is already approved for the site, record Games clicks, ready-screen views, run starts, run ends with score/distance/duration, and retries. Use these to calculate launch-to-start conversion, median active run duration, and retry rate. Do not introduce account tracking or a new analytics service solely for this MVP.

## 16. Remaining implementation choices

The confirmed behavior above is sufficient to begin implementation. Select the rendering library based on the existing site stack, finalize original art and audio assets, and tune speed/collision settings through playtesting. The working name CYBER RUN and all numeric tuning values can change without changing the required Games launch flow or keyboard controls.
