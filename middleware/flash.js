/*
 * Finland Ice Hockey Tournament Platform
 * File: middleware/flash.js
 * Author: Muhammad Abdullah (Authentication and User Profile)
 * Purpose: One time flash messages (success and error toasts) stored in the session.
 *          Usage: req.flash('success', 'Team created'); then read res.locals.flash in views.
 */

function flashMiddleware(req, res, next) {
  req.flash = function (type, message) {
    if (!req.session) return;
    if (!req.session._flash) req.session._flash = [];
    req.session._flash.push({ type, message });
  };

  res.locals.flash = (req.session && req.session._flash) || [];
  if (req.session && req.session._flash) {
    req.session._flash = [];
  }
  next();
}

module.exports = flashMiddleware;
