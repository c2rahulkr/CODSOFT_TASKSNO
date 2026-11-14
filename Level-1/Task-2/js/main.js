/* Vistara International School – interactivity (vanilla JS, no dependencies) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: sticky shadow, mobile menu ---------- */
  var header = $('.site-header'), nav = $('#nav'), toggle = $('#menuToggle');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeLightbox(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 980) setMenu(false); });

  /* ---------- Scroll: header state, back-to-top, active link ---------- */
  var toTop = $('#toTop');
  var links = $$('.nav-links a');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 600);
    var pos = y + header.offsetHeight + 120, current = 0;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= pos) current = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.reveal');
  // light stagger for siblings inside grids
  $$('.grid, .fac-grid, .gallery, .stats-grid, .adm-info').forEach(function (g) {
    $$('.reveal', g).forEach(function (el, i) { el.style.setProperty('--rd', (i % 4) * 0.08 + 's'); });
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  function fmt(n) { return n.toLocaleString('en-US'); }
  function runCounter(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = fmt(target) + suffix; return; }
    var dur = 1800, start = null;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  } else { counters.forEach(runCounter); }

  /* ---------- Testimonial slider ---------- */
  var track = $('#track'), slides = $$('.slide', track), dotsBox = $('#dots'), idx = 0, timer;
  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
    b.addEventListener('click', function () { go(i, true); });
    dotsBox.appendChild(b);
  });
  function go(i, user) {
    idx = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(' + (-100 * idx) + '%)';
    $$('button', dotsBox).forEach(function (b, k) { b.classList.toggle('on', k === idx); b.setAttribute('aria-current', k === idx ? 'true' : 'false'); });
    slides.forEach(function (s, k) { s.setAttribute('aria-hidden', k === idx ? 'false' : 'true'); });
    if (user) restart();
  }
  function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(idx + 1); }, 6000); }
  $('#prev').addEventListener('click', function () { go(idx - 1, true); });
  $('#next').addEventListener('click', function () { go(idx + 1, true); });
  var slider = $('#slider');
  slider.addEventListener('mouseenter', function () { clearInterval(timer); });
  slider.addEventListener('mouseleave', restart);
  slider.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(idx - 1, true); if (e.key === 'ArrowRight') go(idx + 1, true); });
  var sx = null; // touch swipe
  slider.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1), true);
    sx = null;
  });
  go(0); restart();

  /* ---------- Gallery lightbox ---------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lastFocus = null;
  $$('.g-item').forEach(function (b) {
    b.addEventListener('click', function () {
      lastFocus = b; lbImg.src = b.dataset.full; lbImg.alt = b.dataset.cap; lbCap.textContent = b.dataset.cap;
      lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbClose').focus();
    });
  });
  function closeLightbox() {
    if (lb.hidden) return;
    lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus();
  }
  $('#lbClose').addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });

  /* ---------- Form validation ---------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE = /^\+?[0-9][0-9\s\-()]{6,17}$/;
  var NAME = /^[A-Za-z][A-Za-z .'\-]{1,59}$/;

  var rules = {
    student: function (v) { return !v ? 'Please enter the student’s name.' : !NAME.test(v) ? 'Use letters only (2–60 characters).' : ''; },
    parent: function (v) { return !v ? 'Please enter a parent or guardian name.' : !NAME.test(v) ? 'Use letters only (2–60 characters).' : ''; },
    name: function (v) { return !v ? 'Please enter your name.' : !NAME.test(v) ? 'Use letters only (2–60 characters).' : ''; },
    email: function (v) { return !v ? 'Please enter your email address.' : !EMAIL.test(v) ? 'Enter a valid email, e.g. name@example.com.' : ''; },
    phone: function (v, f) {
      if (!v) return f.required ? 'Please enter a phone number.' : '';
      return PHONE.test(v) && v.replace(/\D/g, '').length >= 7 && v.replace(/\D/g, '').length <= 15 ? '' : 'Enter a valid phone number (7–15 digits).';
    },
    class: function (v) { return v ? '' : 'Please select a class.'; },
    subject: function (v) { return !v ? 'Please enter a subject.' : v.length < 3 ? 'Subject is too short.' : ''; },
    message: function (v, f) {
      if (!v) return f.required ? 'Please write a message.' : '';
      return v.length < 10 && f.required ? 'Message should be at least 10 characters.' : '';
    }
  };

  function check(field) {
    var wrap = field.closest('.field'), msg = $('.err', wrap);
    var rule = rules[field.name], v = field.value.trim();
    var error = rule ? rule(v, field) : '';
    wrap.classList.toggle('invalid', !!error);
    field.setAttribute('aria-invalid', error ? 'true' : 'false');
    msg.textContent = error;
    if (error) { msg.id = msg.id || field.id + '-err'; field.setAttribute('aria-describedby', msg.id); }
    return !error;
  }

  function wire(form) {
    var fields = $$('input, select, textarea', form);
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value || f.dataset.touched) check(f); f.dataset.touched = '1'; });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      fields.forEach(function (f) { if (!check(f)) { ok = false; if (!first) first = f; } });
      var ok_ = $('.success', form);
      if (!ok) { ok_.hidden = true; first.focus(); return; }
      // Demo only: wire this up to your backend / form service here.
      form.reset(); fields.forEach(function (f) { delete f.dataset.touched; });
      ok_.hidden = false; ok_.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(function () { ok_.hidden = true; }, 8000);
    });
  }
  wire($('#admissionForm')); wire($('#contactForm'));

  // Newsletter (single input without .field wrapper)
  var nf = $('#newsletterForm');
  nf.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = $('#n-email'), err = $('.err', nf), ok = $('.success', nf), v = input.value.trim();
    ok.hidden = true;
    if (!EMAIL.test(v)) {
      err.textContent = v ? 'Enter a valid email address.' : 'Please enter your email address.';
      input.setAttribute('aria-invalid', 'true'); input.focus(); return;
    }
    err.textContent = ''; input.setAttribute('aria-invalid', 'false'); input.value = ''; ok.hidden = false;
    setTimeout(function () { ok.hidden = true; }, 6000);
  });

  $('#year').textContent = new Date().getFullYear();
})();
