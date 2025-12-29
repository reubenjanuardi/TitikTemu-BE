/**
 * Attendance Controller
 * Handles attendance-related HTTP requests
 */

const attendanceService = require('../services/attendance.service');
const { validationResult } = require('express-validator');

/**
 * Check in to an event
 * @route POST /attendance/check-in
 */
const checkIn = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { eventId, notes } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;
    const userEmail = req.user.email;

    const attendance = await attendanceService.checkIn({
      eventId,
      userId,
      userName,
      userEmail,
      notes
    });

    return res.status(201).json({
      success: true,
      message: 'Check-in successful',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance records for an event
 * @route GET /attendance/event/:id
 */
const getEventAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendance = await attendanceService.getEventAttendance(id);

    return res.status(200).json({
      success: true,
      message: 'Attendance records retrieved successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance history for a user
 * @route GET /attendance/user/:userId
 */
const getUserAttendance = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Allow users to see their own attendance, admins can see anyone's
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const attendance = await attendanceService.getUserAttendance(userId);

    return res.status(200).json({
      success: true,
      message: 'User attendance retrieved successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance statistics for an event
 * @route GET /attendance/stats/:eventId
 */
const getAttendanceStats = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const stats = await attendanceService.getAttendanceStats(eventId);

    return res.status(200).json({
      success: true,
      message: 'Attendance statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify if a user has checked in to an event
 * @route GET /attendance/verify/:eventId/:userId
 */
const verifyAttendance = async (req, res, next) => {
  try {
    const { eventId, userId } = req.params;
    const verified = await attendanceService.verifyAttendance(eventId, userId);

    return res.status(200).json({
      success: true,
      message: 'Attendance verification complete',
      data: verified
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  getEventAttendance,
  getUserAttendance,
  getAttendanceStats,
  verifyAttendance
};
