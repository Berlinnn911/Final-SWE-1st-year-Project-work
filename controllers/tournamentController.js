/*
 * Finland Ice Hockey Tournament Platform
 * File: controllers/tournamentController.js
 * Author: Awais (Tournament Module, Full Stack)
 * Purpose: All tournament business logic. List, view detail, create (organizers
 *          only), register and unregister a team (captain only) and delete.
 *          Handles capacity, deadline checks and auto status updates.
 */

const Tournament = require('../models/Tournament');
const Team = require('../models/Team');

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1735728779121-7a00e40d598f?w=1200&q=80&auto=format&fit=crop';

exports.list = async (req, res) => {
  const tournaments = await Tournament.find().sort({ startDate: 1 }).populate('organizer', 'name');
  res.render('pages/tournaments', { page: 'tournaments', tournaments });
};

exports.showCreate = (req, res) => {
  res.render('pages/tournament-create', { page: 'tournaments', error: null, values: {} });
};

exports.create = async (req, res) => {
  const { title, description, location, format, startDate, endDate, registrationDeadline, maxTeams, rules, entryFee, bannerImage } = req.body;
  const values = req.body;

  if (!title || !location || !startDate || !endDate || !registrationDeadline || !maxTeams) {
    return res.render('pages/tournament-create', { page: 'tournaments', error: 'Please fill in all required fields.', values });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const deadline = new Date(registrationDeadline);
  if (isNaN(start) || isNaN(end) || isNaN(deadline)) {
    return res.render('pages/tournament-create', { page: 'tournaments', error: 'Invalid date format.', values });
  }
  if (end < start) {
    return res.render('pages/tournament-create', { page: 'tournaments', error: 'End date must be after start date.', values });
  }
  if (deadline > start) {
    return res.render('pages/tournament-create', { page: 'tournaments', error: 'Registration deadline must be before the start date.', values });
  }

  const maxT = Number(maxTeams);
  if (maxT < 2 || maxT > 64) {
    return res.render('pages/tournament-create', { page: 'tournaments', error: 'Max teams must be between 2 and 64.', values });
  }

  const tournament = await Tournament.create({
    title: String(title).trim(),
    description: description ? String(description).trim() : '',
    location: String(location).trim(),
    format: format || 'single-elimination',
    startDate: start,
    endDate: end,
    registrationDeadline: deadline,
    maxTeams: maxT,
    rules: rules ? String(rules).trim() : '',
    entryFee: entryFee ? Number(entryFee) : 0,
    bannerImage: bannerImage ? String(bannerImage).trim() : DEFAULT_BANNER,
    organizer: req.user._id
  });

  req.flash('success', 'Tournament "' + tournament.title + '" created.');
  res.redirect('/tournaments/' + tournament._id);
};

exports.detail = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id)
    .populate('organizer', 'name email')
    .populate('registeredTeams', 'name region captain');
  if (!tournament) return res.status(404).render('pages/error', { page: '', status: 404, message: 'Tournament not found.' });

  let userTeams = [];
  let registeredTeamIds = new Set(tournament.registeredTeams.map(t => String(t._id)));

  if (req.user) {
    userTeams = await Team.find({ captain: req.user._id });
  }

  const isOrganizer = req.user && String(tournament.organizer._id) === String(req.user._id);

  res.render('pages/tournament-detail', {
    page: 'tournaments',
    tournament,
    userTeams,
    registeredTeamIds,
    isOrganizer
  });
};

exports.register = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(404).send('Tournament not found');

  const { teamId } = req.body;
  const team = await Team.findById(teamId);
  if (!team) {
    req.flash('error', 'Team not found.');
    return res.redirect('/tournaments/' + tournament._id);
  }

  if (String(team.captain) !== String(req.user._id)) {
    req.flash('error', 'Only the team captain can register the team.');
    return res.redirect('/tournaments/' + tournament._id);
  }

  if (tournament.status === 'Closed' || tournament.status === 'Cancelled') {
    req.flash('error', 'Registration is closed for this tournament.');
    return res.redirect('/tournaments/' + tournament._id);
  }

  if (tournament.registrationDeadline.getTime() < Date.now()) {
    req.flash('error', 'Registration deadline has passed.');
    return res.redirect('/tournaments/' + tournament._id);
  }

  if (tournament.registeredTeams.some(t => String(t) === String(team._id))) {
    req.flash('error', 'This team is already registered.');
    return res.redirect('/tournaments/' + tournament._id);
  }

  if (tournament.registeredTeams.length >= tournament.maxTeams) {
    req.flash('error', 'Tournament is full.');
    return res.redirect('/tournaments/' + tournament._id);
  }

  tournament.registeredTeams.push(team._id);
  tournament.updateAutoStatus();
  await tournament.save();

  team.tournaments.addToSet(tournament._id);
  await team.save();

  req.flash('success', team.name + ' registered for ' + tournament.title + '.');
  res.redirect('/tournaments/' + tournament._id);
};

exports.unregister = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(404).send('Tournament not found');

  const { teamId } = req.body;
  const team = await Team.findById(teamId);
  if (!team) {
    req.flash('error', 'Team not found.');
    return res.redirect('/tournaments/' + tournament._id);
  }
  if (String(team.captain) !== String(req.user._id)) {
    req.flash('error', 'Only the team captain can unregister the team.');
    return res.redirect('/tournaments/' + tournament._id);
  }

  tournament.registeredTeams = tournament.registeredTeams.filter(t => String(t) !== String(team._id));
  tournament.updateAutoStatus();
  await tournament.save();

  team.tournaments = team.tournaments.filter(t => String(t) !== String(tournament._id));
  await team.save();

  req.flash('success', team.name + ' unregistered from ' + tournament.title + '.');
  res.redirect('/tournaments/' + tournament._id);
};

exports.delete = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(404).send('Tournament not found');
  if (String(tournament.organizer) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).send('Only the organizer can delete this tournament.');
  }

  await Team.updateMany({ tournaments: tournament._id }, { $pull: { tournaments: tournament._id } });
  await Tournament.deleteOne({ _id: tournament._id });

  req.flash('success', 'Tournament deleted.');
  res.redirect('/tournaments');
};
