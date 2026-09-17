/*
 * Finland Ice Hockey Tournament Platform
 * File: routes/pageRoutes.js
 * Author: Zawal (Backend Architecture, Database and DevOps)
 * Purpose: Public page routes (home and about) that everyone can visit
 */

const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');

router.get('/', async (req, res) => {
  const tournaments = await Tournament.find().sort({ startDate: 1 }).limit(3);
  const teams = await Team.find().sort({ wins: -1, createdAt: -1 }).limit(4);
  res.render('pages/home', { page: 'home', tournaments, teams });
});

router.get('/about', (req, res) => {
  res.render('pages/about', { page: 'about' });
});

module.exports = router;
