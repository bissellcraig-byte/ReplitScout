---
name: Scout structured-data invalid item
description: Why services.html had a Google "1 structured data item is invalid" error and the conservative fix.
---

# Scout structured-data invalid item

The recurring Google "1 structured data item is invalid" error on
scoutcontent.studio traced to `services.html`: the Organization JSON-LD carried a
`hasOfferCatalog` whose `Offer` entries used `priceSpecification` with `minPrice`
(several offers had no price at all), none attached to a `Product`. Google treats
loose offer/price objects like this as an invalid item.

**Fix:** removed the entire `hasOfferCatalog` block so the Organization is clean and
basic (identical in shape to the other four pages). Kept the FAQPage — its Q&As are
all rendered visibly on the page and match the schema text exactly.

**Why:** Google only reliably validates a few rich-result types. Organization,
WebSite, WebPage stay clean/basic with no offers/pricing/address. FAQPage is only
safe to keep when every question/answer is visible on the page; otherwise remove it.

**How to apply:** Don't add OfferCatalog/Offer/Service pricing schema to this site.
JSON-LD lives only in the 5 main pages (index, services, project-examples,
work-with-us, privacy), one block each. Visible prices stay in the page body
(`svc-price` spans) — removing the schema doesn't change anything users see.
