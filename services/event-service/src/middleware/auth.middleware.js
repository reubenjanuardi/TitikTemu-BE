/**
 * Authentication Middleware for Event Service
 * Extracts user information from request headers
 * (Token validation is done at API Gateway level)
 */

/**
 * Extract user from headers
 * User info is passed by API Gateway after token validation
 */
const extractUser = (req, res, next) => {
  // API Gateway passes user info in headers after validation
  const userId = req.headers["x-user-id"];
  const userEmail = req.headers["x-user-email"];
  const userRole = req.headers["x-user-role"];
  const userName = req.headers["x-user-name"];

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  req.user = {
    id: userId,
    email: userEmail,
    role: userRole,
    name: userName,
  };

  next();
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

/**
 * Require user role (any authenticated user)
 */
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  next();
};

/**
 * Verify LOGe API Key for public endpoints
 * Used for external LOGe system to access event data
 */
const verifyLogeApiKey = (req, res, next) => {
  const config = require("../config");
  const apiKey = req.headers["x-loge-api-key"];

  // Check if LOGe API key is configured and matches
  if (config.loge.incomingApiKey && apiKey !== config.loge.incomingApiKey) {
    return res.status(401).json({
      success: false,
      message: "Invalid API key",
    });
  }

  next();
};

module.exports = {
  extractUser,
  requireAdmin,
  requireUser,
  verifyLogeApiKey,
};
