/**
 * API Gateway - Main Entry Point
 *
 * Purpose: Single entry point for all client requests
 * Responsibilities:
 *   - Route requests to correct microservice
 *   - JWT verification middleware
 *   - Error handling & logging
 *   - Health check endpoint
 *   - GraphQL Gateway layer
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const graphqlPlayground = require("graphql-playground-middleware-express").default;

const config = require("./config");
const { authMiddleware, optionalAuth } = require("./middleware/auth.middleware");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");
const proxyRoutes = require("./routes/proxy.routes");
const { typeDefs, resolvers } = require("./graphql");

const app = express();

// ==============================================
// Middleware Configuration
// ==============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ==============================================
// Health Check Endpoint
// ==============================================
app.get("/health", async (req, res) => {
  const axios = require("axios");

  // Check health of all microservices
  const services = [
    { name: "auth-service", url: config.services.authServiceUrl },
    { name: "event-service", url: config.services.eventServiceUrl },
    { name: "attendance-service", url: config.services.attendanceServiceUrl },
    { name: "venue-service", url: config.services.venueServiceUrl },
  ];

  const healthChecks = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await axios.get(`${service.url}/health`, { timeout: 2000 });
        return { name: service.name, status: "healthy", details: response.data };
      } catch (error) {
        return { name: service.name, status: "unhealthy", error: error.message };
      }
    })
  );

  const allHealthy = healthChecks.every((h) => h.status === "healthy");

  res.status(allHealthy ? 200 : 503).json({
    service: "api-gateway",
    status: allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    services: healthChecks,
  });
});

// ==============================================
// REST API Routes (Proxy to Microservices)
// ==============================================
app.use("/api", proxyRoutes);

// ==============================================
// Initialize GraphQL Server
// ==============================================
async function startServer() {
  // Create Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    includeStacktraceInErrorResponses: true,
    formatError: (error) => {
      console.error("GraphQL Error:", error);
      return {
        message: error.message,
        path: error.path,
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
        },
      };
    },
  });

  // Start Apollo Server
  await apolloServer.start();

  // GraphQL Playground for GET requests
  app.get("/graphql", graphqlPlayground({ endpoint: "/graphql" }));

  // Apply GraphQL middleware
  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        // Extract user from JWT if present
        const authHeader = req.headers.authorization;
        let user = null;

        if (authHeader) {
          // Support both "Bearer TOKEN" and "TOKEN" formats
          const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

          if (token) {
            try {
              const jwt = require("jsonwebtoken");
              const decoded = jwt.verify(token, config.jwt.secret);

              // Map JWT payload to user object
              user = {
                id: decoded.id || decoded.userId,
                email: decoded.email,
                role: decoded.role,
                name: decoded.name,
              };

              console.log("✅ Valid token, user:", user.email, "- Role:", user.role);
            } catch (error) {
              // Token invalid - user remains null
              console.log("❌ Invalid token in GraphQL context:", error.message);
            }
          }
        }

        return { user, req };
      },
    })
  );

  // ==============================================
  // 404 Handler (must be after all routes)
  // ==============================================
  app.use(notFoundHandler);

  // ==============================================
  // Global Error Handler
  // ==============================================
  app.use(errorHandler);

  // ==============================================
  // Start Server
  // ==============================================
  const PORT = config.server.port;
  app.listen(PORT, () => {
    console.log("=========================================");
    console.log("🚀 TitikTemu API Gateway Started");
    console.log("=========================================");
    console.log(`   REST API:  http://localhost:${PORT}/api`);
    console.log(`   GraphQL:   http://localhost:${PORT}/graphql`);
    console.log(`   Health:    http://localhost:${PORT}/health`);
    console.log("=========================================");
    console.log("Connected Microservices:");
    console.log(`   Auth:       ${config.services.authServiceUrl}`);
    console.log(`   Event:      ${config.services.eventServiceUrl}`);
    console.log(`   Attendance: ${config.services.attendanceServiceUrl}`);
    console.log(`   Venue:      ${config.services.venueServiceUrl}`);
    console.log("=========================================");
  });
}

// Start the server
startServer().catch(console.error);

module.exports = app;
