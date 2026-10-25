# Cheese Louise public homepage artwork

## Approved town hero (pending integration)

The approved sunset mountain-town street scene has been prepared as a standalone,
web-optimized 1223 × 426 WebP image. The exact intended repository location is:

`assets/approved-town-hero.webp`

**This binary asset is not yet in this branch.** The current hero still uses
`assets/alpine-village.svg` as an interim placeholder. Do not merge or publish
that substitute as the approved visual.

When the approved file is uploaded, update `mountain-home.css` to use the WebP
as the hero backdrop, then verify desktop and mobile cropping, contrast and
legibility of the real HTML marquee, image loading, and reduced-motion behavior.
Update the static and browser smoke checks to require the approved WebP.
Do not silently fall back to the substitute during release checks.

The original approved full-page mockup includes baked-in navigation, labels and
example episode content; **never use the whole composite as a background**.
The hero artwork should remain scenery only. Navigation, the marquee, feature
cards and calls to action must stay as accessible, selectable HTML.

The four feature-card illustrations are independent, editable SVG assets:
`podcast-art.svg`, `music-art.svg`, `bingo-art.svg`, and `drink-art.svg`.
Keep the standalone public website separate from private Cheese Louise HQ.
