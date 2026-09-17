/*
 * Finland Ice Hockey Tournament Platform
 * File: controllers/teamController.js
 * Author: Usman Zulfiqar (Team Module, Full Stack)
 * Purpose: All team business logic. Create, list, view detail, request to join,
 *          leave, approve or reject join requests, remove players and delete team.
 */

const Team = require('../models/Team');
const User = require('../models/User');
const Tournament = require('../models/Tournament');

exports.list = async (req, res) => {
  const teams = await Team.find().populate('captain', 'name').sort({ wins: -1, name: 1 });
  res.render('pages/teams', { page: 'teams', teams });
};

exports.showCreate = (req, res) => {
  res.render('pages/team-create', { page: 'teams', error: null, values: {} });
};

exports.create = async (req, res) => {
  const { name, region, description } = req.body;
  const values = { name, region, description };

  if (!name || !region) {
    return res.render('pages/team-create', { page: 'teams', error: 'Team name and region are required.', values });
  }

  const existing = await Team.findOne({ name: String(name).trim() });
  if (existing) {
    return res.render('pages/team-create', { page: 'teams', error: 'A team with that name already exists.', values });
  }

  const team = await Team.create({
    name: String(name).trim(),
    region: String(region).trim(),
    description: description ? String(description).trim() : '',
    captain: req.user._id,
    players: [req.user._id]
  });

  req.user.teams.addToSet(team._id);
  await req.user.save();

  req.flash('success', 'Team "' + team.name + '" created. You are the captain.');
  res.redirect('/teams/' + team._id);
};

exports.detail = async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('captain', 'name email')
    .populate('players', 'name email')
    .populate('tournaments', 'title startDate location status')
    .populate('joinRequests.user', 'name email');

  if (!team) return res.status(404).render('pages/error', { page: '', status: 404, message: 'Team not found.' });

  const isCaptain = req.user && String(team.captain._id) === String(req.user._id);
  const isMember = req.user && team.players.some(p => String(p._id) === String(req.user._id));
  const hasPendingRequest = req.user && team.joinRequests.some(r => r.user && String(r.user._id) === String(req.user._id));

  res.render('pages/team-detail', {
    page: 'teams',
    team,
    isCaptain,
    isMember,
    hasPendingRequest
  });
};

exports.requestJoin = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).send('Team not found');

  if (String(team.captain) === String(req.user._id)) {
    req.flash('error', 'You are the captain of this team.');
    return res.redirect('/teams/' + team._id);
  }
  if (team.players.some(p => String(p) === String(req.user._id))) {
    req.flash('error', 'You are already a member.');
    return res.redirect('/teams/' + team._id);
  }
  if (team.joinRequests.some(r => r.user && String(r.user) === String(req.user._id))) {
    req.flash('error', 'You already have a pending request.');
    return res.redirect('/teams/' + team._id);
  }

  team.joinRequests.push({ user: req.user._id, message: req.body.message || '' });
  await team.save();

  req.flash('success', 'Join request sent to ' + team.name + '.');
  res.redirect('/teams/' + team._id);
};

exports.leave = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).send('Team not found');

  if (String(team.captain) === String(req.user._id)) {
    req.flash('error', 'Captains cannot leave their own team. Transfer captaincy or delete the team first.');
    return res.redirect('/teams/' + team._id);
  }

  team.players = team.players.filter(p => String(p) !== String(req.user._id));
  await team.save();

  req.user.teams = req.user.teams.filter(t => String(t) !== String(team._id));
  await req.user.save();

  req.flash('success', 'You left ' + team.name + '.');
  res.redirect('/teams');
};

exports.approveRequest = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).send('Team not found');
  if (String(team.captain) !== String(req.user._id)) return res.status(403).send('Only the captain can approve requests.');

  const reqId = req.params.requestId;
  const reqItem = team.joinRequests.id(reqId);
  if (!reqItem) {
    req.flash('error', 'Request not found.');
    return res.redirect('/teams/' + team._id);
  }

  const userId = reqItem.user;
  if (!team.players.some(p => String(p) === String(userId))) {
    team.players.push(userId);
  }
  team.joinRequests.pull(reqId);
  await team.save();

  await User.findByIdAndUpdate(userId, { $addToSet: { teams: team._id } });

  req.flash('success', 'Player added to roster.');
  res.redirect('/teams/' + team._id);
};

exports.rejectRequest = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).send('Team not found');
  if (String(team.captain) !== String(req.user._id)) return res.status(403).send('Only the captain can reject requests.');

  team.joinRequests.pull(req.params.requestId);
  await team.save();

  req.flash('success', 'Request rejected.');
  res.redirect('/teams/' + team._id);
};

exports.removePlayer = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).send('Team not found');
  if (String(team.captain) !== String(req.user._id)) return res.status(403).send('Only the captain can remove players.');

  const targetId = req.params.userId;
  if (String(targetId) === String(team.captain)) {
    req.flash('error', 'You cannot remove yourself as captain.');
    return res.redirect('/teams/' + team._id);
  }

  team.players = team.players.filter(p => String(p) !== String(targetId));
  await team.save();

  await User.findByIdAndUpdate(targetId, { $pull: { teams: team._id } });

  req.flash('success', 'Player removed.');
  res.redirect('/teams/' + team._id);
};

exports.delete = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).send('Team not found');
  if (String(team.captain) !== String(req.user._id)) return res.status(403).send('Only the captain can delete the team.');

  await Tournament.updateMany(
    { registeredTeams: team._id },
    { $pull: { registeredTeams: team._id } }
  );
  await User.updateMany({ teams: team._id }, { $pull: { teams: team._id } });
  await Team.deleteOne({ _id: team._id });

  req.flash('success', 'Team deleted.');
  res.redirect('/teams');
};
