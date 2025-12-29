/**
 * GraphQL Client for LOGe System
 * Handles all GraphQL communication with the external LOGe venue system
 */

const { ApolloClient, InMemoryCache, gql, HttpLink } = require('@apollo/client/core');
const fetch = require('cross-fetch');
const config = require('./index');

// Create Apollo Client instance for LOGe GraphQL API
const createLogeClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: config.loge.graphqlUrl,
      fetch,
      headers: config.loge.apiKey ? {
        'Authorization': `Bearer ${config.loge.apiKey}`
      } : {}
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
      }
    }
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
      capacity
      location
      facilities
      available
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
      capacity
      location
      facilities
      available
    }
  }
`;

/**
 * Query to check venue availability for a specific date
 */
const CHECK_VENUE_AVAILABILITY = gql`
  query CheckVenueAvailability($venueId: ID!, $date: String!) {
    venueAvailability(venueId: $venueId, date: $date) {
      venueId
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
 * Query to fetch logistics options
 */
const GET_LOGISTICS = gql`
  query GetLogistics {
    logistics {
      id
      name
      description
      category
      quantity
      available
    }
  }
`;

/**
 * Query to fetch logistics by category
 */
const GET_LOGISTICS_BY_CATEGORY = gql`
  query GetLogisticsByCategory($category: String!) {
    logisticsByCategory(category: $category) {
      id
      name
      description
      quantity
      available
    }
  }
`;

module.exports = {
  createLogeClient,
  queries: {
    GET_VENUES,
    GET_VENUE_BY_ID,
    CHECK_VENUE_AVAILABILITY,
    GET_LOGISTICS,
    GET_LOGISTICS_BY_CATEGORY
  }
};
