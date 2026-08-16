const express = require('express');
const router = express.Router();
const { validateLogin, validateRegister } = require('../validators/authValidator');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

/**
 * Auth routes — mounted at /api/auth
 */

// POST /api/auth/login
router.post('/login', validateLogin, authController.loginHandler);

// POST /api/auth/register
router.post('/register', validateRegister, authController.registerHandler);

// GET /api/auth/me (protected)
router.get('/me', requireAuth, authController.meHandler);

module.exports = router;
