/*
	Scout Content Studio — motion.js
	Lightweight, dependency-free scroll reveals + subtle parallax.
	- Auto-targets elements so the HTML stays largely untouched.
	- Bails out cleanly when motion is reduced or IntersectionObserver is missing,
	  leaving all content fully visible.
*/
(function () {
	"use strict";

	var docEl = document.documentElement;

	// Interior services page: no scroll-reveal (long-form copy must appear instantly).
	if (document.body && document.body.classList.contains("page-services")) {
		return;
	}

	var prefersReduced =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// If motion is reduced or the browser is too old, do nothing.
	// Content remains visible because reveal styles only apply under .motion-ready.
	if (prefersReduced || !("IntersectionObserver" in window)) {
		return;
	}

	docEl.classList.add("motion-ready");

	// Selectors that get a simple upward reveal. Missing nodes are ignored.
	// NOTE: #two .scout-standard-card is intentionally NOT revealed. Compositing
	// it (via will-change / opacity) clips its absolutely positioned image and
	// leaves a hairline seam at the image edge, so these cards stay static.
	// NOTE: .wrapper.style5 .inner is excluded — on long interior pages (services,
	// privacy, etc.) the block is very tall, so a 12% intersection threshold often
	// never fires and content stays hidden until the safety timeout (~4–5s).
	var revealSelectors = [
		"#one header.major",
		"#three header.major",
		"#cta .inner",
		"#main > header",
		"#footer .icons",
		"#footer > p",
		"#footer .footer-nav"
	];

	// Containers whose direct children should reveal with a stagger.
	var staggerSelectors = ["#three .features"];

	var revealEls = [];

	revealSelectors.forEach(function (sel) {
		var nodes = document.querySelectorAll(sel);
		Array.prototype.forEach.call(nodes, function (node) {
			node.classList.add("reveal");
			revealEls.push(node);
		});
	});

	staggerSelectors.forEach(function (sel) {
		var nodes = document.querySelectorAll(sel);
		Array.prototype.forEach.call(nodes, function (node) {
			node.classList.add("stagger");
			revealEls.push(node);
		});
	});

	if (revealEls.length) {
		var revealNow = function (el) {
			el.classList.add("is-revealed", "motion-done");
		};

		var isInViewport = function (el) {
			var rect = el.getBoundingClientRect();
			var viewHeight = window.innerHeight || document.documentElement.clientHeight;
			return rect.top < viewHeight && rect.bottom > 0;
		};

		var io = new IntersectionObserver(
			function (entries, observer) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						revealNow(entry.target);
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.08, rootMargin: "0px 0px 0px 0px" }
		);

		revealEls.forEach(function (el) {
			if (isInViewport(el)) {
				revealNow(el);
				return;
			}

			io.observe(el);
		});

		// Safety net: short fallback only for elements still hidden.
		window.setTimeout(function () {
			revealEls.forEach(function (el) {
				if (!el.classList.contains("is-revealed")) {
					revealNow(el);
				}
			});
		}, 900);
	}

	// NOTE: No JS parallax. The template already uses background-attachment: fixed
	// on #page-wrapper, which provides a natural parallax for the hero/footer
	// background image. Overriding background-position here shifted that shared
	// fixed image and broke the hero and the bottom of the page.
})();
