/**
 * Auth Service - Main Entry Point
 * 
 * Purpose: Authentication & Authorization service for TitikTemu
 * Responsibilities:
 *   - User registration
 *   - User login
 *   - JWT token issuance
 *   - Token validation
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 3001;

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
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ==============================================
// Routes
// ==============================================
app.use('/auth', authRoutes);

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
  console.log(`🔐 Auth Service running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
