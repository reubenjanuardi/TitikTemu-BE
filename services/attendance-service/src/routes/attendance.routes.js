/**
 * Attendance Routes
 * Defines all attendance-related endpoints
 * 
 * Endpoints:
 *   POST /attendance/check-in   - Check in to an event
 *   GET  /attendance/event/:id  - Get attendance for an event
 *   GET  /attendance/user/:id   - Get attendance history for a user
 *   GET  /attendance/stats/:id  - Get attendance statistics for an event
 */

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { validateCheckIn } = require('../middleware/validation.middleware');
const { extractUser, requireAdmin } = require('../middleware/auth.middleware');

// ==============================================
// Protected Routes
// ==============================================

/**
 * @route   POST /attendance/check-in
 * @desc    Check in to an event
 * @access  Authenticated users
 */
router.post('/check-in', extractUser, validateCheckIn, attendanceController.checkIn);

/**
 * @route   GET /attendance/event/:id
 * @desc    Get attendance records for an event
 * @access  Admin only
 */
router.get('/event/:id', extractUser, requireAdmin, attendanceController.getEventAttendance);

/**
 * @route   GET /attendance/user/:userId
 * @desc    Get attendance history for a user
 * @access  Admin or self
 */
router.get('/user/:userId', extractUser, attendanceController.getUserAttendance);

/**
 * @route   GET /attendance/stats/:eventId
 * @desc    Get attendance statistics for an event
 * @access  Admin only
 */
router.get('/stats/:eventId', extractUser, requireAdmin, attendanceController.getAttendanceStats);

/**
 * @route   GET /attendance/verify/:eventId/:userId
 * @desc    Verify if a user has checked in to an event
 * @access  Admin only
 */
router.get('/verify/:eventId/:userId', extractUser, requireAdmin, attendanceController.verifyAttendance);

module.exports = router;
