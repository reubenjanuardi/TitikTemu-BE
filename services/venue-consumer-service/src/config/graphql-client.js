/**
 * GraphQL Client for LOGe System
 * Handles all GraphQL communication with the external LOGe venue system
 */

const { ApolloClient, InMemoryCache, gql, HttpLink } = require("@apollo/client/core");
const fetch = require("cross-fetch");
const config = require("./index");

// Create Apollo Client instance for LOGe GraphQL API
const createLogeClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: config.loge.graphqlUrl,
      fetch,
      headers: config.loge.apiKey
        ? {
            Authorization: `Bearer ${config.loge.apiKey}`,
          }
        : {},
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });
};

// ==============================================
// GraphQL Queries for LOGe System
// ==============================================

/**
 * Query to fetch all available venues
 */
const GET_VENUES = gql`
  query GetVenues {
    venues {
      id
      name
      description
      address
      imageUrl
      rooms {
        id
        name
        capacity
        facilities
      }
    }
  }
`;

/**
 * Query to fetch a single venue by ID
 */
const GET_VENUE_BY_ID = gql`
  query GetVenueById($id: ID!) {
    venue(id: $id) {
      id
      name
      description
      address
      imageUrl
      rooms {
        id
        name
        capacity
        facilities
      }
    }
  }
`;

/**
 * Query to fetch rooms by venue
 */
const GET_ROOMS_BY_VENUE = gql`
  query GetRoomsByVenue($venueId: ID!) {
    rooms(venueId: $venueId) {
      id
      venueId
      name
      capacity
      facilities
      venue {
        id
        name
      }
    }
  }
`;

/**
 * Query to check room availability
 */
const CHECK_ROOM_AVAILABILITY = gql`
  query CheckRoomAvailability($roomId: ID!, $startTime: String!, $endTime: String!) {
    checkRoomAvailability(roomId: $roomId, startTime: $startTime, endTime: $endTime) {
      available
      message
      conflictingReservations {
        id
        roomId
        startTime
        endTime
        status
      }
    }
  }
`;

/**
 * Query to get room availability by date with time slots
 */
const GET_ROOM_AVAILABILITY_BY_DATE = gql`
  query GetRoomAvailabilityByDate($roomId: ID!, $date: String!) {
    roomAvailabilityByDate(roomId: $roomId, date: $date) {
      roomId
      roomName
      date
      available
      timeSlots {
        startTime
        endTime
        available
      }
    }
  }
`;

/**
 * Query to get reservations by room
 */
const GET_RESERVATIONS_BY_ROOM = gql`
  query GetReservationsByRoom($roomId: ID!, $startDate: String, $endDate: String) {
    reservationsByRoom(roomId: $roomId, startDate: $startDate, endDate: $endDate) {
      id
      roomId
      userId
      startTime
      endTime
      status
      room {
        id
        name
        capacity
      }
    }
  }
`;

// ==============================================
// GraphQL Mutations for LOGe System
// ==============================================

/**
 * Mutation to create a venue reservation/booking
 */
const CREATE_RESERVATION = gql`
  mutation CreateReservation($roomId: ID!, $userId: Int!, $startTime: String!, $endTime: String!, $status: String) {
    createReservation(roomId: $roomId, userId: $userId, startTime: $startTime, endTime: $endTime, status: $status) {
      id
      roomId
      userId
      startTime
      endTime
      status
      room {
        id
        name
        capacity
        venue {
          id
          name
        }
      }
    }
  }
`;

/**
 * Mutation to cancel a reservation
 */
const CANCEL_RESERVATION = gql`
  mutation CancelReservation($id: ID!) {
    cancelReservation(id: $id) {
      id
      roomId
      userId
      startTime
      endTime
      status
    }
  }
`;

/**
 * Mutation to update a reservation
 */
const UPDATE_RESERVATION = gql`
  mutation UpdateReservation($id: ID!, $startTime: String, $endTime: String, $status: String) {
    updateReservation(id: $id, startTime: $startTime, endTime: $endTime, status: $status) {
      id
      roomId
      userId
      startTime
      endTime
      status
      room {
        id
        name
      }
    }
  }
`;

module.exports = {
  createLogeClient,
  queries: {
    GET_VENUES,
    GET_VENUE_BY_ID,
    GET_ROOMS_BY_VENUE,
    CHECK_ROOM_AVAILABILITY,
    GET_ROOM_AVAILABILITY_BY_DATE,
    GET_RESERVATIONS_BY_ROOM,
  },
  mutations: {
    CREATE_RESERVATION,
    CANCEL_RESERVATION,
    UPDATE_RESERVATION,
  },
};
