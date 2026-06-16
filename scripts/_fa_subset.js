const fs = require('fs');
const SRC = 'assets/css/fontawesome-all.min.css';
const OUT = 'assets/css/fontawesome-subset.min.css';
const css = fs.readFileSync(SRC, 'utf8');

// Only the glyphs actually referenced anywhere in the HTML.
const keep = new Set([
  'linkedin-in', 'instagram', 'facebook-f', 'envelope',
  'chart-line', 'code', 'globe', 'search', 'share-alt',
  'download', 'dribbble', 'twitter', 'github',
]);

// Depth-aware split into top-level rules (handles @font-face and @keyframes nesting).
const rules = [];
let depth = 0, start = 0;
for (let i = 0; i < css.length; i++) {
  const c = css[i];
  if (c === '{') depth++;
  else if (c === '}') { depth--; if (depth === 0) { rules.push(css.slice(start, i + 1)); start = i + 1; } }
}

const out = [];
let dropped = 0;
for (const r of rules) {
  const bi = r.indexOf('{');
  if (bi < 0) continue;
  const sel = r.slice(0, bi).trim();
  if (sel.startsWith('@')) { out.push(r); continue; } // keep @font-face / @keyframes
  const body = r.slice(bi + 1, r.length - 1).trim();
  const isIconContent = /^content\s*:/.test(body) && /\.fa-[a-z0-9-]+:{1,2}before/.test(sel);
  if (isIconContent) {
    const names = [...sel.matchAll(/\.fa-([a-z0-9-]+):{1,2}before/g)].map(m => m[1]);
    if (names.some(n => keep.has(n))) out.push(r);
    else dropped++;
  } else {
    out.push(r); // keep core / @font-face refs / utilities
  }
}

const result = out.join('');
fs.writeFileSync(OUT, result);
console.log(`orig ${css.length}B -> subset ${result.length}B (dropped ${dropped} icon rules)`);
let ok = true;
for (const n of keep) {
  const has = result.includes(`.fa-${n}:before`) || result.includes(`.fa-${n}::before`);
  if (!has) { ok = false; console.log('MISSING content for', n); }
}
console.log('@font-face kept:', (result.match(/@font-face/g) || []).length, '| all glyphs present:', ok);
