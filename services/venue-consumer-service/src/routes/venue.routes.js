/**
 * Venue Routes
 * Defines all venue-related endpoints
 *
 * Endpoints:
 *   GET    /venues                              - Get all venues
 *   GET    /venues/:id                          - Get venue by ID
 *   GET    /venues/:venueId/rooms               - Get rooms by venue
 *
 *   POST   /venues/rooms/:roomId/check-availability  - Check room availability
 *   GET    /venues/rooms/:roomId/availability        - Get room availability by date
 *   GET    /venues/rooms/:roomId/reservations        - Get room reservations
 *
 *   POST   /venues/bookings                     - Create booking
 *   PUT    /venues/bookings/:id                 - Update booking
 *   DELETE /venues/bookings/:id                 - Cancel booking
 */

const express = require("express");
const router = express.Router();
const venueController = require("../controllers/venue.controller");
const { extractUser } = require("../middleware/auth.middleware");

// ==============================================
// Public Routes (Venue browsing)
// ==============================================

/**
 * @route   GET /venues
 * @desc    Get all available venues from LOGe
 * @access  Public
 */
router.get("/", venueController.getAllVenues);

/**
 * @route   GET /venues/:id
 * @desc    Get venue details by ID from LOGe
 * @access  Public
 */
router.get("/:id", venueController.getVenueById);

/**
 * @route   GET /venues/:venueId/rooms
 * @desc    Get all rooms in a venue
 * @access  Public
 */
router.get("/:venueId/rooms", venueController.getRoomsByVenue);

// ==============================================
// Availability Routes (Public)
// ==============================================

/**
 * @route   POST /venues/rooms/:roomId/check-availability
 * @desc    Check if a room is available for specific time
 * @body    { startTime, endTime }
 * @access  Public
 */
router.post("/rooms/:roomId/check-availability", venueController.checkRoomAvailability);

/**
 * @route   GET /venues/rooms/:roomId/availability
 * @desc    Get room availability for a specific date with time slots
 * @query   date (YYYY-MM-DD)
 * @access  Public
 */
router.get("/rooms/:roomId/availability", venueController.getRoomAvailabilityByDate);

/**
 * @route   GET /venues/rooms/:roomId/reservations
 * @desc    Get reservations for a room
 * @query   startDate, endDate (optional)
 * @access  Public (may be restricted in production)
 */
router.get("/rooms/:roomId/reservations", venueController.getReservationsByRoom);

// ==============================================
// Booking Routes (Authenticated)
// ==============================================

/**
 * @route   POST /venues/bookings
 * @desc    Create a venue booking
 * @body    { roomId, startTime, endTime, eventId (optional) }
 * @access  Authenticated users
 */
router.post("/bookings", extractUser, venueController.createBooking);

/**
 * @route   PUT /venues/bookings/:id
 * @desc    Update a booking
 * @body    { startTime, endTime, status }
 * @access  Authenticated users (owner or admin)
 */
router.put("/bookings/:id", extractUser, venueController.updateBooking);

/**
 * @route   DELETE /venues/bookings/:id
 * @desc    Cancel a booking
 * @access  Authenticated users (owner or admin)
 */
router.delete("/bookings/:id", extractUser, venueController.cancelBooking);

module.exports = router;
