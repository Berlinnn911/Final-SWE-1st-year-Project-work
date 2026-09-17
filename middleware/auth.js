/*
 * Finland Ice Hockey Tournament Platform
 * File: middleware/auth.js
 * Author: Muhammad Abdullah (Authentication and User Profile)
 * Purpose: loadUser attaches the current user to the request, requireAuth blocks
 *          logged out users, requireRole gates routes by role (player, organizer, admin)
 */

const User = require('../models/User');

async function loadUser(req, res, next) {
  if (req.session && req.session.userId) {
    const user = await User.findById(req.session.userId).select('-password');
    if (user) {
      req.user = user;
      res.locals.user = user;
    } else {
      req.session.destroy(() => {});
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    if (req.method === 'GET') {
      return res.redirect('/signin?next=' + encodeURIComponent(req.originalUrl));
    }
    return res.status(401).send('Authentication required');
  }
  next();
}

function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user) return res.redirect('/signin');
    if (!roles.includes(req.user.role)) {
      return res.status(403).render('pages/error', {
        page: '',
        title: 'Forbidden',
        status: 403,
        message: 'You do not have permission to access this page.'
      });
    }
    next();
  };
}

module.exports = { loadUser, requireAuth, requireRole };
