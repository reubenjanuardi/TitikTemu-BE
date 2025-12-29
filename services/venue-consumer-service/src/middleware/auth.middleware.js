/**
 * Authentication Middleware for Venue Consumer Service
 */

const extractUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];
  const userName = req.headers['x-user-name'];

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  req.user = {
    id: userId,
    email: userEmail,
    role: userRole,
    name: userName
  };

  next();
};

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
  extractUser,
  requireAdmin
};
