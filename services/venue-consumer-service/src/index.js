/**
 * Venue Consumer Service - Main Entry Point
 * 
 * Purpose: Integration with LOGe system (external group)
 * Responsibilities:
 *   - Consume venue & logistics data from LOGe via GraphQL
 *   - Validate venue availability
 *   - Forward selected venue information to Event Service
 * 
 * Note: This service does NOT store master venue data.
 * It acts as a GraphQL client to the LOGe external system.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const venueRoutes = require('./routes/venue.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 3004;

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
    service: 'venue-consumer-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    logeEndpoint: process.env.LOGE_GRAPHQL_URL || 'not configured'
  });
});

// ==============================================
// Routes
// ==============================================
app.use('/venues', venueRoutes);

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
  console.log(`🏢 Venue Consumer Service running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   LOGe GraphQL: ${process.env.LOGE_GRAPHQL_URL || 'not configured'}`);
});

module.exports = app;
