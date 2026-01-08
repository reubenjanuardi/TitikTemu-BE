/**
 * Event Service - Business Logic
 * Contains all event-related business logic
 */

const prisma = require("../config/database");
const venueHelper = require("../helpers/venue-booking.helper");

// Helper to get current time in WIB (UTC+07)
const nowWIB = () => new Date(Date.now() + 7 * 60 * 60 * 1000);

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Object} - Created event
 */
const createEvent = async (eventData) => {
  // 1. Validate input
  if (!eventData.title || !eventData.date) {
    throw new Error("Title and date are required");
  }

  // 2. If venue is selected, validate and book
  let venueBooking = null;
  if (eventData.venueId && eventData.roomId) {
    // Build user object from eventData.createdBy
    const user = {
      id: eventData.createdBy,
      email: eventData.userEmail || "admin@titiktemu.com",
      role: eventData.userRole || "ADMIN",
      name: eventData.userName || "Admin",
    };
    try {
      // 2.1 Validate venue and room exist
      const { venue, room } = await venueHelper.validateVenueAndRoom(eventData.venueId, eventData.roomId);
      // 2.2 Build start/end datetime
      const eventDate = new Date(eventData.date);
      const [startHour, startMinute] = (eventData.startTime || "09:00").split(":");
      const [endHour, endMinute] = (eventData.endTime || "12:00").split(":");
      const startDateTime = new Date(eventDate);
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
      const endDateTime = new Date(eventDate);
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
      // 2.3 Check availability
      await venueHelper.checkRoomAvailability(eventData.roomId, startDateTime.toISOString(), endDateTime.toISOString());
      // 2.4 Create booking
      venueBooking = await venueHelper.createVenueBooking(
        {
          roomId: eventData.roomId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          eventId: null, // Will be updated after event created
        },
        user
      );
      // 2.5 Update event data with venue info
      eventData.venueName = venue.name;
      eventData.roomName = room.name;
      eventData.venueBookingId = venueBooking.id;
      eventData.location = `${venue.name} - ${room.name}`;
      // Use room capacity if event capacity not specified
      if (!eventData.capacity) {
        eventData.capacity = Math.min(room.capacity, 500);
      }
    } catch (error) {
      // Venue validation or booking failed
      throw new Error(error.message || "Failed to book venue");
    }
  }
  // 3. Check for duplicate events (existing logic)
  const existing = await prisma.event.findFirst({
    where: {
      title: eventData.title,
      date: new Date(eventData.date),
    },
  });
  if (existing) {
    // Rollback booking if event already exists
    if (venueBooking) {
      try {
        await venueHelper.cancelVenueBooking(venueBooking.id, {
          id: eventData.createdBy,
          role: "ADMIN",
        });
      } catch (rollbackError) {
        console.error("Failed to rollback booking:", rollbackError);
      }
    }
    const error = new Error("Event with the same title and date already exists");
    error.statusCode = 409;
    throw error;
  }
  // 4. Create event in database
  try {
    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        date: new Date(eventData.date),
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.location,
        venueId: eventData.venueId,
        venueName: eventData.venueName,
        roomId: eventData.roomId,
        roomName: eventData.roomName,
        venueBookingId: eventData.venueBookingId,
        capacity: eventData.capacity || 100,
        status: eventData.status || "PUBLISHED",
        createdBy: eventData.createdBy,
      },
    });
    return event;
  } catch (error) {
    // Event creation failed, rollback booking
    if (venueBooking) {
      try {
        await venueHelper.cancelVenueBooking(venueBooking.id, {
          id: eventData.createdBy,
          role: "ADMIN",
        });
        console.log("Venue booking rolled back due to event creation failure");
      } catch (rollbackError) {
        console.error("Failed to rollback booking:", rollbackError);
      }
    }
    throw error;
  }
};

/**
 * Get all events with optional filters
 * @param {Object} options - Filter options
 * @returns {Object} - Events with pagination info
 */
const getAllEvents = async ({ status, upcoming, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  // Build where clause
  const where = {};

  if (status) {
    where.status = status;
  } else {
    // By default, only show published events to public
    where.status = "PUBLISHED";
  }

  if (upcoming) {
    // Compare using WIB so "upcoming" respects UTC+07 current time
    where.date = {
      gte: nowWIB(),
    };
  }

  // Get events with count
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      skip,
      take: limit,
      include: {
        _count: {
          select: { participants: true },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  // Transform to include participant count
  const transformedEvents = events.map((event) => ({
    ...event,
    participantCount: event._count.participants,
    _count: undefined,
  }));

  return {
    events: transformedEvents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get event by ID
 * @param {string} id - Event ID
 * @returns {Object|null} - Event or null
 */
const getEventById = async (id) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  });

  if (!event) return null;

  return {
    ...event,
    participantCount: event._count.participants,
    _count: undefined,
  };
};

/**
 * Update an event
 * @param {string} id - Event ID
 * @param {Object} eventData - Updated event data
 * @returns {Object} - Updated event
 */
const updateEvent = async (id, eventData) => {
  // Check if event exists
  const existing = await prisma.event.findUnique({ where: { id } });

  if (!existing) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (eventData.title) updateData.title = eventData.title;
  if (eventData.description !== undefined) updateData.description = eventData.description;
  if (eventData.date) updateData.date = new Date(eventData.date);
  if (eventData.startTime !== undefined) updateData.startTime = eventData.startTime;
  if (eventData.endTime !== undefined) updateData.endTime = eventData.endTime;
  if (eventData.location !== undefined) updateData.location = eventData.location;
  if (eventData.venueId !== undefined) updateData.venueId = eventData.venueId;
  if (eventData.venueName !== undefined) updateData.venueName = eventData.venueName;
  if (eventData.capacity) updateData.capacity = eventData.capacity;
  if (eventData.status) updateData.status = eventData.status;

  // If title/date are changing, ensure no duplicate logical event exists
  if (updateData.title || updateData.date) {
    const candidateTitle = updateData.title || existing.title;
    const candidateDate = updateData.date || existing.date;

    const dup = await prisma.event.findFirst({
      where: {
        id: { not: id },
        title: candidateTitle,
        date: candidateDate,
      },
      select: { id: true },
    });

    if (dup) {
      const error = new Error("Event with the same title and date already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  const event = await prisma.event.update({
    where: { id },
    data: updateData,
  });

  return event;
};

/**
 * Delete an event
 * @param {string} id - Event ID
 */
const deleteEvent = async (id) => {
  const existing = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      venueBookingId: true,
      createdBy: true,
    },
  });
  if (!existing) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }
  // Cancel venue booking if exists
  if (existing.venueBookingId) {
    try {
      await venueHelper.cancelVenueBooking(existing.venueBookingId, { id: existing.createdBy, role: "ADMIN" });
      console.log("Venue booking cancelled for event:", id);
    } catch (error) {
      console.error("Failed to cancel venue booking:", error.message);
      // Continue with event deletion even if booking cancellation fails
    }
  }
  await prisma.event.delete({ where: { id } });
};

/**
 * Register a user for an event
 * @param {string} eventId - Event ID
 * @param {Object} userData - User data
 * @returns {Object} - Registration record
 */
const registerForEvent = async (eventId, { userId, userName, userEmail }) => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  });

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if event is published
  if (event.status !== "PUBLISHED") {
    const error = new Error("Cannot register for this event");
    error.statusCode = 400;
    throw error;
  }

  // Check capacity
  if (event._count.participants >= event.capacity) {
    const error = new Error("Event is full");
    error.statusCode = 400;
    throw error;
  }

  // Check if already registered
  const existingRegistration = await prisma.eventParticipant.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
  });

  if (existingRegistration) {
    const error = new Error("Already registered for this event");
    error.statusCode = 409;
    throw error;
  }

  // Prevent registering to another event with the same title (duplicate logical event)
  const duplicateTitleRegistration = await prisma.eventParticipant.findFirst({
    where: {
      userId,
      event: {
        title: event.title,
      },
    },
    include: {
      event: {
        select: { id: true, title: true },
      },
    },
  });

  if (duplicateTitleRegistration) {
    const error = new Error("Already registered to an event with this title");
    error.statusCode = 409;
    throw error;
  }

  // Create registration (guard against race-condition duplicates)
  try {
    const registration = await prisma.eventParticipant.create({
      data: {
        eventId,
        userId,
        userName,
        userEmail,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
    });

    return registration;
  } catch (err) {
    // Prisma unique constraint violation (duplicate registration)
    if (err.code === "P2002") {
      const error = new Error("Already registered for this event");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

/**
 * Get participants for an event
 * @param {string} eventId - Event ID
 * @returns {Array} - List of participants
 */
const getEventParticipants = async (eventId) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  const participants = await prisma.eventParticipant.findMany({
    where: { eventId },
    orderBy: { registeredAt: "asc" },
  });

  return {
    eventId,
    eventTitle: event.title,
    participants,
    total: participants.length,
  };
};

/**
 * Check if user is registered for an event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @returns {boolean} - True if registered
 */
const isUserRegistered = async (eventId, userId) => {
  const registration = await prisma.eventParticipant.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
  });

  return !!registration;
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventParticipants,
  isUserRegistered,
};
