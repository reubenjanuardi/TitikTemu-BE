/**
 * Venue Service - Business Logic
 * Handles GraphQL communication with LOGe system
 * 
 * Note: This service acts as a GraphQL client.
 * It does NOT store venue data locally.
 * All data comes from the external LOGe system.
 */

const { createLogeClient, queries } = require('../config/graphql-client');

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
      query: queries.GET_VENUES
    });

    if (errors && errors.length > 0) {
      console.error('GraphQL errors:', errors);
      throw new Error('Failed to fetch venues from LOGe');
    }

    return data?.venues || [];
  } catch (error) {
    console.error('Failed to fetch venues from LOGe:', error.message);
    
    // Return mock data if LOGe is not available (for development)
    if (process.env.NODE_ENV === 'development') {
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
      variables: { id }
    });

    if (errors && errors.length > 0) {
      console.error('GraphQL errors:', errors);
      throw new Error('Failed to fetch venue from LOGe');
    }

    return data?.venue || null;
  } catch (error) {
    console.error('Failed to fetch venue from LOGe:', error.message);
    
    // Return mock data if LOGe is not available (for development)
    if (process.env.NODE_ENV === 'development') {
      const mockVenues = getMockVenues();
      return mockVenues.find(v => v.id === id) || null;
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
      variables: { venueId, date }
    });

    if (errors && errors.length > 0) {
      console.error('GraphQL errors:', errors);
      throw new Error('Failed to check venue availability');
    }

    return data?.venueAvailability || null;
  } catch (error) {
    console.error('Failed to check venue availability:', error.message);
    
    // Return mock data if LOGe is not available (for development)
    if (process.env.NODE_ENV === 'development') {
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
      query: queries.GET_LOGISTICS
    });

    if (errors && errors.length > 0) {
      console.error('GraphQL errors:', errors);
      throw new Error('Failed to fetch logistics from LOGe');
    }

    return data?.logistics || [];
  } catch (error) {
    console.error('Failed to fetch logistics from LOGe:', error.message);
    
    // Return mock data if LOGe is not available (for development)
    if (process.env.NODE_ENV === 'development') {
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
      variables: { category }
    });

    if (errors && errors.length > 0) {
      console.error('GraphQL errors:', errors);
      throw new Error('Failed to fetch logistics from LOGe');
    }

    return data?.logisticsByCategory || [];
  } catch (error) {
    console.error('Failed to fetch logistics from LOGe:', error.message);
    
    // Return mock data if LOGe is not available (for development)
    if (process.env.NODE_ENV === 'development') {
      const mockLogistics = getMockLogistics();
      return mockLogistics.filter(l => l.category === category);
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
    id: 'venue-1',
    name: 'Aula Utama',
    description: 'Aula besar untuk acara kampus',
    capacity: 500,
    location: 'Gedung A Lantai 1',
    facilities: ['Sound System', 'Projector', 'AC', 'WiFi'],
    available: true
  },
  {
    id: 'venue-2',
    name: 'Ruang Seminar A',
    description: 'Ruang seminar dengan kapasitas sedang',
    capacity: 100,
    location: 'Gedung B Lantai 2',
    facilities: ['Projector', 'AC', 'WiFi', 'Whiteboard'],
    available: true
  },
  {
    id: 'venue-3',
    name: 'Lapangan Basket',
    description: 'Lapangan outdoor untuk kegiatan olahraga',
    capacity: 200,
    location: 'Area Olahraga',
    facilities: ['Lighting', 'Seating Area'],
    available: true
  },
  {
    id: 'venue-4',
    name: 'Ruang Rapat Eksekutif',
    description: 'Ruang rapat VIP dengan fasilitas lengkap',
    capacity: 20,
    location: 'Gedung Rektorat Lantai 5',
    facilities: ['Video Conference', 'AC', 'WiFi', 'Catering Support'],
    available: false
  }
];

const getMockAvailability = (venueId, date) => ({
  venueId,
  date,
  available: true,
  timeSlots: [
    { startTime: '08:00', endTime: '12:00', available: true },
    { startTime: '13:00', endTime: '17:00', available: true },
    { startTime: '18:00', endTime: '21:00', available: false }
  ]
});

const getMockLogistics = () => [
  {
    id: 'log-1',
    name: 'Kursi Lipat',
    description: 'Kursi lipat untuk acara indoor/outdoor',
    category: 'Furniture',
    quantity: 200,
    available: true
  },
  {
    id: 'log-2',
    name: 'Meja Panjang',
    description: 'Meja panjang 2m untuk registrasi',
    category: 'Furniture',
    quantity: 50,
    available: true
  },
  {
    id: 'log-3',
    name: 'Sound System Portable',
    description: 'Sound system untuk acara outdoor',
    category: 'Electronics',
    quantity: 5,
    available: true
  },
  {
    id: 'log-4',
    name: 'Projector HD',
    description: 'Projector resolusi tinggi',
    category: 'Electronics',
    quantity: 10,
    available: true
  },
  {
    id: 'log-5',
    name: 'Backdrop Banner',
    description: 'Backdrop 3x2m dengan stand',
    category: 'Decoration',
    quantity: 8,
    available: true
  }
];

module.exports = {
  getAllVenues,
  getVenueById,
  checkVenueAvailability,
  getLogistics,
  getLogisticsByCategory
};
