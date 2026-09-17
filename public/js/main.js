/* ==========================================================================
   Finland Ice Hockey Tournament Platform - main.js
   File: public/js/main.js
   Author: Rayyan Shakeel (Frontend Designer and UI Foundation)
   Purpose: Mobile menu toggle, submit button loading state and fade in on
            scroll animation. Loaded by every page.
   ========================================================================== */

(function () {
  'use strict';

  // ---------- Mobile menu ----------
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  if (navToggle && navbar) {
    navToggle.addEventListener('click', function () {
      const isOpen = navbar.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is tapped (mobile UX)
    if (primaryNav) {
      primaryNav.addEventListener('click', function (e) {
        const target = e.target;
        if (target.tagName === 'A' && navbar.classList.contains('is-open')) {
          navbar.classList.remove('is-open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navbar.classList.contains('is-open')) {
        navbar.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  // ---------- Form submit loading state ----------
  // Adds .is-loading to the submit button when a form is submitted, so the
  // user gets feedback during slow round-trips. Forms opt out with
  // data-no-loading (e.g. delete/leave confirmations that bounce instantly).
  document.querySelectorAll('form').forEach(function (form) {
    if (form.hasAttribute('data-no-loading')) return;
    form.addEventListener('submit', function (e) {
      // If a confirm() / preventDefault canceled the submit, don't spin
      if (e.defaultPrevented) return;
      const btn = form.querySelector('button[type="submit"], button:not([type])');
      if (!btn || btn.disabled) return;
      btn.classList.add('is-loading');
      btn.disabled = true;
      // Safety: if the page is still here after 8s (network stalled), restore the button
      setTimeout(function () {
        btn.classList.remove('is-loading');
        btn.disabled = false;
      }, 8000);
    });
  });

  // ---------- Fade-in on scroll ----------
  const fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && fadeEls.length > 0) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback · show everything
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
