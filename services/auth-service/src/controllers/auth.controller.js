/**
 * Auth Controller
 * Handles authentication-related HTTP requests
 */

const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');

/**
 * Register a new user
 * @route POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, name, role } = req.body;
    
    const result = await authService.register({
      email,
      password,
      name,
      role: role || 'USER'
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User login
 * @route POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    
    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate JWT token
 * Used by API Gateway to verify tokens
 * @route POST /auth/validate
 */
const validateToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const result = await authService.validateToken(token);

    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: result
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 * @route GET /auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    // User is attached to request by auth middleware
    const user = await authService.getProfile(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  validateToken,
  getProfile
};
