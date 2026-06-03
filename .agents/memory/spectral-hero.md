---
name: Spectral template hero gotchas
description: Non-obvious traps when customizing the #banner hero of the Spectral (HTML5 UP) template
---

# Spectral hero customization gotchas

- **`#banner::after` is a navy preload curtain.** The template paints a full-bleed
  navy `::after` (and uses `::before`) over the banner during `body.is-preload`,
  which will completely hide any photo/background you add to the hero. To show a
  custom background you must neutralize it, e.g. `#banner::before, #banner::after { content: none !important; }`.
  **Why:** symptom is "my hero photo doesn't show even though the img/div is there."

- **Site-wide `!important` typography must be beaten with `!important`.** custom.css
  sets global heading font (Cormorant) and body/button font (Acumin) with
  `!important`, and the primary button has a sage style with `!important`. Any hero
  type/button override therefore also needs `!important` to win.

- **`!important` declarations override CSS animations.** Per the CSS spec, an
  `!important` author rule beats keyframe animation values. So `transform: none !important`
  on `.banner-scroll` blocks a keyframe's `translateY` — only non-!important
  properties (e.g. opacity) will animate. Drop the `!important` (or restructure)
  if you need the element's transform to animate.

- **Hero entrance is owned by an `is-enter` class on `#banner`** (staggered
  `heroRise` keyframes in custom.css, guarded by `@media (prefers-reduced-motion: no-preference)`),
  not by the legacy `motion.css` hero stagger (which was neutralized to avoid
  double-animating). Resting state of all hero elements is fully visible; reduced
  motion users get the static hero immediately. A small inline script removes
  `is-enter` ~3.2s after load.
