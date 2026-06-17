import { readFileSync } from "node:fs";

// ---- edit these three ----
const HOST = "scoutcontent.studio";
const KEY = "ed533b9a5c0b4c5bbb6ec97391560f77";        // the key value (same as your .txt filename, minus ".txt")
const SITEMAP_PATH = "sitemap.xml";     // path to your sitemap in the repo (adjust if it's not at the root)
// --------------------------

const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const DAYS_BACK = 7;                     // only submit pages modified within this many days

function recentUrls(xml) {
  const cutoff = Date.now() - DAYS_BACK * 86400000;
  const urls = [];
  for (const block of xml.split("<url>").slice(1)) {
    const loc = (block.match(/<loc>(.*?)<\/loc>/) || [])[1];
    const mod = (block.match(/<lastmod>(.*?)<\/lastmod>/) || [])[1];
    if (!loc) continue;
    if (!mod || new Date(mod).getTime() >= cutoff) urls.push(loc.trim());
  }
  return urls;
}

try {
  const urlList = recentUrls(readFileSync(SITEMAP_PATH, "utf8"));
  if (urlList.length === 0) {
    console.log("IndexNow: nothing modified recently, skipping.");
    process.exit(0);
  }
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  console.log(`IndexNow: submitted ${urlList.length} URL(s) — status ${res.status}`);
} catch (err) {
  console.error("IndexNow submission failed (continuing anyway):", err.message);
}
process.exit(0);   // never let an IndexNow hiccup fail the workflow
