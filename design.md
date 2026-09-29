# CYBER OF X — Design Specification

## Reference and scope

This specification describes the latest 16:9 CYBER OF X design in this conversation: the central character has been removed while the website layout, METAVERSE title, navigation, side rail, calls to action, and statistics panel remain.

The image is the visual reference. Dimensions, color values, and CSS values below are implementation estimates, not measurements from original source files. Exact font families cannot be identified reliably from the raster image. Suggested fonts are substitutes, not claims about the original. Responsive behavior and interaction states are proposed implementation guidance; the reference shows only a static desktop composition.

## Design intent

A cinematic cyberpunk gaming and metaverse landing page. Use a nearly black industrial environment, restrained violet illumination, bright magenta accents, and an oversized pale-pink headline. The hierarchy is: METAVERSE headline, two supporting content blocks, then the statistics strip. Fine technical borders and angular details give the interface its character.

Keep the center intentionally open. Do not reintroduce a hero character, illustration, floating object, or extra card into this area. Small community portraits in the bottom panel remain part of the design.

## Desktop composition

Use a 16:9 artboard for visual exports, such as 1920 × 1080. For a live page, let content determine height when the viewport differs from this ratio; do not squash typography to fit.

| Region | Approximate bounds on the artboard | Treatment |
| --- | --- | --- |
| Left rail | Left 5% of width; full height | Black surface, thin right divider, stacked icons |
| Header | Remaining width; top 10% of height | Wordmark, horizontal navigation, search, JOIN US |
| Hero eyebrow row | x: 8–97%; y: 16–18% | Widely tracked small uppercase labels |
| METAVERSE title | x: 8–96%; y: 21–45% | One line; dominant distressed display lettering |
| Supporting content | x: 9–26% and 74–91%; y: 50–71% | Two short text blocks with matching outlined CTAs |
| Open center | Between supporting content blocks | Visible dark architecture; no character |
| Statistics strip | x: 8–97%; y: 77–95% | One wide translucent panel with internal dividers |

Use a grid for the shell: a narrow rail plus the main region. Inside the main region, align the header, headline, supporting copy, and statistics strip to shared gutters. At 1920px width, begin with a rail near 96px and main gutters near 56px. Match the reference through visual comparison rather than treating these estimates as exact.

## Color system

| Token | Suggested value | Use |
| --- | --- | --- |
| `--canvas` | `#050507` | Page and rail base |
| `--surface` | `#0C0B12` | Header and dark panels |
| `--panel` | `rgba(16, 14, 24, 0.82)` | Statistics panel |
| `--accent` | `#FF145B` | CTAs, metrics, section headings, active accents |
| `--accent-dark` | `#821033` | Dim outlines and secondary neon details |
| `--headline` | `#E8B3DF` | METAVERSE lettering |
| `--violet` | `#6A327D` | Background illumination |
| `--text` | `#F0EDF3` | Navigation and prominent labels |
| `--text-muted` | `#AAA6B2` | Body copy and supporting labels |
| `--border` | `rgba(213, 203, 225, 0.18)` | Hairline dividers and panel outlines |

Black and dark purple should dominate the frame. Apply magenta selectively. Avoid broad bright gradients that compete with the headline, and avoid neon glow around paragraphs.

## Typography

Preserve the visual distinction between heavy distressed display lettering, wide technical headings, and neutral readable body text.

| Role | Visible character | Suggested implementation |
| --- | --- | --- |
| METAVERSE | Extremely heavy, condensed, uppercase, chipped and interrupted letterforms | Use original display artwork if available; otherwise an Anton-style condensed face with a custom distress mask |
| Wordmark and section headings | Wide, angular, geometric uppercase | Orbitron-style geometric display face; tune tracking to reference |
| Navigation and buttons | Compact, bold sans serif, uppercase | Rajdhani or a similar technical sans serif |
| Body copy | Neutral sans serif, small, gray | Inter or a similar neutral sans serif |
| Statistics | Bold technical numerals in magenta | Match the heading family where possible |
| Eyebrows and unit labels | Small uppercase with generous tracking | Neutral sans serif with `0.2–0.35em` tracking |

Suggested starting sizes at 1920px artboard width:

- Headline: approximately 280–330px, weight 900, line-height 0.85–0.95; tune width to keep the whole word on one line.
- Section headings: 32–38px, weight 600–700, tracking 0.12–0.18em.
- Navigation and body text: 14–16px; body line-height 1.5–1.65.
- Metrics: 44–50px, bold.
- Eyebrows and units: 10–12px, with generous tracking.

Do not claim an exact font match using substitutes. For faithful reproduction, obtain the original font or headline vector. Keep METAVERSE as accessible text even when a decorative artwork layer supplies the visual treatment. Avoid using a screenshot of the full page as the live interface.

## Background and layering

The environment is a dark futuristic architectural interior: faint structural grids, industrial surfaces, distant windows, and scattered violet light. It is atmospheric rather than sharply legible.

Layer from back to front:

1. Near-black base.
2. Character-free architectural background, centered and covering the hero.
3. Dark vignette and subtle violet atmospheric overlay.
4. Headline, content, navigation, and side rail.
5. Translucent statistics panel, borders, and restrained accent glows.

Keep the architecture subdued behind body copy. The background visible where the character was removed must blend naturally with adjacent regions. No residual silhouette, ears, hair, armor, or bright character-shaped glow should remain.

## Components

### Header

- Left: outlined magenta X emblem and white CYBER OF X wordmark.
- Center: HOME, ABOUT, GAMES, MARKETPLACE, COMMUNITY, SUPPORT.
- Active HOME link: subtle magenta underline and glow; small magenta separators between navigation items.
- Right: dark search control and solid magenta JOIN US button with a right arrow.
- Thin horizontal divider under the header; minimal rounding except on the primary CTA.

### Left rail

Place a four-square mark near the top, followed by the active section indicator, thin magenta line, vertical FOLLOW US label, and social icons. Anchor SCROLL DOWN and a small glowing magenta dot near the bottom. Use consistent stroke weights and generous vertical spacing. Give every functional icon an accessible label.

### Hero

Top-left eyebrow: ENTER THE NEXT DIMENSION. Top-right label: WHERE IMAGINATION MEETS REALITY, paired with the 01 /05 indicator and small bars.

METAVERSE spans almost the entire main width. Preserve its pale pink color, irregular chips, fine horizontal interruptions, and commanding scale. Distress should affect the display title, not body text or navigation.

### Supporting content

Left block: CYBER OF X heading, approximately three short lines of gray placeholder copy, and EXPLORE NOW. Include the two angled decorative strokes beside the button.

Right block: THE FUTURE heading, approximately three short lines of gray placeholder copy, and WATCH TRAILER with an outlined circular play icon.

Align headings and buttons across the two columns. Retain the large empty center between them. Placeholder copy in the image is visual filler; approved production copy is still required.

### Buttons

Secondary CTAs use transparent dark fills, thin magenta outlines, clipped corners, white uppercase labels, and a restrained bright edge accent. Primary JOIN US uses a solid magenta fill and near-black text. Keep button geometry consistent; do not convert all controls to pills.

Use a border or SVG frame around clipped controls so angled outlines remain crisp. Draw the focus outline on an unclipped wrapper to prevent it being cut off.

### Statistics strip

One continuous wide dark translucent panel, with angular cut corners and fine double-line details. Divide it into three principal content groups and a final circular arrow action:

| Group | Graphic | Text |
| --- | --- | --- |
| Active users | Magenta wireframe globe | ACTIVE USERS; +15; MILLION; short supporting copy |
| Games online | Text-led metric | GAMES ONLINE; +25; THOUSAND; short supporting copy |
| Community | Circular cluster of small portraits | GLOBAL COMMUNITY; short supporting copy |
| Final action | Segmented magenta circular outline | White right arrow |

Keep graphics, labels, and metrics aligned within each group. Use thin vertical separators instead of separate floating cards. Treat the numbers as reference mockup content, not verified business statistics.

## Spacing and geometry

Use an 8px spacing rhythm, with 4px adjustments for small details. Prefer 1px borders, angular clipped corners, short magenta edge segments, and restrained circular motifs. Reserve circles for the globe, portraits, play control, and final arrow.

Avoid excessive blur, soft pastel surfaces, large rounded cards, and additional decorative content. The design relies on scale and negative space more than the number of elements.

## Proposed responsive behavior

| Width | Layout behavior |
| --- | --- |
| 1200px and above | Preserve the desktop rail, full header, single-line headline, paired content blocks, and horizontal statistics strip |
| 768–1199px | Replace full navigation with a menu control; narrow or remove the rail; reduce title size; allow statistics to wrap into two columns |
| Below 768px | Use a compact header; remove the persistent rail; stack supporting blocks and statistics; retain headline as one line if legible; allow natural page height |

The 16:9 requirement applies to the reference image and desktop exports. Do not enforce a fixed 16:9 viewport on phones. Keep all content reachable without horizontal scrolling. Reposition the background without stretching it.

## Proposed interaction and accessibility

- Hover: slightly brighten magenta outlines and arrows over 150–200ms; avoid moving the entire layout.
- Focus: use a clearly visible outline, with a minimum 2px offset.
- Navigation: show active state by underline as well as color.
- Functional controls: use semantic links or buttons and aim for at least 44 × 44px hit areas.
- Body text: verify contrast against the actual composited background; strengthen the dark overlay where needed.
- Motion: optional slow glow only; respect reduced-motion preferences and avoid flashing glitch effects.
- Trailer: if implemented as a modal, provide keyboard dismissal and proper focus management.
- Decorative architecture, distress textures, and line ornaments: hide from assistive technology.

## Asset requirements

- Dark architectural background without the central character.
- CYBER OF X emblem and wordmark, ideally as vector assets.
- Licensed original fonts or explicitly accepted substitutes.
- Distressed headline artwork or a repeatable mask.
- Consistent social, search, play, menu, and arrow icons.
- Wireframe globe and community portrait cluster.

These are required implementation assets, not files bundled with this document. Use the latest generated character-free full-layout image as the composition reference. Do not use the earlier background-only variant as the complete layout reference.

## Acceptance checklist

- [ ] Desktop export is 16:9 with the full interface visible.
- [ ] Central hero character is absent; community portraits remain.
- [ ] Layout retains the narrow left rail, horizontal header, oversized headline, two content blocks, and bottom statistics strip.
- [ ] METAVERSE is fully readable, pale pink, distressed, and kept on one desktop line.
- [ ] Typography closely matches the reference; any substitute font is acknowledged.
- [ ] All visible navigation labels, CTA labels, and metric values are retained.
- [ ] Dark center remains open; no new hero object or content card is inserted.
- [ ] Thin angular frames and selective magenta highlights remain crisp.
- [ ] Smaller screens remain readable and keyboard navigation works.
- [ ] Production copy, metric claims, asset rights, and actual interaction destinations are supplied before launch.
