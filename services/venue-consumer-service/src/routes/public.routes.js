/**
 * Public Routes for LOGe Integration
 * 
 * These endpoints allow the external LOGe system to consume TitikTemu event data
 * Requires: X-LOGE-API-Key header for authentication
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config');

// ==============================================
// Middleware: Verify LOGe API Key
// ==============================================

const verifyLogeApiKey = (req, res, next) => {
  const apiKey = req.headers['x-loge-api-key'];
  
  // Check if LOGe API key is configured and matches
  if (config.loge.incomingApiKey && apiKey !== config.loge.incomingApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }
  
  next();
};

// Apply API key verification to all routes
router.use(verifyLogeApiKey);

// ==============================================
// GET /api/public/events
// Get all upcoming events for LOGe system
// ==============================================

router.get('/events', async (req, res, next) => {
  try {
    const { status = 'PUBLISHED', page = 1, limit = 50 } = req.query;
    
    console.log('📥 LOGe requesting events:', { status, page, limit });
    
    // Call Event Service
    const response = await axios.get(
      `${config.services.eventServiceUrl}/events`,
      {
        params: { 
          status, 
          upcoming: true, 
          page: parseInt(page), 
          limit: parseInt(limit) 
        }
      }
    );

    // Transform to LOGe-friendly format
    const events = response.data.data.events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      venueId: event.venueId,
      venueName: event.venueName,
      location: event.location,
      capacity: event.capacity,
      participantCount: event.participantCount || 0,
      status: event.status,
      organizerId: event.createdBy,
      createdAt: event.createdAt
    }));

    res.json({
      success: true,
      data: {
        events,
        pagination: response.data.data.pagination
      }
    });
  } catch (error) {
    console.error('❌ Error fetching events for LOGe:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Events not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

// ==============================================
// GET /api/public/events/:id
// Get single event details for LOGe
// ==============================================

router.get('/events/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log('📥 LOGe requesting event:', { id });
    
    // Call Event Service
    const response = await axios.get(
      `${config.services.eventServiceUrl}/events/${id}`
    );

    const event = response.data.data;

    res.json({
      success: true,
      data: {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        venueId: event.venueId,
        venueName: event.venueName,
        location: event.location,
        capacity: event.capacity,
        participantCount: event.participantCount || 0,
        status: event.status,
        organizerId: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error fetching event for LOGe:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    });
  }
});

// ==============================================
// GET /api/public/venue-bookings
// Get all venue bookings (events with venues)
// ==============================================

router.get('/venue-bookings', async (req, res, next) => {
  try {
    const { venueId, startDate, endDate } = req.query;
    
    console.log('📥 LOGe requesting venue bookings:', { venueId, startDate, endDate });
    
    const params = {
      status: 'PUBLISHED',
      upcoming: true,
      page: 1,
      limit: 100
    };

    // Call Event Service
    const response = await axios.get(
      `${config.services.eventServiceUrl}/events`,
      { params }
    );

    let bookings = response.data.data.events
      .filter(event => event.venueId) // Only events with venue
      .map(event => ({
        eventId: event.id,
        eventTitle: event.title,
        venueId: event.venueId,
        venueName: event.venueName,
        startDate: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        participantCount: event.participantCount || 0,
        capacity: event.capacity,
        status: event.status
      }));

    // Filter by venueId if provided
    if (venueId) {
      bookings = bookings.filter(b => b.venueId === venueId);
    }

    // Filter by date range if provided
    if (startDate) {
      bookings = bookings.filter(b => new Date(b.startDate) >= new Date(startDate));
    }
    if (endDate) {
      bookings = bookings.filter(b => new Date(b.startDate) <= new Date(endDate));
    }

    res.json({
      success: true,
      data: {
        bookings,
        total: bookings.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching venue bookings for LOGe:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch venue bookings'
    });
  }
});

// ==============================================
// GET /api/public/attendance/:eventId
// Get attendance data for an event
// ==============================================

router.get('/attendance/:eventId', async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    console.log('📥 LOGe requesting attendance for event:', { eventId });
    
    // Call Attendance Service
    const [attendanceResponse, statsResponse] = await Promise.all([
      axios.get(`${config.services.attendanceServiceUrl}/attendance/event/${eventId}`),
      axios.get(`${config.services.attendanceServiceUrl}/attendance/stats/${eventId}`)
    ]);

    res.json({
      success: true,
      data: {
        eventId,
        attendees: attendanceResponse.data.data?.records || [],
        statistics: statsResponse.data.data
      }
    });
  } catch (error) {
    console.error('❌ Error fetching attendance for LOGe:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance data'
    });
  }
});

// ==============================================
// POST /api/public/webhook/venue-status
// Webhook: LOGe notifies TitikTemu about venue status changes
// ==============================================

router.post('/webhook/venue-status', async (req, res, next) => {
  try {
    const { venueId, available, reason, timestamp } = req.body;
    
    console.log('📢 Venue status update from LOGe:', {
      venueId,
      available,
      reason,
      timestamp
    });

    // Validate request
    if (!venueId) {
      return res.status(400).json({
        success: false,
        error: 'venueId is required'
      });
    }

    if (available === undefined) {
      return res.status(400).json({
        success: false,
        error: 'available status is required'
      });
    }

    // TODO: Store venue status update in cache/database
    // TODO: Notify affected events about venue availability change
    // For now, just log and acknowledge
    
    res.json({
      success: true,
      message: 'Venue status update received',
      data: {
        venueId,
        available,
        receivedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error processing venue status webhook:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

// ==============================================
// POST /api/public/webhook/event-created
// Webhook: Notify LOGe when new event is created
// (LOGe can subscribe to this)
// ==============================================

router.post('/webhook/event-created', async (req, res, next) => {
  try {
    const { eventId, title, venueId, startDate } = req.body;
    
    console.log('📢 Event created notification from TitikTemu:', {
      eventId,
      title,
      venueId,
      startDate
    });

    // Validate
    if (!eventId || !title) {
      return res.status(400).json({
        success: false,
        error: 'eventId and title are required'
      });
    }

    // TODO: Store event notification
    // TODO: Trigger LOGe workflows if venue is booked
    
    res.json({
      success: true,
      message: 'Event notification received',
      data: {
        eventId,
        processedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error processing event notification:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process notification'
    });
  }
});

module.exports = router;
