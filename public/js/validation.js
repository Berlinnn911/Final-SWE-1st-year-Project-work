/*
 * Finland Ice Hockey Tournament Platform
 * File: public/js/validation.js
 * Author: Muhammad Abdullah (Authentication and User Profile)
 * Purpose: Small client side form validation for sign in and sign up pages
 *          (required fields, valid email, password length and password match)
 */
(function () {
  'use strict';

  const forms = document.querySelectorAll('form[novalidate]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      let valid = true;

      form.querySelectorAll('.field__error').forEach(function (n) { n.remove(); });
      form.querySelectorAll('.input').forEach(function (n) { n.classList.remove('is-error'); });

      form.querySelectorAll('input[required]').forEach(function (input) {
        if (!input.value.trim()) {
          valid = false;
          markError(input, 'This field is required.');
          return;
        }

        if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
          valid = false;
          markError(input, 'Enter a valid email address.');
          return;
        }

        if (input.type === 'password' && input.value.length < 8) {
          valid = false;
          markError(input, 'Password must be at least 8 characters.');
          return;
        }
      });

      const pw = form.querySelector('input[name="password"]');
      const confirm = form.querySelector('input[name="confirm"]');
      if (pw && confirm && pw.value && confirm.value && pw.value !== confirm.value) {
        valid = false;
        markError(confirm, 'Passwords do not match.');
      }

      if (!valid) {
        e.preventDefault();
      }
    });
  });

  function markError(input, message) {
    input.classList.add('is-error');
    const err = document.createElement('div');
    err.className = 'field__error';
    err.textContent = message;
    input.parentElement.appendChild(err);
  }
})();
