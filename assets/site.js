(function () {
  'use strict';

  // ---------- Main menu (mobile panel) ----------
  (function initNav() {
    var header = document.querySelector('.site-header');
    var btn = header && header.querySelector('.nav-toggle');
    var panel = btn && document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    var label = btn.querySelector('.nav-toggle-label');

    function setOpen(open, returnFocus) {
      header.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'Close' : 'Menu';
      if (!open && returnFocus) btn.focus();
    }

    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) setOpen(false, true);
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    if (window.matchMedia) {
      var mq = window.matchMedia('(min-width: 960px)');
      var reset = function () { if (mq.matches) setOpen(false); };
      if (mq.addEventListener) mq.addEventListener('change', reset); else if (mq.addListener) mq.addListener(reset);
    }
  })();

  // ---------- Calendly embed (only on /diagnostic/) ----------
  var CAL_ORIGIN = 'https://calendly.com';
  var embed = document.getElementById('calendly');
  var link = document.getElementById('calendly-link');
  if (!embed) return;

  // Forward utm_* params from this page's URL to the Calendly URL.
  function withUtm(base) {
    var url;
    try { url = new URL(base); } catch (e) { return base; }
    var params = new URLSearchParams(window.location.search);
    params.forEach(function (value, key) {
      if (/^utm_(source|medium|campaign|content|term)$/.test(key) && value && !url.searchParams.has(key)) {
        url.searchParams.set(key, value.slice(0, 200));
      }
    });
    return url.toString();
  }

  var calUrl = withUtm(embed.getAttribute('data-url'));
  if (link) link.href = calUrl;

  // Load the official Calendly widget only when the booking section gets close.
  var loaded = false;
  function loadCalendly() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    s.onload = function () {
      if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
        window.Calendly.initInlineWidget({ url: calUrl, parentElement: embed });
      }
    };
    document.head.appendChild(s);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (en) { return en.isIntersecting; })) {
        io.disconnect();
        loadCalendly();
      }
    }, { rootMargin: '900px 0px' });
    io.observe(embed);
  } else {
    loadCalendly();
  }

  document.querySelectorAll('a[href="#book"]').forEach(function (a) {
    a.addEventListener('click', loadCalendly);
  });
  if (window.location.hash === '#book') loadCalendly();

  // Meta Pixel events from the booking calendar (no personal data is sent).
  function track() {
    try { if (typeof window.fbq === 'function') window.fbq.apply(window, arguments); } catch (err) {}
  }
  var bookingStarted = false;

  // Booking confirmed inside the embed: record the conversion, then go to the confirmation page.
  window.addEventListener('message', function (e) {
    if (e.origin !== CAL_ORIGIN || !e.data || typeof e.data !== 'object') return;
    if (e.data.event === 'calendly.date_and_time_selected' && !bookingStarted) {
      bookingStarted = true;
      track('trackCustom', 'BookingStarted');
    }
    if (e.data.event === 'calendly.event_scheduled') {
      var eventId = 'sch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      track('track', 'Schedule', {}, { eventID: eventId });
      setTimeout(function () { window.location.href = '/thank-you/'; }, 500);
    }
  });
})();
