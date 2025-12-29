/**
 * Venue Routes
 * Defines all venue-related endpoints
 * 
 * These endpoints proxy requests to the LOGe external system
 * 
 * Endpoints:
 *   GET  /venues                    - Get all venues
 *   GET  /venues/:id                - Get venue by ID
 *   GET  /venues/:id/availability   - Check venue availability
 *   GET  /venues/logistics          - Get logistics options
 *   GET  /venues/logistics/:category - Get logistics by category
 */

const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venue.controller');
const { extractUser } = require('../middleware/auth.middleware');

// ==============================================
// Public Routes (for browsing venues)
// ==============================================

/**
 * @route   GET /venues
 * @desc    Get all available venues from LOGe
 * @access  Public
 */
router.get('/', venueController.getAllVenues);

/**
 * @route   GET /venues/logistics
 * @desc    Get all logistics options from LOGe
 * @access  Public
 */
router.get('/logistics', venueController.getLogistics);

/**
 * @route   GET /venues/logistics/:category
 * @desc    Get logistics by category from LOGe
 * @access  Public
 */
router.get('/logistics/:category', venueController.getLogisticsByCategory);

/**
 * @route   GET /venues/:id
 * @desc    Get venue details by ID from LOGe
 * @access  Public
 */
router.get('/:id', venueController.getVenueById);

/**
 * @route   GET /venues/:id/availability
 * @desc    Check venue availability for a specific date
 * @access  Authenticated users
 */
router.get('/:id/availability', extractUser, venueController.checkVenueAvailability);

module.exports = router;
