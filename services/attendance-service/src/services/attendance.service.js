/**
 * Attendance Service - Business Logic
 * Contains all attendance-related business logic
 */

const prisma = require('../config/database');

// Helper to get current time in WIB (UTC+07)
const nowWIB = () => new Date(Date.now() + 7 * 60 * 60 * 1000);
const axios = require('axios');
const config = require('../config');

/**
 * Check in a user to an event
 * @param {Object} data - Check-in data
 * @returns {Object} - Attendance record
 */
const checkIn = async ({ eventId, userId, userName, userEmail, notes }) => {
  // Verify user is registered for the event (via Event Service)
  try {
    // Note: In production, this would call Event Service to verify registration
    // For now, we'll proceed with the check-in
    // The API Gateway should ensure the user is authenticated
  } catch (error) {
    console.error('Failed to verify registration:', error.message);
    // Continue with check-in - registration validation is optional
  }

  // Check if already checked in
  const existingAttendance = await prisma.attendanceRecord.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId
      }
    }
  });

  if (existingAttendance) {
    const error = new Error('Already checked in to this event');
    error.statusCode = 409;
    throw error;
  }

  // Create attendance record
  const attendance = await prisma.attendanceRecord.create({
    data: {
      eventId,
      userId,
      userName,
      userEmail,
      notes,
      status: 'CHECKED_IN',
      // Save check-in time using WIB (UTC+07)
      checkInTime: nowWIB()
    }
  });

  return attendance;
};

/**
 * Get attendance records for an event
 * @param {string} eventId - Event ID
 * @returns {Object} - Attendance records with summary
 */
const getEventAttendance = async (eventId) => {
  const records = await prisma.attendanceRecord.findMany({
    where: { eventId },
    orderBy: { checkInTime: 'asc' }
  });

  // Group by status
  const statusCounts = {
    CHECKED_IN: 0,
    LATE: 0,
    EXCUSED: 0
  };

  records.forEach(record => {
    statusCounts[record.status]++;
  });

  return {
    eventId,
    records,
    summary: {
      total: records.length,
      ...statusCounts
    }
  };
};

/**
 * Get attendance history for a user
 * @param {string} userId - User ID
 * @returns {Array} - Attendance records
 */
const getUserAttendance = async (userId) => {
  const records = await prisma.attendanceRecord.findMany({
    where: { userId },
    orderBy: { checkInTime: 'desc' }
  });

  return {
    userId,
    records,
    totalEvents: records.length
  };
};

/**
 * Get attendance statistics for an event
 * @param {string} eventId - Event ID
 * @returns {Object} - Attendance statistics
 */
const getAttendanceStats = async (eventId) => {
  const records = await prisma.attendanceRecord.findMany({
    where: { eventId }
  });

  // Calculate statistics
  const stats = {
    eventId,
    totalCheckedIn: records.length,
    byStatus: {
      CHECKED_IN: records.filter(r => r.status === 'CHECKED_IN').length,
      LATE: records.filter(r => r.status === 'LATE').length,
      EXCUSED: records.filter(r => r.status === 'EXCUSED').length
    },
    firstCheckIn: records.length > 0 
      ? records.reduce((min, r) => r.checkInTime < min ? r.checkInTime : min, records[0].checkInTime)
      : null,
    lastCheckIn: records.length > 0
      ? records.reduce((max, r) => r.checkInTime > max ? r.checkInTime : max, records[0].checkInTime)
      : null
  };

  return stats;
};

/**
 * Verify if a user has checked in to an event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @returns {Object} - Verification result
 */
const verifyAttendance = async (eventId, userId) => {
  const record = await prisma.attendanceRecord.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId
      }
    }
  });

  return {
    eventId,
    userId,
    hasCheckedIn: !!record,
    checkInTime: record?.checkInTime || null,
    status: record?.status || null
  };
};

module.exports = {
  checkIn,
  getEventAttendance,
  getUserAttendance,
  getAttendanceStats,
  verifyAttendance
};
