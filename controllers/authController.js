/*
 * Finland Ice Hockey Tournament Platform
 * File: controllers/authController.js
 * Author: Muhammad Abdullah (Authentication and User Profile)
 * Purpose: Sign in, sign up and sign out logic. Verifies passwords with bcrypt
 *          and stores the user id on the session.
 */

const User = require('../models/User');

exports.showSignIn = (req, res) => {
  res.render('pages/signin', { page: 'signin', error: null, next: req.query.next || '/dashboard' });
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  const nextUrl = req.body.next || '/dashboard';

  if (!email || !password) {
    return res.render('pages/signin', { page: 'signin', error: 'Email and password are required.', next: nextUrl });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) {
    return res.render('pages/signin', { page: 'signin', error: 'Invalid email or password.', next: nextUrl });
  }

  const ok = await user.verifyPassword(password);
  if (!ok) {
    return res.render('pages/signin', { page: 'signin', error: 'Invalid email or password.', next: nextUrl });
  }

  req.session.userId = user._id;
  req.flash('success', 'Welcome back, ' + user.name + '.');
  res.redirect(nextUrl);
};

exports.showSignUp = (req, res) => {
  res.render('pages/signup', { page: 'signup', error: null, values: {} });
};

exports.signUp = async (req, res) => {
  const { name, email, password, confirm, age, location, role } = req.body;
  const values = { name, email, age, location, role };

  if (!name || !email || !password) {
    return res.render('pages/signup', { page: 'signup', error: 'Name, email, and password are required.', values });
  }
  if (password.length < 8) {
    return res.render('pages/signup', { page: 'signup', error: 'Password must be at least 8 characters.', values });
  }
  if (password !== confirm) {
    return res.render('pages/signup', { page: 'signup', error: 'Passwords do not match.', values });
  }

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    return res.render('pages/signup', { page: 'signup', error: 'An account with that email already exists.', values });
  }

  const safeRole = ['player', 'organizer'].includes(role) ? role : 'player';

  const user = await User.create({
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    password,
    age: age ? Number(age) : undefined,
    location: location ? String(location).trim() : undefined,
    role: safeRole
  });

  req.session.userId = user._id;
  req.flash('success', 'Welcome, ' + user.name + '. Your account is ready.');
  res.redirect('/dashboard');
};

exports.signOut = (req, res) => {
  if (!req.session) {
    res.clearCookie('connect.sid');
    return res.redirect('/');
  }
  req.session.destroy(err => {
    if (err) console.error('Session destroy error:', err);
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};
