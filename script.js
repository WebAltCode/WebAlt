/**
 * WebAlt Code — vanilla JavaScript
 * Sticky header, mobilní menu, scroll reveal, validace formuláře.
 * Žádné knihovny, žádný build.
 */

(function () {
  "use strict";

  var header = document.getElementById("site-header");
  var nav = document.getElementById("site-nav");
  var toggle = document.getElementById("menu-toggle");
  var form = document.getElementById("contact-form");
  var success = document.getElementById("form-success");
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky header: po odscrollování ztmaví pozadí */
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Hamburger menu */
  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("nav-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
  }

  document.querySelectorAll(".nav a, .brand").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  /* Smooth scroll s odsazením sticky headeru (pro starší prohlížeče) */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* Předvyplnění zprávy z CTA „první klienti“ */
  document.querySelectorAll("[data-prefill]").forEach(function (link) {
    link.addEventListener("click", function () {
      var field = document.getElementById("message");
      if (field && !field.value) {
        field.value = link.getAttribute("data-prefill");
      }
    });
  });

  /* Scroll reveal + lehký parallax u portfolia */
  if (!prefersReduced && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index % 5, 4) * 70 + "ms";
      observer.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var parallaxRoot = document.querySelector("[data-parallax] img");
  if (parallaxRoot && !prefersReduced) {
    window.addEventListener(
      "scroll",
      function () {
        var rect = parallaxRoot.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var offset = (rect.top / window.innerHeight) * -18;
        parallaxRoot.style.transform = "translateY(" + offset + "px) scale(1.04)";
      },
      { passive: true }
    );
  }

  /* Základní validace kontaktního formuláře (bez backendu) */
  function showError(name, message) {
    var field = form.querySelector('[name="' + name + '"]');
    var error = form.querySelector('[data-error-for="' + name + '"]');
    if (field) {
      field.classList.toggle("is-invalid", Boolean(message));
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }
    if (error) error.textContent = message || "";
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var email = String(data.get("email") || "").trim();
      var message = String(data.get("message") || "").trim();
      var valid = true;

      showError("name", name ? "" : "Vyplňte jméno.");
      showError("email", !email ? "Vyplňte e-mail." : isEmail(email) ? "" : "Zadejte platný e-mail.");
      showError("message", message ? "" : "Napište, co potřebujete.");

      if (!name || !email || !isEmail(email) || !message) valid = false;
      if (!valid) return;

      form.reset();
      if (success) {
        success.hidden = false;
        success.focus && success.focus();
      }
    });

    ["name", "email", "message"].forEach(function (name) {
      var field = form.querySelector('[name="' + name + '"]');
      if (!field) return;
      field.addEventListener("input", function () {
        showError(name, "");
      });
    });
  }
})();
