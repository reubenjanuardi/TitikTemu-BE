/**
 * Auth Routes
 * Defines all authentication-related endpoints
 * 
 * Endpoints:
 *   POST /auth/register - Register new user
 *   POST /auth/login    - User login
 *   POST /auth/validate - Validate JWT token
 *   GET  /auth/profile  - Get current user profile
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegistration, validateLogin } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');

// ==============================================
// Public Routes (No authentication required)
// ==============================================

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, authController.register);

/**
 * @route   POST /auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /auth/validate
 * @desc    Validate JWT token (used by API Gateway)
 * @access  Public (but requires valid token in body)
 */
router.post('/validate', authController.validateToken);

// ==============================================
// Protected Routes (Authentication required)
// ==============================================

/**
 * @route   GET /auth/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
