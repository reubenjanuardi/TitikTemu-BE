/**
 * Public API Routes for LOGe Integration
 *
 * These endpoints allow the external LOGe system to fetch event data
 * Authentication: Requires X-LOGE-API-Key header
 *
 * Endpoints:
 *   GET /api/public/events        - Get all events
 *   GET /api/public/events/:id    - Get event by ID
 */

const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const { verifyLogeApiKey } = require("../middleware/auth.middleware");

// ==============================================
// Middleware: Verify LOGe API Key
// ==============================================

// Apply API key verification to all public routes
router.use(verifyLogeApiKey);

// ==============================================
// Public Routes for LOGe
// ==============================================

/**
 * @route   GET /api/public/events
 * @desc    Get all events (for LOGe system)
 * @access  Public (requires API key)
 */
router.get("/events", async (req, res, next) => {
  try {
    console.log("📥 LOGe requesting events:", req.query);

    // Use the existing controller with query params
    await eventController.getAllEvents(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/public/events/:id
 * @desc    Get event by ID (for LOGe system)
 * @access  Public (requires API key)
 */
router.get("/events/:id", async (req, res, next) => {
  try {
    console.log("📥 LOGe requesting event:", req.params.id);

    // Use the existing controller
    await eventController.getEventById(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/public/venue-bookings
 * @desc    Get all events with venue bookings (for LOGe system)
 * @access  Public (requires API key)
 */
router.get("/venue-bookings", async (req, res, next) => {
  try {
    const { venueId, startDate, endDate, page = 1, limit = 50 } = req.query;

    console.log("📥 LOGe requesting venue bookings:", { venueId, startDate, endDate });

    const eventService = require("../services/event.service");
    const prisma = require("../config/database");

    // Build filter
    const where = {
      venueId: { not: null },
      venueBookingId: { not: null },
    };

    if (venueId) {
      where.venueId = venueId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Get events with venue bookings
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { date: "asc" },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.event.count({ where }),
    ]);

    // Format response
    const bookings = events.map((event) => ({
      eventId: event.id,
      eventTitle: event.title,
      venueId: event.venueId,
      venueName: event.venueName,
      roomId: event.roomId,
      roomName: event.roomName,
      venueBookingId: event.venueBookingId,
      startDate: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      participantCount: event.participantCount || 0,
      capacity: event.capacity,
      status: event.status,
    }));

    res.json({
      success: true,
      data: {
        bookings,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
