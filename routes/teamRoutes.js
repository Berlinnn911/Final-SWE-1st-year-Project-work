/*
 * Finland Ice Hockey Tournament Platform
 * File: routes/teamRoutes.js
 * Author: Usman Zulfiqar (Team Module, Full Stack)
 * Purpose: URL routes for /teams (list, create, detail, join, leave, captain actions)
 */

const express = require('express');
const router = express.Router();
const team = require('../controllers/teamController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', team.list);
router.get('/new', team.showCreate);
router.post('/', team.create);
router.get('/:id', team.detail);
router.post('/:id/join', team.requestJoin);
router.post('/:id/leave', team.leave);
router.post('/:id/requests/:requestId/approve', team.approveRequest);
router.post('/:id/requests/:requestId/reject', team.rejectRequest);
router.post('/:id/players/:userId/remove', team.removePlayer);
router.post('/:id/delete', team.delete);

module.exports = router;
