/**
 * Venue Controller
 * Handles venue-related HTTP requests
 * Proxies to LOGe GraphQL API
 */

const venueService = require("../services/venue.service");

// ==============================================
// Venue Endpoints
// ==============================================

/**
 * Get all venues from LOGe
 * @route GET /venues
 */
const getAllVenues = async (req, res, next) => {
  try {
    const venues = await venueService.getAllVenues();

    return res.status(200).json({
      success: true,
      message: "Venues retrieved successfully",
      data: venues,
      source: "LOGe",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get venue by ID from LOGe
 * @route GET /venues/:id
 */
const getVenueById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const venue = await venueService.getVenueById(id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Venue retrieved successfully",
      data: venue,
      source: "LOGe",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get rooms by venue ID
 * @route GET /venues/:venueId/rooms
 */
const getRoomsByVenue = async (req, res, next) => {
  try {
    const { venueId } = req.params;
    const rooms = await venueService.getRoomsByVenue(venueId);

    return res.status(200).json({
      success: true,
      message: "Rooms retrieved successfully",
      data: rooms,
      source: "LOGe",
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================
// Availability Endpoints
// ==============================================

/**
 * Check room availability for a specific time
 * @route POST /venues/rooms/:roomId/check-availability
 * @body { startTime, endTime }
 */
const checkRoomAvailability = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "startTime and endTime are required",
      });
    }

    const availability = await venueService.checkRoomAvailability(roomId, startTime, endTime);

    return res.status(200).json({
      success: true,
      message: "Availability checked successfully",
      data: availability,
      source: "LOGe",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get room availability for a specific date with time slots
 * @route GET /venues/rooms/:roomId/availability
 * @query { date }
 */
const getRoomAvailabilityByDate = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date query parameter is required (format: YYYY-MM-DD)",
      });
    }

    const availability = await venueService.getRoomAvailabilityByDate(roomId, date);

    return res.status(200).json({
      success: true,
      message: "Availability retrieved successfully",
      data: availability,
      source: "LOGe",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reservations for a room
 * @route GET /venues/rooms/:roomId/reservations
 * @query { startDate, endDate }
 */
const getReservationsByRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { startDate, endDate } = req.query;

    const reservations = await venueService.getReservationsByRoom(roomId, startDate, endDate);

    return res.status(200).json({
      success: true,
      message: "Reservations retrieved successfully",
      data: reservations,
      source: "LOGe",
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================
// Booking Endpoints
// ==============================================

/**
 * Create a venue booking
 * @route POST /venues/bookings
 * @body { roomId, startTime, endTime, eventId (optional) }
 */
const createBooking = async (req, res, next) => {
  try {
    const { roomId, startTime, endTime, eventId } = req.body;

    // Get user from headers (set by gateway)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!roomId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "roomId, startTime, and endTime are required",
      });
    }

    // Validate datetime format
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid datetime format. Use ISO 8601 format.",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "endTime must be after startTime",
      });
    }

    const bookingData = {
      roomId,
      userId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: "confirmed",
    };

    const reservation = await venueService.createBooking(bookingData);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        ...reservation,
        eventId, // Include eventId if provided for reference
      },
      source: "LOGe",
    });
  } catch (error) {
    // Handle specific booking errors
    if (error.message.includes("not available") || error.message.includes("conflict")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Cancel a booking
 * @route DELETE /venues/bookings/:id
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const reservation = await venueService.cancelBooking(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check authorization (user owns booking or is admin)
    if (reservation.userId !== parseInt(userId) && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: reservation,
      source: "LOGe",
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Update a booking
 * @route PUT /venues/bookings/:id
 * @body { startTime, endTime, status }
 */
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Validate datetime if provided
    if (updates.startTime) {
      const start = new Date(updates.startTime);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startTime format",
        });
      }
      updates.startTime = start.toISOString();
    }

    if (updates.endTime) {
      const end = new Date(updates.endTime);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid endTime format",
        });
      }
      updates.endTime = end.toISOString();
    }

    const reservation = await venueService.updateBooking(id, updates);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check authorization
    if (reservation.userId !== parseInt(userId) && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: reservation,
      source: "LOGe",
    });
  } catch (error) {
    if (error.message.includes("not available") || error.message.includes("conflict")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  // Venue endpoints
  getAllVenues,
  getVenueById,
  getRoomsByVenue,

  // Availability endpoints
  checkRoomAvailability,
  getRoomAvailabilityByDate,
  getReservationsByRoom,

  // Booking endpoints
  createBooking,
  cancelBooking,
  updateBooking,
};
