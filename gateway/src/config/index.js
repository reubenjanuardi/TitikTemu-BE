/**
 * API Gateway Configuration
 * Centralizes all configuration values
 */

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production'
  },
  
  services: {
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    eventServiceUrl: process.env.EVENT_SERVICE_URL || 'http://localhost:3002',
    attendanceServiceUrl: process.env.ATTENDANCE_SERVICE_URL || 'http://localhost:3003',
    venueServiceUrl: process.env.VENUE_SERVICE_URL || 'http://localhost:3004'
  },
  
  external: {
    logeGraphqlUrl: process.env.LOGE_GRAPHQL_URL || 'http://localhost:4000/graphql'
  }
};
