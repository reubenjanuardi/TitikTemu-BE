/**
 * Auth Service - Business Logic
 * Contains all authentication-related business logic
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} - Created user data and JWT token
 */
const register = async ({ email, password, name, role }) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409; // Conflict
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });

  // Generate JWT token
  const token = generateToken(user);

  return {
    user,
    token
  };
};

/**
 * Authenticate user and return token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - User data and JWT token
 */
const login = async (email, password) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token
  };
};

/**
 * Validate JWT token
 * Used by API Gateway to verify incoming requests
 * @param {string} token - JWT token to validate
 * @returns {Object} - Decoded token payload
 */
const validateToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Optionally verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      valid: true,
      user
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Object} - User profile data
 */
const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn
    }
  );
};

module.exports = {
  register,
  login,
  validateToken,
  getProfile
};
