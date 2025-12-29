/**
 * Event Controller
 * Handles event-related HTTP requests
 */

const eventService = require('../services/event.service');
const { validationResult } = require('express-validator');

/**
 * Create a new event
 * @route POST /events
 */
const createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    const event = await eventService.createEvent(eventData);

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all events
 * @route GET /events
 */
const getAllEvents = async (req, res, next) => {
  try {
    const { status, upcoming, page, limit } = req.query;
    
    const events = await eventService.getAllEvents({
      status,
      upcoming: upcoming === 'true',
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });

    return res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event by ID
 * @route GET /events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an event
 * @route PUT /events/:id
 */
const updateEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const event = await eventService.updateEvent(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an event
 * @route DELETE /events/:id
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await eventService.deleteEvent(id);

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register for an event
 * @route POST /events/:id/register
 */
const registerForEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userName = req.user.name;
    const userEmail = req.user.email;

    const registration = await eventService.registerForEvent(id, {
      userId,
      userName,
      userEmail
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully registered for event',
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event participants
 * @route GET /events/:id/participants
 */
const getEventParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const participants = await eventService.getEventParticipants(id);

    return res.status(200).json({
      success: true,
      message: 'Participants retrieved successfully',
      data: participants
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventParticipants
};
