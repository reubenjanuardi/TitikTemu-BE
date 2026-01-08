/**
 * Event Service Configuration
 */

module.exports = {
  server: {
    port: process.env.PORT || 3002,
    nodeEnv: process.env.NODE_ENV || "development",
  },
  services: {
    authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  },
  // LOGe Incoming API Key (for LOGe to consume TitikTemu data)
  loge: {
    incomingApiKey: process.env.LOGE_INCOMING_API_KEY || null,
  },
};
