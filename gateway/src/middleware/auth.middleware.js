/**
 * Authentication Middleware for API Gateway
 * Handles JWT verification before proxying to microservices
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Main authentication middleware
 * Validates JWT and attaches user info to request headers
 * for downstream microservices
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header - supports both formats
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No authorization token provided' 
      });
    }

    // Support both "Bearer TOKEN" and "TOKEN" formats
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Attach user info to request
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

const createContext = ({ req }) => {
  const authHeader = req.headers.authorization || '';
  
  // Support both "Bearer TOKEN" and "TOKEN" formats
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;

  let user = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = {
        id: decoded.id || decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
      console.log('✅ Valid token, user:', user.email);
    } catch (error) {
      console.log('❌ Invalid token in GraphQL context');
    }
  }

  return { user };
};

module.exports = { authMiddleware, createContext };
