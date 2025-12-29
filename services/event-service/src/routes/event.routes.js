/**
 * Event Routes
 * Defines all event-related endpoints
 * 
 * Endpoints:
 *   POST   /events              - Create new event (admin only)
 *   GET    /events              - Get all events
 *   GET    /events/:id          - Get event by ID
 *   PUT    /events/:id          - Update event (admin only)
 *   DELETE /events/:id          - Delete event (admin only)
 *   POST   /events/:id/register - Register for event
 *   GET    /events/:id/participants - Get event participants
 */

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { validateEvent, validateRegistration } = require('../middleware/validation.middleware');
const { extractUser, requireAdmin } = require('../middleware/auth.middleware');

// ==============================================
// Public Routes
// ==============================================

/**
 * @route   GET /events
 * @desc    Get all published events
 * @access  Public
 */
router.get('/', eventController.getAllEvents);

/**
 * @route   GET /events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:id', eventController.getEventById);

// ==============================================
// Protected Routes
// ==============================================

/**
 * @route   POST /events
 * @desc    Create a new event
 * @access  Admin only
 */
router.post('/', extractUser, requireAdmin, validateEvent, eventController.createEvent);

/**
 * @route   PUT /events/:id
 * @desc    Update an event
 * @access  Admin only
 */
router.put('/:id', extractUser, requireAdmin, validateEvent, eventController.updateEvent);

/**
 * @route   DELETE /events/:id
 * @desc    Delete an event
 * @access  Admin only
 */
router.delete('/:id', extractUser, requireAdmin, eventController.deleteEvent);

/**
 * @route   POST /events/:id/register
 * @desc    Register current user for an event
 * @access  Authenticated users
 */
router.post('/:id/register', extractUser, validateRegistration, eventController.registerForEvent);

/**
 * @route   GET /events/:id/participants
 * @desc    Get list of participants for an event
 * @access  Admin only
 */
router.get('/:id/participants', extractUser, requireAdmin, eventController.getEventParticipants);

module.exports = router;
