# Archived pricing page

`pricing.html.txt` is an exact copy of the pricing page before it was hidden.
It is deliberately stored as text, excluded from Replit publishing, and blocked
by the local server and Netlify routing. Do not link to this archive publicly.

To restore:
1. Copy `pricing.html.txt` back to the root as `pricing.html`.
2. Remove the pricing redirects from `netlify.toml` and `server.js`.
3. Restore Pricing links in the desktop navigation, mobile menus, and footers
   of the root pages and in `scripts/build-resources.js`.
4. Restore the pricing URL in `sitemap.xml`.
5. Run `node scripts/inline-css.js` and `node scripts/build-resources.js`.
6. Verify and publish the site.

The existing pricing CSS and assets have been kept unchanged for restoration.
