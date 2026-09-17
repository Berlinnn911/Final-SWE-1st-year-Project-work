/*
 * Finland Ice Hockey Tournament Platform
 * File: routes/tournamentRoutes.js
 * Author: Awais (Tournament Module, Full Stack)
 * Purpose: URL routes for /tournaments (list, create which is organizer only,
 *          detail, register, unregister and delete)
 */

const express = require('express');
const router = express.Router();
const tournament = require('../controllers/tournamentController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', tournament.list);
router.get('/new', requireRole('organizer', 'admin'), tournament.showCreate);
router.post('/', requireRole('organizer', 'admin'), tournament.create);
router.get('/:id', tournament.detail);
router.post('/:id/register', tournament.register);
router.post('/:id/unregister', tournament.unregister);
router.post('/:id/delete', tournament.delete);

module.exports = router;
