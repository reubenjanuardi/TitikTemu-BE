/**
 * Validation Middleware for Event Service
 */

const { body } = require('express-validator');

/**
 * Validation rules for creating/updating events
 */
const validateEvent = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('startTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),

  body('endTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Location must not exceed 300 characters'),

  body('venueId')
    .optional()
    .isString()
    .withMessage('Venue ID must be a string'),

  body('venueName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Venue name must not exceed 200 characters'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacity must be between 1 and 10000'),

  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Invalid status value')
];

/**
 * Validation rules for event registration
 */
const validateRegistration = [
  // No body validation needed - user info comes from auth headers
];

module.exports = {
  validateEvent,
  validateRegistration
};
