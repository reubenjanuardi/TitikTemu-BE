/**
 * Proxy Routes
 * Routes all API requests to appropriate microservices
 * 
 * Route mapping:
 *   /api/auth/*       -> Auth Service
 *   /api/events/*     -> Event Service
 *   /api/attendance/* -> Attendance Service
 *   /api/venues/*     -> Venue Consumer Service
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const config = require('../config');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// ==============================================
// Auth Service Routes
// Public routes (no auth required)
// ==============================================
router.post('/auth/register', async (req, res, next) => {
  try {
    const response = await axios.post(
      `${config.services.authServiceUrl}/auth/register`,
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.post('/auth/login', async (req, res, next) => {
  try {
    const response = await axios.post(
      `${config.services.authServiceUrl}/auth/login`,
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.post('/auth/validate', async (req, res, next) => {
  try {
    const response = await axios.post(
      `${config.services.authServiceUrl}/auth/validate`,
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Protected auth routes
router.get('/auth/profile', authMiddleware, async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.authServiceUrl}/auth/profile`,
      {
        headers: {
          'Authorization': req.headers.authorization
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// ==============================================
// Event Service Routes
// ==============================================

// Public routes
router.get('/events', async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.eventServiceUrl}/events`,
      { params: req.query }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/events/:id', async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.eventServiceUrl}/events/${req.params.id}`
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.post('/events', authMiddleware, async (req, res, next) => {
  try {
    const response = await axios.post(
      `${config.services.eventServiceUrl}/events`,
      req.body,
      {
        headers: {
          'x-user-id': req.headers['x-user-id'],
          'x-user-email': req.headers['x-user-email'],
          'x-user-role': req.headers['x-user-role'],
          'x-user-name': req.headers['x-user-name']
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.put('/events/:id', authMiddleware, async (req, res, next) => {
  try {
    const response = await axios.put(
      `${config.services.eventServiceUrl}/events/${req.params.id}`,
      req.body,
      {
        headers: {
          'x-user-id': req.headers['x-user-id'],
          'x-user-email': req.headers['x-user-email'],
          'x-user-role': req.headers['x-user-role'],
          'x-user-name': req.headers['x-user-name']
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.delete('/events/:id', authMiddleware, async (req, res, next) => {
  try {
    const response = await axios.delete(
      `${config.services.eventServiceUrl}/events/${req.params.id}`,
      {
        headers: {
          'x-user-id': req.headers['x-user-id'],
          'x-user-email': req.headers['x-user-email'],
          'x-user-role': req.headers['x-user-role'],
          'x-user-name': req.headers['x-user-name']
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.post('/events/:id/register', authMiddleware, async (req, res, next) => {
  try {
    const response = await axios.post(
      `${config.services.eventServiceUrl}/events/${req.params.id}/register`,
      req.body,
      {
        headers: {
          'x-user-id': req.headers['x-user-id'],
          'x-user-email': req.headers['x-user-email'],
          'x-user-role': req.headers['x-user-role'],
          'x-user-name': req.headers['x-user-name']
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/events/:id/participants', authMiddleware, async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.eventServiceUrl}/events/${req.params.id}/participants`,
      {
        headers: {
          'x-user-id': req.headers['x-user-id'],
          'x-user-email': req.headers['x-user-email'],
          'x-user-role': req.headers['x-user-role'],
          'x-user-name': req.headers['x-user-name']
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// ==============================================
// Attendance Service Routes
// ==============================================

router.post('/attendance/check-in', authMiddleware, async (req, res, next) => {
  try {
    const response = await axios.post(
      `${config.services.attendanceServiceUrl}/attendance/check-in`,
      req.body,
      {
        headers: {
          'x-user-id': req.headers['x-user-id'],
          'x-user-email': req.headers['x-user-email'],
          'x-user-role': req.headers['x-user-role'],
          'x-user-name': req.headers['x-user-name']
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/attendance/event/:id', authMiddleware, async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.attendanceServiceUrl}/attendance/event/${req.params.id}`,
      {
        headers: {
          'x-user-id': req.headers['x-user-id'],
          'x-user-email': req.headers['x-user-email'],
          'x-user-role': req.headers['x-user-role'],
          'x-user-name': req.headers['x-user-name']
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/attendance/user/:userId', authMiddleware, async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.attendanceServiceUrl}/attendance/user/${req.params.userId}`,
      {
        headers: {
          'x-user-id': req.headers['x-user-id'],
          'x-user-email': req.headers['x-user-email'],
          'x-user-role': req.headers['x-user-role'],
          'x-user-name': req.headers['x-user-name']
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/attendance/stats/:eventId', authMiddleware, async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.attendanceServiceUrl}/attendance/stats/${req.params.eventId}`,
      {
        headers: {
          'x-user-id': req.headers['x-user-id'],
          'x-user-email': req.headers['x-user-email'],
          'x-user-role': req.headers['x-user-role'],
          'x-user-name': req.headers['x-user-name']
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// ==============================================
// Venue Service Routes
// ==============================================

// Public routes
router.get('/venues', async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.venueServiceUrl}/venues`
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/venues/logistics', async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.venueServiceUrl}/venues/logistics`
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/venues/logistics/:category', async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.venueServiceUrl}/venues/logistics/${req.params.category}`
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/venues/:id', async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.venueServiceUrl}/venues/${req.params.id}`
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/venues/:id/availability', authMiddleware, async (req, res, next) => {
  try {
    const response = await axios.get(
      `${config.services.venueServiceUrl}/venues/${req.params.id}/availability`,
      {
        params: req.query,
        headers: {
          'x-user-id': req.headers['x-user-id'],
          'x-user-email': req.headers['x-user-email'],
          'x-user-role': req.headers['x-user-role'],
          'x-user-name': req.headers['x-user-name']
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
