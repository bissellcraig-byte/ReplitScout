(function () {
        "use strict";

        function init(toggle) {
                toggle.dataset.state = "after";

                var btns = toggle.querySelectorAll(".ba-toggle__btn");

                btns.forEach(function (btn) {
                        btn.addEventListener("click", function () {
                                var state = btn.dataset.ba;
                                toggle.dataset.state = state;
                                btns.forEach(function (b) {
                                        var active = b.dataset.ba === state;
                                        b.classList.toggle("is-active", active);
                                        b.setAttribute("aria-pressed", active ? "true" : "false");
                                });
                        });
                });
        }

        function boot() {
                var toggles = document.querySelectorAll("[data-ba-toggle]");
                toggles.forEach(init);
        }

        if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", boot);
        } else {
                boot();
        }
})();
