/**
 * Event Service - Main Entry Point
 * 
 * Purpose: Core event management service for TitikTemu
 * Responsibilities:
 *   - Create events (admin only)
 *   - List upcoming events
 *   - Register participants to events
 *   - Store venue references (external ID from LOGe)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const eventRoutes = require('./routes/event.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 3002;

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
    service: 'event-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ==============================================
// Routes
// ==============================================

// Public API routes for LOGe integration
const publicRoutes = require('./routes/public.routes');
app.use('/api/public', publicRoutes);

// Internal routes (requires JWT via Gateway)
app.use('/events', eventRoutes);

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
  console.log(`📅 Event Service running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
