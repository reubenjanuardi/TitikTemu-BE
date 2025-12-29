/**
 * Attendance Service - Main Entry Point
 * 
 * Purpose: Event attendance tracking for TitikTemu
 * Responsibilities:
 *   - Record participant attendance (check-in)
 *   - Validate registered users
 *   - Attendance reporting
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const attendanceRoutes = require('./routes/attendance.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 3003;

// ==============================================
// Middleware Configuration
// ==============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ==============================================
// Health Check Endpoint
// ==============================================
app.get('/health', (req, res) => {
  res.json({
    service: 'attendance-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ==============================================
// Routes
// ==============================================
app.use('/attendance', attendanceRoutes);

// ==============================================
// 404 Handler
// ==============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// ==============================================
// Global Error Handler
// ==============================================
app.use(errorHandler);

// ==============================================
// Start Server
// ==============================================
app.listen(PORT, () => {
  console.log(`✅ Attendance Service running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
