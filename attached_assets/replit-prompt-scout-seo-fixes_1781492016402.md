You are working in the Replit project for **scoutcontent.studio** — a static, hand-coded HTML site with shared CSS/JS in an `/assets` folder, deployed to Netlify. I ran a Semrush site audit and need you to fix the issues below **cleanly**, without changing the visual design, layout, or copy voice, and without breaking the Netlify deploy. Work through each item in order, make changes incrementally, and at the end give me a plain summary of exactly what you changed in each file.

## Site structure (for reference — confirm against the actual repo)
- **Pages:** `index.html` (home), `services.html`, `work-with-us.html`, `project-examples.html`, `privacy.html`, and the Website Brief Builder under `conceptualizer/`
- **Shared CSS:** `assets/css/main.css`, `assets/css/custom.css`, `assets/css/motion.css`
- **Shared JS:** `assets/js/util.js`, `assets/js/main.js`, `assets/js/motion.js`, `assets/js/before-after.js` (`before-after.js` is only used on `project-examples`)

## Ground rules (apply to everything below)
- **Do not change how any page looks or behaves.** After your changes, every page must render and function identically to before.
- **Keep the source readable and editable.** Do not leave me with hand-mangled files I can't maintain.
- **The site must still build and deploy to Netlify.** If you add a build step, update `netlify.toml` (build command + publish directory) and confirm the local preview still works before finishing.
- Tell me what you changed as you go.

---

### 1. Minify CSS and JavaScript (Warning — 52 instances)
These files are currently served unminified: `assets/css/main.css`, `assets/css/custom.css`, `assets/css/motion.css`, `assets/js/util.js`, `assets/js/main.js`, `assets/js/motion.js`, `assets/js/before-after.js`.

**Preferred fix:** add a minimal build step that minifies CSS and JS on deploy — e.g., a small `package.json` using `esbuild` or `terser` for JS and `clean-css`/`csso` for CSS — outputting minified files and updating the HTML `<link>` and `<script>` references to point to the minified output. **Keep the readable source files in the repo** (e.g., move originals into a `/src` folder, or keep them as the working copies that feed the build) so I can still edit them. Wire the build command into `netlify.toml`.

**Acceptable fallback** (if a build step would complicate the Netlify deploy): minify each file in place, but keep an unminified backup copy of each (e.g., `main.src.css`, `util.src.js`).

Either way: the live site must serve minified CSS/JS and behave identically.

### 2. Shorten title tags that are too long (Warning — 3 unique pages)
Keep each `<title>` **under ~60 characters**, while preserving the primary keyword and the "Scout Content Studio" brand. Retain "behavioral health" where it fits under the limit.

| Page | Current title (too long) | Suggested replacement |
|---|---|---|
| `index.html` | Scout Content Studio \| Websites, applications, and marketing for behavioral health practices (91) | **Scout Content Studio \| Behavioral Health Web & Marketing** (56) |
| `work-with-us.html` | Work with Scout Content Studio \| Project inquiry for behavioral health practices (79) | **Work With Us \| Scout Content Studio** (35) |
| `project-examples.html` | Project examples for behavioral health websites and applications \| Scout Content Studio (87) | **Behavioral Health Project Examples \| Scout Content** (50) |

If you deviate meaningfully from these suggestions, show me your proposed titles before finalizing.

### 3. Fix pages with more than one H1 (Notice — 3 unique pages)
Each page should have **exactly one `<h1>`** — the main page heading. Convert the extra H1s to the correct semantic level (usually `<h2>` or `<h3>`), and **preserve the existing styling** so nothing changes visually (re-use the same CSS classes, or add equivalent styles so the converted headings look the same).
- `work-with-us.html` — currently **3** H1s → reduce to 1
- `services.html` — currently **2** H1s → reduce to 1
- `conceptualizer/` (Website Brief Builder) — currently **2** H1s → reduce to 1

### 4. Strengthen internal linking to under-linked pages (Notice — 4 pages)
These pages each have only **one** internal link pointing to them, which weakens crawlability and SEO: `services.html`, `work-with-us.html`, `project-examples.html`, `privacy.html`.

Add relevant, natural internal links **pointing to these pages** from elsewhere on the site:
- Make sure all four appear in the main nav and/or footer site-wide.
- Add contextual in-body links where they genuinely fit — e.g., link **services** and **project examples** from the home page body, and add a **"work with us"** CTA link from `services.html` and `project-examples.html`.

Keep anchor text natural and useful — do not keyword-stuff.

### 5. Add an llms.txt file (Notice — new)
Create `/llms.txt` at the site root, following the llms.txt convention (a Markdown file that helps AI/LLM crawlers understand the site). Structure:
- An H1 with the site name: `# Scout Content Studio`
- A one-line blockquote summary of what Scout does
- A short paragraph or two of context (who it's for, what it offers)
- A `## Pages` section listing the key pages as Markdown links, each with a short description after a colon — home, services, work with us, project examples, privacy

Use real content pulled from the actual pages for the descriptions. Place the file in the publish/output directory so Netlify serves it as plain text at `https://scoutcontent.studio/llms.txt`.

### 6. Thin-content pages — flag, don't pad (Warning)
Semrush flagged a few pages as low word count / low text-to-HTML ratio: `project-examples.html` (193 words), `privacy.html` (108 words), and `conceptualizer/` (markup-heavy interactive tool).
- **Leave `privacy.html` and `conceptualizer/` as-is** — a legal page and an interactive tool are expected to be short / markup-heavy, and that's fine.
- For `project-examples.html`, you may add genuinely useful descriptive content (a short intro and a brief description for each example) to push it over ~250 words — but keep it factual, do **not** invent claims, and **flag this section for me to review and rewrite in my own voice** rather than finalizing the marketing copy yourself.

---

## Final checklist — run through this and report back
- [ ] All listed CSS/JS files are minified in the deployed output, and every page still renders and functions identically
- [ ] The three title tags are under ~60 characters and keep the brand/keyword
- [ ] Each affected page has exactly one H1, with no visual change
- [ ] The four under-linked pages now have multiple natural internal links pointing to them
- [ ] `/llms.txt` exists and is served as plain text at the site root
- [ ] `netlify.toml` / build config updated if needed, and the Netlify deploy still succeeds
- [ ] A summary of every file you changed and what changed in each
