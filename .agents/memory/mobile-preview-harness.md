---
name: Mobile-width preview/verification harness
description: How to visually verify mobile layouts when the screenshot tool only renders at desktop width
---

The `screenshot` app_preview tool renders at a fixed ~1280px desktop viewport and
exposes no viewport_size param; no headless browser (puppeteer/playwright/chromium)
is installed. So mobile widths cannot be screenshotted directly.

**Workaround:** create a temporary harness HTML at the project root that loads the
target page in an `<iframe>` whose CSS width is set to the mobile width (e.g. 375/
390/768px). Because the page inside uses `width=device-width`, its media queries
fire off the iframe's CSS width, so the iframe shows the true mobile layout. Drive
it with query params (`?p=page.html&w=390&s=scrollTop`). Same-origin lets you read
`iframe.contentDocument` to (a) detect horizontal overflow via
`documentElement.scrollWidth - w`, and (b) measure computed `font-size` / element
`getBoundingClientRect().height` to audit tap targets (>=44px) and input sizes
(>=16px). Screenshot the harness, then delete the temp files before finishing.

**Why:** the only reliable way to verify responsive work in this repl.
**How to apply:** any task that needs to confirm mobile rendering/overflow/tap
targets without a real device or headless browser.
