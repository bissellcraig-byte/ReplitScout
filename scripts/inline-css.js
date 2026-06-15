#!/usr/bin/env node
/*
 * inline-css.js — inlines minified core CSS directly into each HTML page to
 * eliminate render-blocking stylesheet requests.
 *
 * Each HTML page declares which stylesheets to inline via a marker:
 *   <!-- CSS:INLINE:START files=main,custom,motion -->
 *   ...generated <style> goes here...
 *   <!-- CSS:INLINE:END -->
 *
 * Relative url(...) references inside the CSS are resolved against assets/css/
 * (where the source files live) so they keep working once inlined at site root.
 *
 * Run after editing any *.min.css:  node scripts/inline-css.js
 */
const fs = require("fs");
const path = require("path");

const CSS_DIR = "assets/css";
const cache = {};

function loadCss(name) {
  if (cache[name]) return cache[name];
  const file = path.join(CSS_DIR, name + ".min.css");
  let css = fs.readFileSync(file, "utf8");
  css = css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, url) => {
    const u = url.trim();
    if (/^(https?:|data:|\/|#)/i.test(u)) return m;
    const resolved = path.posix.normalize(path.posix.join(CSS_DIR, u));
    return "url(" + q + resolved + q + ")";
  });
  cache[name] = css;
  return css;
}

const START = "<!-- CSS:INLINE:START";
const END = "<!-- CSS:INLINE:END -->";

const htmlFiles = fs.readdirSync(".").filter((f) => f.endsWith(".html"));
let changed = 0;

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, "utf8");
  const startIdx = html.indexOf(START);
  if (startIdx === -1) continue;

  const startTagEnd = html.indexOf("-->", startIdx);
  const directive = html.slice(startIdx, startTagEnd);
  const m = directive.match(/files=([a-z0-9,_-]+)/i);
  const files = m ? m[1].split(",") : [];
  const endIdx = html.indexOf(END, startTagEnd);
  if (endIdx === -1) {
    console.error("No END marker in", file);
    continue;
  }

  const css = files.map(loadCss).join("");
  const rebuilt =
    html.slice(startIdx, startTagEnd + 3) +
    "\n<style>" +
    css +
    "</style>\n" +
    END;
  const newHtml =
    html.slice(0, startIdx) + rebuilt + html.slice(endIdx + END.length);

  if (newHtml !== html) {
    fs.writeFileSync(file, newHtml);
    changed++;
    console.log("inlined", files.join("+"), "->", file);
  }
}
console.log("Done. files changed:", changed);
