# Scout Content Studio

## Overview

Static marketing website for Scout Content Studio, built on the Spectral template
(HTML5 UP). Plain HTML/CSS/JS — no build step, no backend, no database.

## Project Structure

- `index.html` — Home (landing layout)
- `services.html` — Services
- `project-examples.html` — Project examples
- `work-with-us.html` — Work with us (project note form)
- `about.html` — Redirects to `index.html#one`
- `privacy.html` — Privacy policy
- `generic.html`, `elements.html` — Template reference pages
- `free-resources/` — Generated blog/resource hub (`index.html` + one `<slug>.html` per post)
- `resources/` — Markdown source for the Free Resources posts (`<slug>.md`)
- `scripts/build-resources.js` — Zero-dependency generator (markdown → hub + post pages + sitemap)
- `assets/` — CSS, JS, fonts, Sass sources
- `images/` — Site imagery

## Running Locally (Replit)

A lightweight Node static file server (`server.js`) serves the site.

- Workflow: `Start application` runs `npm start` (→ `node server.js`)
- Host/port: `0.0.0.0:5000`
- The server sends no-cache headers in development so the preview always reflects
  the latest files.

## Build (minified CSS/JS)

The site serves minified assets (`*.min.css`, `*.min.js`) referenced by the HTML.
The readable source files (`assets/css/main.css`, `custom.css`, `motion.css` and
`assets/js/util.js`, `main.js`, `motion.js`, `before-after.js`) are the working
copies — edit those, then regenerate the minified output:

- `npm run build` — minify all CSS (clean-css) and JS (terser)
- `npm run build:css` / `npm run build:js` — run one half

Netlify still publishes the directory as-is (no build step on deploy); commit the
regenerated `*.min` files. Vendor files already shipped minified (jQuery,
breakpoints, browser, fontawesome) are not rebuilt.

## Free Resources (blog/resource hub)

The Free Resources hub (`/free-resources/`) and its posts are **generated** from
markdown — never hand-edit the HTML in `free-resources/`.

- Source: one markdown file per post in `resources/<slug>.md` with frontmatter
  (`title, slug, date, category, excerpt, seoTitle, seoDescription, author`;
  optional `featuredImage, featured, readingTime`). Exactly one post sets
  `featured: true` (the hero card). Categories must match the list in the generator.
- Generate: `node scripts/build-resources.js` — writes `free-resources/index.html`
  + one `free-resources/<slug>.html` per post and refreshes the `<!-- FREE-RESOURCES -->`
  block in `sitemap.xml`. The generator is **zero-dependency on purpose** (do not add
  npm packages — it would regenerate the fragile lockfile).
- Generated pages inline their own CSS with root-relative paths (`inline-css.js` only
  handles root pages), so after any `*.min.css` change run `npm run build:css` **then**
  re-run the generator.
- To add a post: create `resources/<slug>.md`, run the generator, verify locally,
  then commit the new `.md` + generated `.html` + updated `sitemap.xml` together.

## Dependency changes (IMPORTANT — avoid breaking Netlify deploys)

`package-lock.json` is the only file that has repeatedly broken Netlify. When
`npm install` runs inside Replit, npm bakes the internal Replit firewall registry
host (`package-firewall.replit.local`) into every `"resolved"` URL in the lockfile.
Netlify's build servers cannot reach that host, so `npm ci` fails at the "Install
dependencies" step and production freezes on the old deploy.

Guard in place (`scripts/check-lockfile.sh`):

- `npm run check:lockfile` — fails loudly if the lockfile contains `replit.local`.
- `npm run fix:lockfile` — rewrites the bad host to `https://registry.npmjs.org/`.
- `postinstall` auto-runs the fix, so a normal `npm install` self-heals the lockfile.
- `pretest` / `predeploy` run the check so a broken lockfile cannot slip past.

Flow after any dependency change: run `npm install`, then **always run
`npm run check:lockfile` and commit the cleaned `package-lock.json` before pushing.**
If a Netlify deploy ever fails at "Install dependencies", grep the lockfile for
`replit.local` first.

## Deployment

Configured as a **static** deployment with `publicDir: "."`. Replit serves the
HTML/CSS/JS files directly; `server.js` is only used for the dev workflow.

## User Preferences

(none recorded yet)
