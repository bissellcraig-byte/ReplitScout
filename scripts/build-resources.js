#!/usr/bin/env node
/*
 * build-resources.js — generates the Free Resources hub and post pages from
 * markdown sources in resources/*.md. ZERO npm dependencies (a new dependency
 * would risk re-breaking the Netlify lockfile — see replit.md).
 *
 * For each post: resources/<slug>.md (YAML-ish frontmatter + small markdown body).
 * Outputs:
 *   free-resources/index.html        — the hub (slug /free-resources/)
 *   free-resources/<slug>.html       — one page per post
 *   sitemap.xml                      — refreshed with hub + post URLs
 *
 * Generated subdirectory pages use ROOT-RELATIVE asset/link paths (/assets/...,
 * /images/..., /free-resources/...) so they are immune to trailing-slash and
 * directory-depth issues. CSS is inlined here (the same approach as
 * scripts/inline-css.js, but rewriting url() to root-relative paths) because
 * inline-css.js only processes root-level pages.
 *
 * Run after editing content or *.min.css:  node scripts/build-resources.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

const SITE = "https://scoutcontent.studio";
const ORG_ID = SITE + "/#organization";
const WEBSITE_ID = SITE + "/#website";
const HUB_URL = SITE + "/free-resources/";
const OG_IMAGE = SITE + "/images/scout-social-card.png";
const CSS_DIR = "assets/css";
const RESOURCES_DIR = "resources";
const OUT_DIR = "free-resources";
const INLINE_FILES = ["main", "custom"];

const CATEGORIES = [
  "Websites",
  "SEO",
  "AI Search",
  "Private Practice",
  "Marketing Basics",
  "Behavioral Health",
];

/* ---------- helpers ---------- */

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonLd(obj) {
  // JSON.stringify escapes string contents; also neutralize </script> breakouts.
  return JSON.stringify(obj, null, 2).replace(/</g, "\\u003c");
}

function fail(msg) {
  console.error("build-resources: ERROR — " + msg);
  process.exit(1);
}

function loadCssAbsolute(name) {
  const file = path.join(CSS_DIR, name + ".min.css");
  let css = fs.readFileSync(file, "utf8");
  css = css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, url) => {
    const u = url.trim();
    if (/^(https?:|data:|\/|#)/i.test(u)) return m;
    const resolved = path.posix.normalize(path.posix.join(CSS_DIR, u));
    return "url(" + q + "/" + resolved + q + ")";
  });
  return css;
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/* ---------- markdown (intentionally small subset) ---------- */

function inlineMd(text) {
  let s = esc(text);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    const safe = /^(https?:\/\/|mailto:|\/|#|\.\/|\.\.\/)/i.test(url);
    const href = safe ? url : "#";
    const ext = /^https?:\/\//i.test(url);
    const attrs = ext ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${href}"${attrs}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return s;
}

function markdownToHtml(body) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  const isBlockStart = (l) => /^(#{2,3}\s|>\s?|[-*]\s+|\d+\.\s+)/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    const h = line.match(/^(#{2,3})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      blocks.push(`<h${lvl}>${inlineMd(h[2].trim())}</h${lvl}>`);
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(`<blockquote><p>${inlineMd(buf.join(" ").trim())}</p></blockquote>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inlineMd(lines[i].replace(/^[-*]\s+/, "").trim())}</li>`);
        i++;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inlineMd(lines[i].replace(/^\d+\.\s+/, "").trim())}</li>`);
        i++;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() !== "" && !isBlockStart(lines[i])) {
      buf.push(lines[i].trim());
      i++;
    }
    blocks.push(`<p>${inlineMd(buf.join(" "))}</p>`);
  }
  return blocks.join("\n                        ");
}

/* ---------- frontmatter ---------- */

function parseFrontmatter(raw, file) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) fail(`missing or malformed frontmatter in ${file}`);
  const data = {};
  for (const line of m[1].split("\n")) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx === -1) fail(`bad frontmatter line in ${file}: "${line}"`);
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    val = val.replace(/^["']|["']$/g, "");
    data[key] = val;
  }
  return { data, body: m[2].trim() };
}

function loadPosts() {
  if (!fs.existsSync(RESOURCES_DIR)) fail(`missing ${RESOURCES_DIR}/ directory`);
  const files = fs.readdirSync(RESOURCES_DIR).filter((f) => f.endsWith(".md"));
  if (!files.length) fail("no markdown posts found in resources/");
  const required = [
    "title",
    "slug",
    "date",
    "category",
    "excerpt",
    "seoTitle",
    "seoDescription",
    "author",
  ];
  const seenSlugs = new Set();
  const posts = files.map((f) => {
    const { data, body } = parseFrontmatter(
      fs.readFileSync(path.join(RESOURCES_DIR, f), "utf8"),
      f
    );
    for (const key of required) {
      if (!data[key]) fail(`missing required field "${key}" in ${f}`);
    }
    if (!/^[a-z0-9-]+$/.test(data.slug))
      fail(`invalid slug "${data.slug}" in ${f} (use lowercase letters, numbers, hyphens)`);
    if (seenSlugs.has(data.slug)) fail(`duplicate slug "${data.slug}" (${f})`);
    seenSlugs.add(data.slug);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || isNaN(new Date(data.date + "T00:00:00Z")))
      fail(`invalid date "${data.date}" in ${f} (use YYYY-MM-DD)`);
    if (!CATEGORIES.includes(data.category))
      fail(`unknown category "${data.category}" in ${f} (allowed: ${CATEGORIES.join(", ")})`);
    if (!body) fail(`empty body in ${f}`);
    return {
      file: f,
      title: data.title,
      slug: data.slug,
      date: data.date,
      dateDisplay: formatDate(data.date),
      category: data.category,
      excerpt: data.excerpt,
      featuredImage: data.featuredImage || OG_IMAGE,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      author: data.author,
      featured: String(data.featured).toLowerCase() === "true",
      readingTime: data.readingTime || "",
      bodyHtml: markdownToHtml(body),
      url: `${SITE}/free-resources/${data.slug}.html`,
      href: `/free-resources/${data.slug}.html`,
    };
  });
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
}

/* ---------- shared chrome ---------- */

function ogImageTags() {
  return `        <meta property="og:image" content="${OG_IMAGE}" />
        <meta property="og:image:width" content="1254" />
        <meta property="og:image:height" content="1254" />
        <meta property="og:image:alt" content="Scout Content Studio logo" />`;
}

function fontTags() {
  const href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Jost:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap";
  return `        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'" />
        <noscript><link rel="stylesheet" href="${href}" /></noscript>`;
}

function gtagTag() {
  return `        <!-- Google tag (gtag.js) — loaded lazily to protect render performance -->
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-ET4PNLSLZ5');
          (function(){
            var loaded = false;
            function loadGtag(){
              if (loaded) return; loaded = true;
              var s = document.createElement('script');
              s.async = true;
              s.src = 'https://www.googletagmanager.com/gtag/js?id=G-ET4PNLSLZ5';
              document.head.appendChild(s);
            }
            var events = ['scroll','mousemove','touchstart','keydown','click'];
            events.forEach(function(e){ window.addEventListener(e, loadGtag, {once:true, passive:true}); });
            if (document.readyState === 'complete') { setTimeout(loadGtag, 2000); }
            else { window.addEventListener('load', function(){ setTimeout(loadGtag, 2000); }); }
          })();
        </script>`;
}

function headHtml({ title, desc, canonical, ogType, schema, extraOg }) {
  const css = INLINE_FILES.map(loadCssAbsolute).join("");
  return `<!DOCTYPE HTML>
<!--
    Spectral by HTML5 UP
    html5up.net | @ajlkn
    Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
-->
<html lang="en">
    <head>
        <title>${esc(title)}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
${fontTags()}
        <meta name="description" content="${esc(desc)}" />
        <meta property="og:type" content="${ogType}" />
        <meta property="og:site_name" content="Scout Content Studio" />
        <meta property="og:url" content="${canonical}" />
        <link rel="canonical" href="${canonical}" />
        <meta property="og:title" content="${esc(title)}" />
        <meta property="og:description" content="${esc(desc)}" />
${ogImageTags()}
${extraOg ? extraOg + "\n" : ""}        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="${esc(title)}" />
        <meta name="twitter:description" content="${esc(desc)}" />
        <meta name="twitter:image" content="${OG_IMAGE}" />
        <script type="application/ld+json">
${schema}
        </script>
        <link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
        <!-- CSS:INLINE:START files=${INLINE_FILES.join(",")} -->
<style>${css}</style>
<!-- CSS:INLINE:END -->
        <link rel="stylesheet" href="/assets/css/fontawesome-subset.min.css" />
        <noscript><link rel="stylesheet" href="/assets/css/noscript.css" /></noscript>
${gtagTag()}
    </head>`;
}

function headerHtml() {
  return `            <header id="header">
                <div class="header-scout-logo-h">
                    <a href="/index.html" class="header-scout-logo-link" aria-label="Scout Content Studio home">
                        <span class="header-scout-logo-crop">
                            <picture><source srcset="/images/scout-logo-white.webp" type="image/webp" /><img src="/images/scout-logo-white.png" alt="" class="header-scout-logo" width="770" height="293" /></picture>
                        </span>
                    </a>
                </div>
                <nav id="nav">
                    <ul>
                        <li class="nav-link"><a href="/index.html">Home</a></li>
                        <li class="nav-link"><a href="/services.html">More on services</a></li>
                        <li class="nav-link"><a href="/pricing.html">Pricing</a></li>
                        <li class="nav-link"><a href="/project-examples.html">Project examples</a></li>
                        <li class="nav-link"><a href="/work-with-us.html">Work with us</a></li>
                        <li class="nav-link"><a href="/free-resources/" aria-current="page">Free Resources</a></li>
                        <li class="special">
                            <a href="#menu" class="menuToggle"><span class="menu-label">Menu</span><span class="menu-hamburger" aria-hidden="true"><i></i><i></i><i></i></span></a>
                            <div id="menu">
                                <ul>
                                    <li><a href="/index.html">Home</a></li>
                                    <li><a href="/services.html">More on services</a></li>
                                    <li><a href="/pricing.html">Pricing</a></li>
                                    <li><a href="/project-examples.html">Project examples</a></li>
                                    <li><a href="/work-with-us.html">Work with us</a></li>
                                    <li><a href="/free-resources/">Free Resources</a></li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </nav>
            </header>`;
}

function footerHtml() {
  return `            <footer id="footer">
                <ul class="icons">
                    <li><a href="https://www.linkedin.com/company/113554109/" class="icon brands fa-linkedin-in" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><span class="label">LinkedIn</span></a></li>
                    <li><a href="https://www.instagram.com/scoutcontentstudio" class="icon brands fa-instagram" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><span class="label">Instagram</span></a></li>
                    <li><a href="https://www.facebook.com/profile.php?id=61590121724267" class="icon brands fa-facebook-f" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><span class="label">Facebook</span></a></li>
                    <li><a href="mailto:info@scoutcontent.studio" class="icon solid fa-envelope" aria-label="Email Scout Content Studio"><span class="label">Email Scout</span></a></li>
                </ul>
                <p>Websites, applications, marketing, AI workflows, SEO, and AI-search content for behavioral health practices.</p>
                <ul class="footer-nav">
                    <li><a href="/index.html">Home</a></li>
                    <li><a href="/services.html">More on services</a></li>
                    <li><a href="/pricing.html">Pricing</a></li>
                    <li><a href="/project-examples.html">Project examples</a></li>
                    <li><a href="/work-with-us.html">Work with us</a></li>
                    <li><a href="/privacy.html">Privacy policy</a></li>
                    <li><a href="/free-resources/">Free Resources</a></li>
                </ul>
                <p><a href="mailto:info@scoutcontent.studio">info@scoutcontent.studio</a></p>
                <p><a href="tel:+19165348806">916-534-8806</a></p>
                <p>Please do not send client names, diagnoses, clinical details, or protected health information.</p>
                <ul class="copyright">
                    <li><a href="/conceptualizer/" style="color:inherit;text-decoration:none;">&copy;</a> 2026 Scout Content Studio. All rights reserved.</li>
                </ul>
            </footer>`;
}

function scriptsHtml() {
  return `        <script src="/assets/js/jquery.min.js" defer></script>
        <script src="/assets/js/jquery.scrollex.min.js" defer></script>
        <script src="/assets/js/jquery.scrolly.min.js" defer></script>
        <script src="/assets/js/browser.min.js" defer></script>
        <script src="/assets/js/breakpoints.min.js" defer></script>
        <script src="/assets/js/util.min.js" defer></script>
        <script src="/assets/js/main.min.js" defer></script>`;
}

/* ---------- card fragments ---------- */

function gridCard(p) {
  return `                    <a class="fr-card" href="${p.href}">
                        <span class="fr-card__kicker">${esc(p.category)}</span>
                        <h3 class="fr-card__title">${esc(p.title)}</h3>
                        <p class="fr-card__excerpt">${esc(p.excerpt)}</p>
                        <span class="fr-card__meta"><time datetime="${p.date}">${p.dateDisplay}</time>${
    p.readingTime ? ` &middot; ${esc(p.readingTime)}` : ""
  }</span>
                        <span class="fr-card__more">Read more <span aria-hidden="true">&rarr;</span></span>
                    </a>`;
}

function featuredCard(p) {
  return `                <section class="fr-featured">
                    <div class="fr-featured__inner">
                        <a class="fr-featured__card" href="${p.href}">
                            <span class="fr-featured__kicker">Featured &middot; ${esc(p.category)}</span>
                            <h2 class="fr-featured__title">${esc(p.title)}</h2>
                            <p class="fr-featured__excerpt">${esc(p.excerpt)}</p>
                            <span class="fr-featured__meta"><time datetime="${p.date}">${p.dateDisplay}</time>${
    p.readingTime ? ` &middot; ${esc(p.readingTime)}` : ""
  }</span>
                            <span class="fr-featured__more">Read the guide <span aria-hidden="true">&rarr;</span></span>
                        </a>
                    </div>
                </section>`;
}

function communityCard() {
  return `                <section class="fr-community" aria-labelledby="fr-community-title">
                    <div class="fr-community__inner">
                        <div class="fr-community__card">
                            <span class="fr-community__kicker">Free Community</span>
                            <h2 class="fr-community__title" id="fr-community-title">Paid to Help: Marketing Support for Mental Health Professionals</h2>
                            <p class="fr-community__subhead">A free Facebook community for mental health professionals who want to grow ethical, sustainable practices.</p>
                            <div class="fr-community__body">
                                <p>Building a practice should not require you to become a full-time marketer, chase trends, or pretend you love being on camera.</p>
                                <p>Paid to Help is a free Facebook community for therapists and mental health professionals who want practical marketing education that actually fits the work they do. We share simple lessons, daily tips, AI-era strategies, and real support for getting found, building trust, and creating a healthier business.</p>
                                <p>No fluff. No gatekeeping. No weird sales bro energy. Just useful guidance from people who understand both the clinical work and the reality of trying to build something sustainable.</p>
                            </div>
                            <a class="button primary fr-community__cta" href="https://www.facebook.com/groups/paidtohelp" target="_blank" rel="noopener noreferrer">Join the free Facebook community</a>
                        </div>
                    </div>
                </section>`;
}

/* ---------- page builders ---------- */

function buildHub(posts) {
  const featured = posts.filter((p) => p.featured).sort((a, b) => (a.date < b.date ? 1 : -1));
  if (!featured.length) fail('no featured post found (set "featured: true" on one post)');
  const featuredPost = featured[0];
  const gridPosts = posts.filter((p) => p !== featuredPost);

  const title = "Free Resources for Behavioral Health Marketing | Scout Content Studio";
  const desc =
    "Free, practical guides on websites, SEO, AI search, and marketing for therapists and behavioral health practices. No hype, no jargon — just clear, useful advice from Scout Content Studio.";

  const schema = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "Scout Content Studio",
        url: SITE + "/",
        logo: OG_IMAGE,
        image: OG_IMAGE,
        email: "info@scoutcontent.studio",
        telephone: "+1-916-534-8806",
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE + "/",
        name: "Scout Content Studio",
        inLanguage: "en-US",
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "WebPage",
        "@id": HUB_URL + "#webpage",
        url: HUB_URL,
        name: title,
        description: desc,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        inLanguage: "en-US",
      },
      {
        "@type": "Blog",
        "@id": HUB_URL + "#blog",
        url: HUB_URL,
        name: "Free Resources for Behavioral Health Marketing",
        description: desc,
        inLanguage: "en-US",
        publisher: { "@id": ORG_ID },
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          "@id": p.url + "#article",
          headline: p.title,
          url: p.url,
          datePublished: p.date,
          author: { "@id": ORG_ID },
        })),
      },
      {
        "@type": "ItemList",
        "@id": HUB_URL + "#itemlist",
        itemListElement: posts.map((p, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: p.url,
          name: p.title,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": HUB_URL + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: "Free Resources", item: HUB_URL },
        ],
      },
    ],
  });

  const html = `${headHtml({
    title,
    desc,
    canonical: HUB_URL,
    ogType: "website",
    schema,
  })}
    <body class="is-preload page-free-resources">

        <div id="page-wrapper">

${headerHtml()}

            <article id="main">
                <header class="fr-hero">
                    <div class="fr-hero__inner">
                        <nav class="fr-breadcrumb" aria-label="Breadcrumb">
                            <a href="/index.html">Home</a> <span aria-hidden="true">/</span> <span aria-current="page">Free Resources</span>
                        </nav>
                        <span class="fr-hero__eyebrow">Free Resources</span>
                        <h1 class="fr-hero__headline">Free Resources for Behavioral Health Marketing</h1>
                        <p class="fr-hero__sub">Clear, practical guides on websites, SEO, AI search, and marketing — written for therapists and behavioral health practices. No hype, no jargon.</p>
                        <ul class="actions fr-hero__actions">
                            <li><a href="#fr-resources" class="button primary">Browse resources</a></li>
                            <li><a href="/work-with-us.html" class="button">Work with Scout</a></li>
                        </ul>
                    </div>
                </header>

${communityCard()}

${featuredCard(featuredPost)}

                <section id="fr-resources" class="fr-grid-section">
                    <div class="fr-grid-section__inner">
                        <header class="fr-section-head">
                            <h2>Browse the library</h2>
                            <p>Short, useful reads you can act on today.</p>
                        </header>
                        <div class="fr-grid">
${gridPosts.map(gridCard).join("\n")}
                        </div>
                    </div>
                </section>

                <section id="cta" class="wrapper style4">
                    <div class="inner">
                        <header>
                            <h2>Want help putting this into practice?</h2>
                            <p>Send a short, general project note about what is not working on your site. No client names, diagnoses, or protected health information.</p>
                        </header>
                        <ul class="actions stacked">
                            <li><a href="/work-with-us.html" class="button fit primary">Work with Scout</a></li>
                            <li><a href="/services.html" class="button fit">Review services</a></li>
                        </ul>
                    </div>
                </section>
            </article>

${footerHtml()}

        </div>

${scriptsHtml()}

    </body>
</html>
`;
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), html);
  console.log("wrote", path.join(OUT_DIR, "index.html"));
  return { featuredPost, gridPosts };
}

function buildPost(p) {
  const title = p.seoTitle;
  const desc = p.seoDescription;
  const extraOg = `        <meta property="article:published_time" content="${p.date}" />
        <meta property="article:modified_time" content="${p.date}" />
        <meta property="article:section" content="${esc(p.category)}" />`;

  const schema = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "Scout Content Studio",
        url: SITE + "/",
        logo: OG_IMAGE,
        image: OG_IMAGE,
        email: "info@scoutcontent.studio",
        telephone: "+1-916-534-8806",
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE + "/",
        name: "Scout Content Studio",
        inLanguage: "en-US",
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "BlogPosting",
        "@id": p.url + "#article",
        headline: p.title,
        description: p.excerpt,
        url: p.url,
        datePublished: p.date,
        dateModified: p.date,
        articleSection: p.category,
        inLanguage: "en-US",
        image: p.featuredImage.startsWith("http") ? p.featuredImage : SITE + p.featuredImage,
        author: { "@id": ORG_ID, "@type": "Organization", name: p.author },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": HUB_URL + "#blog" },
        mainEntityOfPage: { "@type": "WebPage", "@id": p.url + "#webpage" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": p.url + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: "Free Resources", item: HUB_URL },
          { "@type": "ListItem", position: 3, name: p.title, item: p.url },
        ],
      },
    ],
  });

  const html = `${headHtml({
    title,
    desc,
    canonical: p.url,
    ogType: "article",
    schema,
    extraOg,
  })}
    <body class="is-preload page-resource-post">

        <div id="page-wrapper">

${headerHtml()}

            <article id="main" class="fr-post">
                <header class="fr-post__head">
                    <div class="fr-post__head-inner">
                        <nav class="fr-breadcrumb" aria-label="Breadcrumb">
                            <a href="/index.html">Home</a> <span aria-hidden="true">/</span> <a href="/free-resources/">Free Resources</a> <span aria-hidden="true">/</span> <span aria-current="page">${esc(p.category)}</span>
                        </nav>
                        <span class="fr-post__kicker">${esc(p.category)}</span>
                        <h1 class="fr-post__title">${esc(p.title)}</h1>
                        <p class="fr-post__meta"><time datetime="${p.date}">${p.dateDisplay}</time> &middot; ${esc(
    p.author
  )}${p.readingTime ? ` &middot; ${esc(p.readingTime)}` : ""}</p>
                    </div>
                </header>

                <section class="fr-post__body">
                    <div class="fr-post__body-inner">
                        ${p.bodyHtml}
                    </div>
                </section>

                <section id="cta" class="wrapper style4">
                    <div class="inner">
                        <header>
                            <h2>Have a project that looks like this?</h2>
                            <p>Send a short, general project note. No client names, diagnoses, or protected health information.</p>
                        </header>
                        <ul class="actions stacked">
                            <li><a href="/work-with-us.html" class="button fit primary">Work with Scout</a></li>
                            <li><a href="/free-resources/" class="button fit">More free resources</a></li>
                        </ul>
                    </div>
                </section>
            </article>

${footerHtml()}

        </div>

${scriptsHtml()}

    </body>
</html>
`;
  fs.writeFileSync(path.join(OUT_DIR, p.slug + ".html"), html);
  console.log("wrote", path.join(OUT_DIR, p.slug + ".html"));
}

/* ---------- sitemap ---------- */

function updateSitemap(posts) {
  const file = "sitemap.xml";
  if (!fs.existsSync(file)) fail("sitemap.xml not found");
  let xml = fs.readFileSync(file, "utf8");
  // Strip any previously generated Free Resources block (idempotent rebuilds).
  xml = xml.replace(
    /\n?\s*<!-- FREE-RESOURCES:START -->[\s\S]*?<!-- FREE-RESOURCES:END -->/g,
    ""
  );
  const today = new Date().toISOString().slice(0, 10);
  const entries = [];
  entries.push(
    `  <url>\n    <loc>${HUB_URL}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  );
  for (const p of posts) {
    entries.push(
      `  <url>\n    <loc>${p.url}</loc>\n    <lastmod>${p.date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
    );
  }
  const block = `  <!-- FREE-RESOURCES:START -->\n${entries.join("\n")}\n  <!-- FREE-RESOURCES:END -->`;
  const closeIdx = xml.lastIndexOf("</urlset>");
  if (closeIdx === -1) fail("sitemap.xml has no </urlset>");
  xml = xml.slice(0, closeIdx) + block + "\n" + xml.slice(closeIdx);
  fs.writeFileSync(file, xml);
  console.log("updated sitemap.xml (+" + (posts.length + 1) + " urls)");
}

/* ---------- main ---------- */

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const posts = loadPosts();
  buildHub(posts);
  posts.forEach(buildPost);
  updateSitemap(posts);
  console.log(`build-resources: done — hub + ${posts.length} posts.`);
}

main();
