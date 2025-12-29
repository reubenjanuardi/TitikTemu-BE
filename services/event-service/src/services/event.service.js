/**
 * Event Service - Business Logic
 * Contains all event-related business logic
 */

const prisma = require('../config/database');

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Object} - Created event
 */
const createEvent = async (eventData) => {
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
      capacity: eventData.capacity || 100,
      status: eventData.status || 'PUBLISHED',
      createdBy: eventData.createdBy
    }
  });

  return event;
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
    where.status = 'PUBLISHED';
  }
  
  if (upcoming) {
    where.date = {
      gte: new Date()
    };
  }

  // Get events with count
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { participants: true }
        }
      }
    }),
    prisma.event.count({ where })
  ]);

  // Transform to include participant count
  const transformedEvents = events.map(event => ({
    ...event,
    participantCount: event._count.participants,
    _count: undefined
  }));

  return {
    events: transformedEvents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
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
        select: { participants: true }
      }
    }
  });

  if (!event) return null;

  return {
    ...event,
    participantCount: event._count.participants,
    _count: undefined
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
    const error = new Error('Event not found');
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

  const event = await prisma.event.update({
    where: { id },
    data: updateData
  });

  return event;
};

/**
 * Delete an event
 * @param {string} id - Event ID
 */
const deleteEvent = async (id) => {
  const existing = await prisma.event.findUnique({ where: { id } });
  
  if (!existing) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
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
        select: { participants: true }
      }
    }
  });

  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if event is published
  if (event.status !== 'PUBLISHED') {
    const error = new Error('Cannot register for this event');
    error.statusCode = 400;
    throw error;
  }

  // Check capacity
  if (event._count.participants >= event.capacity) {
    const error = new Error('Event is full');
    error.statusCode = 400;
    throw error;
  }

  // Check if already registered
  const existingRegistration = await prisma.eventParticipant.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId
      }
    }
  });

  if (existingRegistration) {
    const error = new Error('Already registered for this event');
    error.statusCode = 409;
    throw error;
  }

  // Create registration
  const registration = await prisma.eventParticipant.create({
    data: {
      eventId,
      userId,
      userName,
      userEmail
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          date: true
        }
      }
    }
  });

  return registration;
};

/**
 * Get participants for an event
 * @param {string} eventId - Event ID
 * @returns {Array} - List of participants
 */
const getEventParticipants = async (eventId) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  const participants = await prisma.eventParticipant.findMany({
    where: { eventId },
    orderBy: { registeredAt: 'asc' }
  });

  return {
    eventId,
    eventTitle: event.title,
    participants,
    total: participants.length
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
        userId
      }
    }
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
  isUserRegistered
};
