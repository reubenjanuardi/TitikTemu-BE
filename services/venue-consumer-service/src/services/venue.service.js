/**
 * Venue Service - Business Logic
 * Handles GraphQL communication with LOGe system
 *
 * Note: This service acts as a GraphQL client.
 * It does NOT store venue data locally.
 * All data comes from the external LOGe system.
 */

const { createLogeClient, queries, mutations } = require("../config/graphql-client");

// Create the GraphQL client
let logeClient = null;

const getClient = () => {
  if (!logeClient) {
    logeClient = createLogeClient();
  }
  return logeClient;
};

/**
 * Get all venues from LOGe
 * @returns {Array} - List of venues
 */
const getAllVenues = async () => {
  try {
    const client = getClient();
    const { data, errors } = await client.query({
      query: queries.GET_VENUES,
    });

    if (errors && errors.length > 0) {
      console.error("GraphQL errors:", errors);
      throw new Error("Failed to fetch venues from LOGe");
    }

    return data?.venues || [];
  } catch (error) {
    console.error("Failed to fetch venues from LOGe:", error.message);

    // Return mock data if LOGe is not available (for development)
    if (process.env.NODE_ENV === "development") {
      return getMockVenues();
    }

    throw error;
  }
};

/**
 * Get venue by ID from LOGe
 * @param {string} id - Venue ID
 * @returns {Object|null} - Venue or null
 */
const getVenueById = async (id) => {
  try {
    const client = getClient();
    const { data, errors } = await client.query({
      query: queries.GET_VENUE_BY_ID,
      variables: { id },
    });

    if (errors && errors.length > 0) {
      console.error("GraphQL errors:", errors);
      throw new Error("Failed to fetch venue from LOGe");
    }

    return data?.venue || null;
  } catch (error) {
    console.error("Failed to fetch venue from LOGe:", error.message);

    // Return mock data if LOGe is not available (for development)
    if (process.env.NODE_ENV === "development") {
      const mockVenues = getMockVenues();
      return mockVenues.find((v) => v.id === id) || null;
    }

    throw error;
  }
};

/**
 * Get rooms by venue ID
 * @param {string} venueId - Venue ID
 * @returns {Array} - List of rooms
 */
const getRoomsByVenue = async (venueId) => {
  try {
    const client = getClient();
    const { data, errors } = await client.query({
      query: queries.GET_ROOMS_BY_VENUE,
      variables: { venueId },
    });

    if (errors && errors.length > 0) {
      console.error("GraphQL errors:", errors);
      throw new Error("Failed to fetch rooms from LOGe");
    }

    return data?.rooms || [];
  } catch (error) {
    console.error("Failed to fetch rooms from LOGe:", error.message);

    // Return mock data if LOGe is not available (for development)
    if (process.env.NODE_ENV === "development") {
      return [
        { id: "room-1", venueId, name: "Mock Room A", capacity: 50, facilities: ["Projector", "AC"] },
        { id: "room-2", venueId, name: "Mock Room B", capacity: 30, facilities: ["AC"] },
      ];
    }

    throw error;
  }
};

/**
 * Check venue availability for a specific date
 * @param {string} venueId - Venue ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Object} - Availability information
 */
const checkVenueAvailability = async (venueId, date) => {
  try {
    const client = getClient();
    const { data, errors } = await client.query({
      query: queries.CHECK_VENUE_AVAILABILITY,
      variables: { venueId, date },
    });

    if (errors && errors.length > 0) {
      console.error("GraphQL errors:", errors);
      throw new Error("Failed to check venue availability");
    }

    return data?.venueAvailability || null;
  } catch (error) {
    console.error("Failed to check venue availability:", error.message);

    // Return mock data if LOGe is not available (for development)
    if (process.env.NODE_ENV === "development") {
      return getMockAvailability(venueId, date);
    }

    throw error;
  }
};

/**
 * Get all logistics options from LOGe
 * @returns {Array} - List of logistics options
 */
const getLogistics = async () => {
  try {
    const client = getClient();
    const { data, errors } = await client.query({
      query: queries.GET_LOGISTICS,
    });

    if (errors && errors.length > 0) {
      console.error("GraphQL errors:", errors);
      throw new Error("Failed to fetch logistics from LOGe");
    }

    return data?.logistics || [];
  } catch (error) {
    console.error("Failed to fetch logistics from LOGe:", error.message);

    // Return mock data if LOGe is not available (for development)
    if (process.env.NODE_ENV === "development") {
      return getMockLogistics();
    }

    throw error;
  }
};

/**
 * Get logistics by category from LOGe
 * @param {string} category - Category name
 * @returns {Array} - List of logistics for the category
 */
const getLogisticsByCategory = async (category) => {
  try {
    const client = getClient();
    const { data, errors } = await client.query({
      query: queries.GET_LOGISTICS_BY_CATEGORY,
      variables: { category },
    });

    if (errors && errors.length > 0) {
      console.error("GraphQL errors:", errors);
      throw new Error("Failed to fetch logistics from LOGe");
    }

    return data?.logisticsByCategory || [];
  } catch (error) {
    console.error("Failed to fetch logistics from LOGe:", error.message);

    // Return mock data if LOGe is not available (for development)
    if (process.env.NODE_ENV === "development") {
      const mockLogistics = getMockLogistics();
      return mockLogistics.filter((l) => l.category === category);
    }

    throw error;
  }
};

// ==============================================
// Mock Data for Development
// Used when LOGe system is not available
// ==============================================

const getMockVenues = () => [
  {
    id: "venue-1",
    name: "Aula Utama",
    description: "Aula besar untuk acara kampus",
    capacity: 500,
    location: "Gedung A Lantai 1",
    facilities: ["Sound System", "Projector", "AC", "WiFi"],
    available: true,
  },
  {
    id: "venue-2",
    name: "Ruang Seminar A",
    description: "Ruang seminar dengan kapasitas sedang",
    capacity: 100,
    location: "Gedung B Lantai 2",
    facilities: ["Projector", "AC", "WiFi", "Whiteboard"],
    available: true,
  },
  {
    id: "venue-3",
    name: "Lapangan Basket",
    description: "Lapangan outdoor untuk kegiatan olahraga",
    capacity: 200,
    location: "Area Olahraga",
    facilities: ["Lighting", "Seating Area"],
    available: true,
  },
  {
    id: "venue-4",
    name: "Ruang Rapat Eksekutif",
    description: "Ruang rapat VIP dengan fasilitas lengkap",
    capacity: 20,
    location: "Gedung Rektorat Lantai 5",
    facilities: ["Video Conference", "AC", "WiFi", "Catering Support"],
    available: false,
  },
];

const getMockAvailability = (venueId, date) => ({
  venueId,
  date,
  available: true,
  timeSlots: [
    { startTime: "08:00", endTime: "12:00", available: true },
    { startTime: "13:00", endTime: "17:00", available: true },
    { startTime: "18:00", endTime: "21:00", available: false },
  ],
});

const getMockLogistics = () => [
  {
    id: "log-1",
    name: "Kursi Lipat",
    description: "Kursi lipat untuk acara indoor/outdoor",
    category: "Furniture",
    quantity: 200,
    available: true,
  },
  {
    id: "log-2",
    name: "Meja Panjang",
    description: "Meja panjang 2m untuk registrasi",
    category: "Furniture",
    quantity: 50,
    available: true,
  },
  {
    id: "log-3",
    name: "Sound System Portable",
    description: "Sound system untuk acara outdoor",
    category: "Electronics",
    quantity: 5,
    available: true,
  },
  {
    id: "log-4",
    name: "Projector HD",
    description: "Projector resolusi tinggi",
    category: "Electronics",
    quantity: 10,
    available: true,
  },
  {
    id: "log-5",
    name: "Backdrop Banner",
    description: "Backdrop 3x2m dengan stand",
    category: "Decoration",
    quantity: 8,
    available: true,
  },
];

module.exports = {
  getAllVenues,
  getVenueById,
  getRoomsByVenue,
  checkVenueAvailability,
  getLogistics,
  getLogisticsByCategory,
  // Room availability/reservations
  checkRoomAvailability: async (roomId, startTime, endTime) => {
    try {
      const client = getClient();
      const { data, errors } = await client.query({
        query: queries.CHECK_ROOM_AVAILABILITY,
        variables: { roomId, startTime, endTime },
      });

      if (errors && errors.length > 0) {
        throw new Error("Failed to check room availability");
      }

      return data?.checkRoomAvailability || { available: false, message: "Unavailable" };
    } catch (error) {
      // In development, provide a permissive mock
      if (process.env.NODE_ENV === "development") {
        return { available: true, message: "Mocked availability", conflictingReservations: [] };
      }
      throw error;
    }
  },

  getRoomAvailabilityByDate: async (roomId, date) => {
    try {
      const client = getClient();
      const { data, errors } = await client.query({
        query: queries.GET_ROOM_AVAILABILITY_BY_DATE,
        variables: { roomId, date },
      });

      if (errors && errors.length > 0) {
        throw new Error("Failed to get room availability");
      }

      return data?.roomAvailabilityByDate || null;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        return {
          roomId,
          roomName: "Mock Room",
          date,
          available: true,
          timeSlots: [
            { startTime: "08:00", endTime: "10:00", available: true },
            { startTime: "10:00", endTime: "12:00", available: false },
          ],
        };
      }
      throw error;
    }
  },

  getReservationsByRoom: async (roomId, startDate, endDate) => {
    try {
      const client = getClient();
      const { data, errors } = await client.query({
        query: queries.GET_RESERVATIONS_BY_ROOM,
        variables: { roomId, startDate, endDate },
      });

      if (errors && errors.length > 0) {
        throw new Error("Failed to get reservations");
      }

      return data?.reservationsByRoom || [];
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        return [];
      }
      throw error;
    }
  },

  // Bookings
  createBooking: async (bookingData) => {
    try {
      const client = getClient();
      const { roomId, userId, startTime, endTime, status } = bookingData;
      const { data, errors } = await client.mutate({
        mutation: mutations.CREATE_RESERVATION,
        variables: { roomId, userId: parseInt(userId), startTime, endTime, status: status || "confirmed" },
      });

      if (errors && errors.length > 0) {
        const message = errors[0]?.message || "Failed to create reservation";
        throw new Error(message);
      }

      const reservation = data?.createReservation;
      if (!reservation) {
        throw new Error("Failed to create reservation");
      }
      return reservation;
    } catch (error) {
      // Surface availability conflicts as-is for controller to map to 409
      throw error;
    }
  },

  cancelBooking: async (id) => {
    try {
      const client = getClient();
      const { data, errors } = await client.mutate({
        mutation: mutations.CANCEL_RESERVATION,
        variables: { id },
      });

      if (errors && errors.length > 0) {
        const message = errors[0]?.message || "Failed to cancel reservation";
        throw new Error(message);
      }

      return data?.cancelReservation || null;
    } catch (error) {
      throw error;
    }
  },

  updateBooking: async (id, updates) => {
    try {
      const client = getClient();
      const { startTime, endTime, status } = updates;
      const { data, errors } = await client.mutate({
        mutation: mutations.UPDATE_RESERVATION,
        variables: { id, startTime, endTime, status },
      });

      if (errors && errors.length > 0) {
        const message = errors[0]?.message || "Failed to update reservation";
        throw new Error(message);
      }

      return data?.updateReservation || null;
    } catch (error) {
      throw error;
    }
  },
};
