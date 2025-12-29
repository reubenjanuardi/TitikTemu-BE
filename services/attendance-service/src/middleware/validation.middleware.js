/**
 * Validation Middleware for Attendance Service
 */

const { body } = require('express-validator');

const validateCheckIn = [
  body('eventId')
    .notEmpty()
    .withMessage('Event ID is required')
    .isUUID()
    .withMessage('Event ID must be a valid UUID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

module.exports = {
  validateCheckIn
};
