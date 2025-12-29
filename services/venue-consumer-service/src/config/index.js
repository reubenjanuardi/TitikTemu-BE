/**
 * Venue Consumer Service Configuration
 */

module.exports = {
  server: {
    port: process.env.PORT || 3004,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  loge: {
    graphqlUrl: process.env.LOGE_GRAPHQL_URL || 'http://localhost:4000/graphql',
    apiKey: process.env.LOGE_API_KEY || null
  }
};
