/*
 * Finland Ice Hockey Tournament Platform
 * File: routes/userRoutes.js
 * Author: Muhammad Abdullah (Authentication and User Profile)
 * Purpose: URL routes for /dashboard and /profile (both require login)
 */

const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.get('/dashboard', requireAuth, user.dashboard);
router.get('/profile', requireAuth, user.profile);
router.post('/profile', requireAuth, user.updateProfile);

module.exports = router;
