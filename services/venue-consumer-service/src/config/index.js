/**
 * Venue Consumer Service Configuration
 */

module.exports = {
  server: {
    port: process.env.PORT || 3004,
    nodeEnv: process.env.NODE_ENV || "development",
  },
  loge: {
    graphqlUrl: process.env.LOGE_GRAPHQL_URL || "http://localhost:4002/graphql",
    apiKey: process.env.LOGE_API_KEY || null,
    timeout: process.env.LOGE_TIMEOUT || 5000,
  },

  // LOGe Incoming (LOGe consumes TitikTemu)
  logeIncoming: {
    apiKey: process.env.LOGE_INCOMING_API_KEY || null,
  },

  // Internal Services
  services: {
    eventServiceUrl: process.env.EVENT_SERVICE_URL || "http://localhost:3002",
    attendanceServiceUrl: process.env.ATTENDANCE_SERVICE_URL || "http://localhost:3003",
  },
};
