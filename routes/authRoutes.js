/*
 * Finland Ice Hockey Tournament Platform
 * File: routes/authRoutes.js
 * Author: Muhammad Abdullah (Authentication and User Profile)
 * Purpose: URL routes for /signin, /signup and /signout
 */

const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.get('/signin', auth.showSignIn);
router.post('/signin', auth.signIn);
router.get('/signup', auth.showSignUp);
router.post('/signup', auth.signUp);
router.post('/signout', auth.signOut);

module.exports = router;
