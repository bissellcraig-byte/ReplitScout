(function () {
	"use strict";

	function init(slider) {
		var range = slider.querySelector(".ba-slider__range");
		if (!range) {
			return;
		}

		function setPosition(value) {
			slider.style.setProperty("--pos", value + "%");
		}

		setPosition(range.value);

		range.addEventListener("input", function () {
			setPosition(range.value);
		});
	}

	function boot() {
		var sliders = document.querySelectorAll("[data-ba-slider]");
		for (var i = 0; i < sliders.length; i++) {
			init(sliders[i]);
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
})();
