/**
 * Authentication Middleware for API Gateway
 * Handles JWT verification before proxying to microservices
 */

const jwt = require('jsonwebtoken');
const axios = require('axios');
const config = require('../config');

/**
 * Main authentication middleware
 * Validates JWT and attaches user info to request headers
 * for downstream microservices
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token locally first (faster)
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Attach user info to headers for downstream services
      req.headers['x-user-id'] = decoded.id;
      req.headers['x-user-email'] = decoded.email;
      req.headers['x-user-role'] = decoded.role;
      req.headers['x-user-name'] = decoded.name || '';
      
      // Attach to request for local use
      req.user = decoded;
      
      next();
    } catch (jwtError) {
      // Token verification failed
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-email'] = decoded.email;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-name'] = decoded.name || '';
    req.user = decoded;
  } catch (error) {
    // Token invalid - continue without user
  }

  next();
};

/**
 * Admin role check middleware
 * Must be used after authMiddleware
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireAdmin
};
