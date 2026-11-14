/* =========================================================
   Portfolio – Rahul Kumar  |  script.js
   Vanilla JavaScript – menu, scroll effects, animations, form
   ========================================================= */

(function () {
  "use strict";

  // ---- CONFIG: change this to your real email address ----
  var CONTACT_EMAIL = "situ8521@gmail.com";

  var header = document.getElementById("header");
  var navToggle = document.getElementById("nav-toggle");
  var navMenu = document.getElementById("nav-menu");
  var navLinks = document.querySelectorAll(".nav-link");
  var backToTop = document.getElementById("back-to-top");

  /* ---------- 1. Mobile menu ---------- */
  function closeMenu() {
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  navToggle.addEventListener("click", function () {
    var isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the menu after tapping a link
  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* ---------- 2. Header style + back-to-top visibility ---------- */
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 20);
    backToTop.classList.toggle("show", y > 500);
    highlightActiveLink();
  }

  /* ---------- 3. Active nav link on scroll ---------- */
  var sections = document.querySelectorAll("main section[id]");

  function highlightActiveLink() {
    var pos = window.scrollY + 140;
    var current = "home";
    sections.forEach(function (sec) {
      if (pos >= sec.offsetTop) current = sec.id;
    });
    // At the very bottom of the page, force the last section active
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      current = sections[sections.length - 1].id;
    }
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Back to top ---------- */
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- 5. Typing effect in hero ---------- */
  var typedEl = document.getElementById("typed");
  var phrases = [
     "Python applications using machine learning",
    "data-driven software ",
    "responsive web interfaces"
  ];
  var pIndex = 0, cIndex = 0, deleting = false;

  function type() {
    var phrase = phrases[pIndex];
    typedEl.textContent = phrase.substring(0, cIndex);

    var delay = deleting ? 40 : 80;
    if (!deleting && cIndex === phrase.length) {
      deleting = true;
      delay = 1600; // pause at end of phrase
    } else if (deleting && cIndex === 0) {
      deleting = false;
      pIndex = (pIndex + 1) % phrases.length;
      delay = 400;
    }
    cIndex += deleting ? -1 : 1;
    setTimeout(type, delay);
  }
  type();

  /* ---------- 6. Reveal on scroll + skill bar animation ---------- */
  var revealItems = document.querySelectorAll(".reveal");

  function fillBars(scope) {
    scope.querySelectorAll(".bar-fill").forEach(function (bar) {
      bar.style.width = bar.getAttribute("data-level") + "%";
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          fillBars(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealItems.forEach(function (el, i) {
      // Small stagger so grid items cascade in
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      observer.observe(el);
    });
  } else {
    // Fallback for very old browsers
    revealItems.forEach(function (el) { el.classList.add("visible"); fillBars(el); });
  }

  /* ---------- 7. Contact form (opens visitor's email app) ---------- */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var fields = ["name", "email", "subject", "message"];
    var data = {};
    var valid = true;

    fields.forEach(function (id) {
      var input = document.getElementById(id);
      data[id] = input.value.trim();
      var ok = data[id] !== "";
      if (id === "email") ok = ok && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[id]);
      input.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });

    status.className = "form-status";
    if (!valid) {
      status.textContent = "Please fill in all fields with a valid email address.";
      status.classList.add("error");
      return;
    }

    var body = "Name: " + data.name + "\nEmail: " + data.email + "\n\n" + data.message;
    window.location.href =
      "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent(data.subject) +
      "&body=" + encodeURIComponent(body);

    status.textContent = "Opening your email app… thank you for reaching out!";
    status.classList.add("success");
    form.reset();
  });

  /* ---------- 8. Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
