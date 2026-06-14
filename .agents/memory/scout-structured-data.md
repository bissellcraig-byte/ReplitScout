---
name: Scout structured data (JSON-LD)
description: Schema architecture and the no-address decision for the Scout marketing site
---

# Scout structured data

One JSON-LD `@graph` block per live page (index, services, project-examples,
work-with-us, privacy), inserted right after the `twitter:image` meta tag.
Every page carries `Organization` + `WebSite` + `WebPage`; `services.html` also
carries `FAQPage` and puts `hasOfferCatalog` on the Organization (prices visible
there). Stable ids: `https://scoutcontent.studio/#organization` and `.../#website`;
each page's WebPage uses `<absolute-url>#webpage` and links `isPartOf` website +
`about` organization.

**Decision: use `Organization`, NOT `LocalBusiness`/`ProfessionalService`.**
**Why:** the site shows no physical street address. LocalBusiness subtypes
(incl. ProfessionalService) expect a PostalAddress for Google; using them without
one triggers warnings and is inappropriate. `serviceType` is also NOT a valid
property on LocalBusiness/ProfessionalService (it's a `Service` property) — it was
removed. Service offerings live in `Organization.hasOfferCatalog` instead.
**How to apply:** keep schema = visible content only (no fake address/reviews/
prices). Offer prices use `priceSpecification.minPrice` ("starting at") and must
match the visible $ figures; 3 offers intentionally have no price (scoped by project).

Regenerate with `/tmp/fix_schema.py` (uses `json.dumps`, guarantees valid JSON,
strips any existing ld+json blocks before inserting).
