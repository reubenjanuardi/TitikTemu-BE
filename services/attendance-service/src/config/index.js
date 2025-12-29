/**
 * Attendance Service Configuration
 */

module.exports = {
  server: {
    port: process.env.PORT || 3003,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  services: {
    eventServiceUrl: process.env.EVENT_SERVICE_URL || 'http://localhost:3002'
  }
};
