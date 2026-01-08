/**
 * GraphQL Schema Definition
 *
 * Purpose: Unified API layer for TitikTemu
 *
 * This GraphQL layer provides:
 *   - Events data access
 *   - Venue data integration (from LOGe)
 *   - User authentication operations
 *   - Event registration management
 *   - Attendance tracking
 */

const gql = require("graphql-tag");

const typeDefs = gql`
  # ==============================================
  # User Types
  # ==============================================

  """
  User account information
  """
  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    createdAt: String!
  }

  """
  User roles for access control
  """
  enum UserRole {
    USER
    ADMIN
  }

  """
  Authentication response with token
  """
  type AuthPayload {
    user: User!
    token: String!
  }

  # ==============================================
  # Event Types
  # ==============================================

  """
  Event information
  """
  type Event {
    id: ID!
    title: String!
    description: String
    date: String!
    startTime: String
    endTime: String
    location: String
    venueId: String
    venueName: String
    roomId: String
    roomName: String
    venueBookingId: String
    capacity: Int!
    status: EventStatus!
    participantCount: Int
    createdBy: String!
    createdAt: String!
    updatedAt: String!
  }

  """
  Event status values
  """
  enum EventStatus {
    DRAFT
    PUBLISHED
    CANCELLED
    COMPLETED
  }

  """
  Event participant record
  """
  type EventParticipant {
    id: ID!
    eventId: String!
    userId: String!
    userName: String
    userEmail: String
    registeredAt: String!
  }

  """
  Paginated events response
  """
  type EventsResponse {
    events: [Event!]!
    pagination: Pagination!
  }

  """
  Pagination information
  """
  type Pagination {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
  }

  # ==============================================
  # Venue Types (from LOGe integration)
  # ==============================================

  """
  Venue information from external LOGe system
  """
  type Venue {
    id: ID!
    name: String!
    description: String
    capacity: Int
    location: String
    facilities: [String!]
    available: Boolean!
  }

  """
  Venue availability for a specific date
  """
  type VenueAvailability {
    venueId: ID!
    date: String!
    available: Boolean!
    timeSlots: [TimeSlot!]
  }

  """
  Time slot availability
  """
  type TimeSlot {
    startTime: String!
    endTime: String!
    available: Boolean!
  }

  """
  Logistics item from LOGe
  """
  type Logistics {
    id: ID!
    name: String!
    description: String
    category: String
    quantity: Int
    available: Boolean!
  }

  # ==============================================
  # Attendance Types
  # ==============================================

  """
  Attendance record
  """
  type AttendanceRecord {
    id: ID!
    eventId: String!
    userId: String!
    userName: String
    userEmail: String
    status: AttendanceStatus!
    checkInTime: String!
  }

  """
  Attendance status values
  """
  enum AttendanceStatus {
    CHECKED_IN
    LATE
    EXCUSED
  }

  """
  Attendance statistics for an event
  """
  type AttendanceStats {
    eventId: String!
    totalCheckedIn: Int!
    byStatus: AttendanceStatusCount!
    firstCheckIn: String
    lastCheckIn: String
  }

  """
  Count of attendance by status
  """
  type AttendanceStatusCount {
    CHECKED_IN: Int!
    LATE: Int!
    EXCUSED: Int!
  }

  # ==============================================
  # Input Types
  # ==============================================

  """
  Input for user registration
  """
  input RegisterInput {
    email: String!
    password: String!
    name: String!
    role: UserRole
  }

  """
  Input for user login
  """
  input LoginInput {
    email: String!
    password: String!
  }

  """
  Input for creating an event
  """
  input CreateEventInput {
    title: String!
    description: String
    date: String!
    startTime: String
    endTime: String
    location: String
    venueId: String
    venueName: String
    roomId: String
    roomName: String
    venueBookingId: String
    capacity: Int
    status: EventStatus
  }

  """
  Input for updating an event
  """
  input UpdateEventInput {
    title: String
    description: String
    date: String
    startTime: String
    endTime: String
    location: String
    venueId: String
    venueName: String
    roomId: String
    roomName: String
    venueBookingId: String
    capacity: Int
    status: EventStatus
  }

  # ==============================================
  # Query Type
  # ==============================================

  type Query {
    # User queries
    """
    Get current user's profile (requires authentication)
    """
    me: User

    # Event queries
    """
    Get all events with optional filters
    """
    events(status: EventStatus, upcoming: Boolean, page: Int, limit: Int): EventsResponse!

    """
    Get a single event by ID
    """
    event(id: ID!): Event

    """
    Get participants for an event (admin only)
    """
    eventParticipants(eventId: ID!): [EventParticipant!]!

    # Venue queries (from LOGe)
    """
    Get all available venues from LOGe
    """
    venues: [Venue!]!

    """
    Get a single venue by ID from LOGe
    """
    venue(id: ID!): Venue

    """
    Check venue availability for a date
    """
    venueAvailability(venueId: ID!, date: String!): VenueAvailability

    """
    Get all logistics options from LOGe
    """
    logistics: [Logistics!]!

    """
    Get logistics by category
    """
    logisticsByCategory(category: String!): [Logistics!]!

    # Attendance queries
    """
    Get attendance records for an event (admin only)
    """
    eventAttendance(eventId: ID!): [AttendanceRecord!]!

    """
    Get attendance statistics for an event (admin only)
    """
    attendanceStats(eventId: ID!): AttendanceStats
  }

  # ==============================================
  # Mutation Type
  # ==============================================

  type Mutation {
    # Auth mutations
    """
    Register a new user
    """
    register(input: RegisterInput!): AuthPayload!

    """
    Login with email and password
    """
    login(input: LoginInput!): AuthPayload!

    # Event mutations
    """
    Create a new event (admin only)
    """
    createEvent(input: CreateEventInput!): Event!

    """
    Update an existing event (admin only)
    """
    updateEvent(id: ID!, input: UpdateEventInput!): Event!

    """
    Delete an event (admin only)
    """
    deleteEvent(id: ID!): Boolean!

    """
    Register current user for an event
    """
    registerForEvent(eventId: ID!): EventParticipant!

    # Attendance mutations
    """
    Check in to an event
    """
    checkIn(eventId: ID!, notes: String): AttendanceRecord!
  }
`;

module.exports = typeDefs;
