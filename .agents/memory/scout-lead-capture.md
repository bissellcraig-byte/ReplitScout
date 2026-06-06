---
name: Scout lead-capture (no backend)
description: How lead-capture tools on the Scout static site hand off to the studio without a server.
---

Scout Content Studio is a static site with no backend. Lead-capture forms/tools hand
off via `mailto:` to info@scoutcontent.studio (see work-with-us.html and
conceptualizer/index.html).

**Rule:** Never fake a "message sent" success state for a client-side `mailto:` flow.
The browser cannot confirm the mail app opened or that the user sent anything.
Surface a user-clicked `mailto:` button/link (direct gesture = reliable) and word the
success copy as "here's how to send", not "we sent it".

**Why:** An earlier version auto-fired `window.location.href = mailto` after async PDF
generation and returned a hardcoded `true`, so the UI claimed an email was opened even
when it wasn't (and the async call was outside the original click gesture).

**How to apply:** For any new no-backend lead tool, build the mailto string and assign
it to a visible button's `href`; keep messaging deterministic. `mailto:` also can't
attach files — if a PDF is involved, tell the user to attach the downloaded file
manually.
