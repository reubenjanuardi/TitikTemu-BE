/**
 * GraphQL Resolvers
 *
 * Resolvers call the internal REST microservices
 * and return data in the GraphQL format
 */

const axios = require("axios");
const config = require("../config");
const { GraphQLError } = require("graphql");

// ==============================================
// Helper Functions
// ==============================================

/**
 * Create authenticated headers for service calls
 */
const createAuthHeaders = (user) => {
  if (!user) return {};
  return {
    "x-user-id": user.id,
    "x-user-email": user.email,
    "x-user-role": user.role,
    "x-user-name": user.name || "",
  };
};

/**
 * Check if user is authenticated
 */
const requireAuth = (context) => {
  if (!context.user) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.user;
};

/**
 * Check if user is admin
 */
const requireAdmin = (context) => {
  const user = requireAuth(context);
  if (user.role !== "ADMIN") {
    throw new GraphQLError("Admin access required", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return user;
};

/**
 * Handle service errors
 */
const handleServiceError = (error, serviceName) => {
  console.error(`${serviceName} error:`, error.message);

  if (error.response) {
    throw new GraphQLError(error.response.data?.message || `${serviceName} error`, {
      extensions: {
        code: error.response.status === 404 ? "NOT_FOUND" : "SERVICE_ERROR",
        statusCode: error.response.status,
      },
    });
  }

  throw new GraphQLError(`${serviceName} unavailable`, {
    extensions: { code: "SERVICE_UNAVAILABLE" },
  });
};

// ==============================================
// Resolvers
// ==============================================

const resolvers = {
  // ==============================================
  // Query Resolvers
  // ==============================================
  Query: {
    // User queries
    me: async (_, __, context) => {
      const user = requireAuth(context);

      try {
        const response = await axios.get(`${config.services.authServiceUrl}/auth/profile`, { headers: { Authorization: `Bearer ${context.req.headers.authorization?.split(" ")[1]}` } });
        return response.data.data;
      } catch (error) {
        handleServiceError(error, "Auth Service");
      }
    },

    // Event queries
    events: async (_, { status, upcoming, page, limit }) => {
      try {
        const params = {};
        if (status) params.status = status;
        if (upcoming !== undefined) params.upcoming = upcoming;
        if (page) params.page = page;
        if (limit) params.limit = limit;

        const response = await axios.get(`${config.services.eventServiceUrl}/events`, { params });
        return response.data.data;
      } catch (error) {
        handleServiceError(error, "Event Service");
      }
    },

    event: async (_, { id }) => {
      try {
        const response = await axios.get(`${config.services.eventServiceUrl}/events/${id}`);
        return response.data.data;
      } catch (error) {
        if (error.response?.status === 404) return null;
        handleServiceError(error, "Event Service");
      }
    },

    eventParticipants: async (_, { eventId }, context) => {
      requireAdmin(context);

      try {
        const response = await axios.get(`${config.services.eventServiceUrl}/events/${eventId}/participants`, { headers: createAuthHeaders(context.user) });
        return response.data.data.participants || [];
      } catch (error) {
        handleServiceError(error, "Event Service");
      }
    },

    // Venue queries (from LOGe via Venue Consumer Service)
    venues: async () => {
      try {
        const response = await axios.get(`${config.services.venueServiceUrl}/venues`);
        return response.data.data || [];
      } catch (error) {
        handleServiceError(error, "Venue Service");
      }
    },

    venue: async (_, { id }) => {
      try {
        const response = await axios.get(`${config.services.venueServiceUrl}/venues/${id}`);
        return response.data.data;
      } catch (error) {
        if (error.response?.status === 404) return null;
        handleServiceError(error, "Venue Service");
      }
    },

    rooms: async (_, { venueId }) => {
      try {
        const response = await axios.get(`${config.services.venueServiceUrl}/venues/${venueId}/rooms`);
        return response.data.data || [];
      } catch (error) {
        handleServiceError(error, "Venue Service");
      }
    },

    roomAvailability: async (_, { roomId, date }, context) => {
      requireAuth(context);

      try {
        const response = await axios.get(`${config.services.venueServiceUrl}/venues/rooms/${roomId}/availability`, {
          params: { date },
          headers: createAuthHeaders(context.user),
        });
        return response.data.data;
      } catch (error) {
        handleServiceError(error, "Venue Service");
      }
    },

    logistics: async () => {
      try {
        const response = await axios.get(`${config.services.venueServiceUrl}/venues/logistics`);
        return response.data.data || [];
      } catch (error) {
        handleServiceError(error, "Venue Service");
      }
    },

    logisticsByCategory: async (_, { category }) => {
      try {
        const response = await axios.get(`${config.services.venueServiceUrl}/venues/logistics/${category}`);
        return response.data.data || [];
      } catch (error) {
        handleServiceError(error, "Venue Service");
      }
    },

    // Attendance queries
    eventAttendance: async (_, { eventId }, context) => {
      requireAdmin(context);

      try {
        const response = await axios.get(`${config.services.attendanceServiceUrl}/attendance/event/${eventId}`, { headers: createAuthHeaders(context.user) });
        return response.data.data.records || [];
      } catch (error) {
        handleServiceError(error, "Attendance Service");
      }
    },

    attendanceStats: async (_, { eventId }, context) => {
      requireAdmin(context);

      try {
        const response = await axios.get(`${config.services.attendanceServiceUrl}/attendance/stats/${eventId}`, { headers: createAuthHeaders(context.user) });
        return response.data.data;
      } catch (error) {
        handleServiceError(error, "Attendance Service");
      }
    },
  },

  // ==============================================
  // Mutation Resolvers
  // ==============================================
  Mutation: {
    // Auth mutations
    register: async (_, { input }) => {
      try {
        const response = await axios.post(`${config.services.authServiceUrl}/auth/register`, input);
        return response.data.data;
      } catch (error) {
        handleServiceError(error, "Auth Service");
      }
    },

    login: async (_, { input }) => {
      try {
        const response = await axios.post(`${config.services.authServiceUrl}/auth/login`, input);
        return response.data.data;
      } catch (error) {
        handleServiceError(error, "Auth Service");
      }
    },

    // Event mutations
    createEvent: async (_, { input }, context) => {
      requireAdmin(context);

      try {
        const response = await axios.post(`${config.services.eventServiceUrl}/events`, input, { headers: createAuthHeaders(context.user) });
        return response.data.data;
      } catch (error) {
        handleServiceError(error, "Event Service");
      }
    },

    updateEvent: async (_, { id, input }, context) => {
      requireAdmin(context);

      try {
        const response = await axios.put(`${config.services.eventServiceUrl}/events/${id}`, input, { headers: createAuthHeaders(context.user) });
        return response.data.data;
      } catch (error) {
        handleServiceError(error, "Event Service");
      }
    },

    deleteEvent: async (_, { id }, context) => {
      requireAdmin(context);

      try {
        await axios.delete(`${config.services.eventServiceUrl}/events/${id}`, { headers: createAuthHeaders(context.user) });
        return true;
      } catch (error) {
        handleServiceError(error, "Event Service");
      }
    },

    registerForEvent: async (_, { eventId }, context) => {
      requireAuth(context);

      try {
        const response = await axios.post(`${config.services.eventServiceUrl}/events/${eventId}/register`, {}, { headers: createAuthHeaders(context.user) });
        return response.data.data;
      } catch (error) {
        handleServiceError(error, "Event Service");
      }
    },

    // Attendance mutations
    checkIn: async (_, { eventId, notes }, context) => {
      requireAuth(context);

      try {
        const response = await axios.post(`${config.services.attendanceServiceUrl}/attendance/check-in`, { eventId, notes }, { headers: createAuthHeaders(context.user) });
        return response.data.data;
      } catch (error) {
        handleServiceError(error, "Attendance Service");
      }
    },
  },
};

module.exports = resolvers;
