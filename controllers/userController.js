/*
 * Finland Ice Hockey Tournament Platform
 * File: controllers/userController.js
 * Author: Muhammad Abdullah (Authentication and User Profile)
 * Purpose: Dashboard data fetch and profile update logic for the logged in user
 */

const User = require('../models/User');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

exports.dashboard = async (req, res) => {
  const myTeams = await Team.find({ $or: [{ captain: req.user._id }, { players: req.user._id }] }).limit(10);

  const teamIds = myTeams.map(t => t._id);
  const myTournaments = await Tournament.find({ registeredTeams: { $in: teamIds } })
    .sort({ startDate: 1 })
    .limit(10);

  const pendingRequestCount = myTeams.reduce((sum, t) => {
    if (String(t.captain) === String(req.user._id)) {
      return sum + (t.joinRequests ? t.joinRequests.length : 0);
    }
    return sum;
  }, 0);

  res.render('pages/dashboard', {
    page: 'dashboard',
    myTeams,
    myTournaments,
    pendingRequestCount
  });
};

exports.profile = (req, res) => {
  res.render('pages/profile', { page: 'profile', error: null, success: null });
};

exports.updateProfile = async (req, res) => {
  const { name, email, bio, age, location } = req.body;

  if (!name || !email) {
    return res.render('pages/profile', { page: 'profile', error: 'Name and email are required.', success: null });
  }

  const trimmedEmail = String(email).toLowerCase().trim();
  if (trimmedEmail !== req.user.email) {
    const taken = await User.findOne({ email: trimmedEmail, _id: { $ne: req.user._id } });
    if (taken) {
      return res.render('pages/profile', { page: 'profile', error: 'That email is already in use.', success: null });
    }
  }

  req.user.name = String(name).trim();
  req.user.email = trimmedEmail;
  req.user.bio = bio ? String(bio).trim() : '';
  req.user.age = age ? Number(age) : undefined;
  req.user.location = location ? String(location).trim() : '';
  await req.user.save();

  req.flash('success', 'Profile updated.');
  res.redirect('/profile');
};
