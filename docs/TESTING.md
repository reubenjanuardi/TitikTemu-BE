# 🧪 TitikTemu Backend - Testing Guide

Complete testing guide for TitikTemu Backend using GraphQL and REST APIs.

---

## 📋 Table of Contents

1. [Health Check](#health-check)
2. [Authentication](#authentication)
3. [Event Management](#event-management)
4. [Event Registration](#event-registration)
5. [Attendance Tracking](#attendance-tracking)
6. [Venue Integration](#venue-integration)
7. [Complete Testing Flow](#complete-testing-flow)
8. [Testing Tools](#testing-tools)

---

## ✅ Health Check

### Endpoint: GET /health

**cURL:**
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "service": "api-gateway",
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "services": [
    { "name": "auth-service", "status": "healthy" },
    { "name": "event-service", "status": "healthy" },
    { "name": "attendance-service", "status": "healthy" },
    { "name": "venue-service", "status": "healthy" }
  ]
}
```

---

## 🔐 Authentication

### GraphQL Endpoint

```
POST http://localhost:3000/graphql
```

### 1. Register User

**GraphQL Mutation:**
```graphql
mutation {
  register(input: {
    email: "john@example.com"
    password: "password123"
    name: "John Doe"
    role: USER
  }) {
    user {
      id
      email
      name
      role
      createdAt
    }
    token
  }
}
```

**Response:**
```json
{
  "data": {
    "register": {
      "user": {
        "id": "uuid-123",
        "email": "john@example.com",
        "name": "John Doe",
        "role": "USER",
        "createdAt": "2025-01-01T00:00:00Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Save the token for later use:**
```
USER_TOKEN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Register Admin User

**GraphQL Mutation:**
```graphql
mutation {
  register(input: {
    email: "admin@example.com"
    password: "admin123"
    name: "Admin User"
    role: ADMIN
  }) {
    user {
      id
      email
      name
      role
    }
    token
  }
}
```

**Save the admin token:**
```
ADMIN_TOKEN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Login

**GraphQL Mutation:**
```graphql
mutation {
  login(input: {
    email: "john@example.com"
    password: "password123"
  }) {
    user {
      id
      email
      name
      role
    }
    token
  }
}
```

### 4. Get Current User Profile

**Setup:** Add Authorization header in GraphQL Studio:
```json
{
  "Authorization": "Bearer USER_TOKEN"
}
```

**GraphQL Query:**
```graphql
query {
  me {
    id
    email
    name
    role
    createdAt
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "me": {
      "id": "uuid-123",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

---

## 📅 Event Management

### Setup

Change GraphQL headers to admin token:
```json
{
  "Authorization": "Bearer ADMIN_TOKEN"
}
```

### 1. Create Event (Admin Only)

**GraphQL Mutation:**
```graphql
mutation {
  createEvent(input: {
    title: "Tech Workshop 2025"
    description: "Learn microservices architecture and GraphQL"
    date: "2025-02-15T09:00:00Z"
    startTime: "09:00"
    endTime: "17:00"
    location: "Aula Utama"
    capacity: 100
  }) {
    id
    title
    description
    date
    startTime
    endTime
    location
    capacity
    status
    createdBy
  }
}
```

**Save the event ID:**
```
EVENT_ID = uuid-event-123
```

### 2. Get All Events

**GraphQL Query:**
```graphql
query {
  events(status: PUBLISHED, upcoming: true, page: 1, limit: 10) {
    events {
      id
      title
      description
      date
      startTime
      endTime
      location
      capacity
      participantCount
      status
    }
    pagination {
      page
      limit
      total
      totalPages
    }
  }
}
```

### 3. Get Single Event

**GraphQL Query:**
```graphql
query {
  event(id: "EVENT_ID") {
    id
    title
    description
    date
    startTime
    endTime
    location
    venueId
    venueName
    capacity
    participantCount
    status
    createdBy
    createdAt
  }
}
```

### 4. Update Event (Admin Only)

**GraphQL Mutation:**
```graphql
mutation {
  updateEvent(id: "EVENT_ID", input: {
    title: "Advanced Tech Workshop 2025"
    description: "Updated description"
    capacity: 150
  }) {
    id
    title
    capacity
    updatedAt
  }
}
```

### 5. Delete Event (Admin Only)

**GraphQL Mutation:**
```graphql
mutation {
  deleteEvent(id: "EVENT_ID")
}
```

**Expected Response:**
```json
{
  "data": {
    "deleteEvent": true
  }
}
```

### 6. Get Event Participants (Admin Only)

**GraphQL Query:**
```graphql
query {
  eventParticipants(eventId: "EVENT_ID") {
    id
    eventId
    userId
    userName
    userEmail
    registeredAt
  }
}
```

---

## 📝 Event Registration

### Setup

Change GraphQL headers to user token:
```json
{
  "Authorization": "Bearer USER_TOKEN"
}
```

### 1. Register for Event

**GraphQL Mutation:**
```graphql
mutation {
  registerForEvent(eventId: "EVENT_ID") {
    id
    eventId
    userId
    userName
    userEmail
    registeredAt
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "registerForEvent": {
      "id": "registration-123",
      "eventId": "EVENT_ID",
      "userId": "user-uuid",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "registeredAt": "2025-01-01T12:00:00Z"
    }
  }
}
```

### 2. Test Duplicate Registration (Should Fail)

Run the same register mutation again:

**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Already registered for this event",
      "extensions": {
        "code": "CONFLICT"
      }
    }
  ]
}
```

---

## ✅ Attendance Tracking

### 1. Check In to Event

**GraphQL Mutation:**
```graphql
mutation {
  checkIn(eventId: "EVENT_ID", notes: "Arrived on time") {
    id
    eventId
    userId
    userName
    checkInTime
    status
    notes
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "checkIn": {
      "id": "attendance-123",
      "eventId": "EVENT_ID",
      "userId": "user-uuid",
      "userName": "John Doe",
      "checkInTime": "2025-02-15T09:15:00Z",
      "status": "CHECKED_IN",
      "notes": "Arrived on time"
    }
  }
}
```

### 2. Get Event Attendance (Admin Only)

**Setup:** Switch to admin token

**GraphQL Query:**
```graphql
query {
  eventAttendance(eventId: "EVENT_ID") {
    id
    userId
    userName
    userEmail
    status
    checkInTime
    notes
  }
}
```

### 3. Get Attendance Statistics (Admin Only)

**GraphQL Query:**
```graphql
query {
  attendanceStats(eventId: "EVENT_ID") {
    eventId
    totalCheckedIn
    byStatus {
      CHECKED_IN
      LATE
      EXCUSED
    }
    firstCheckIn
    lastCheckIn
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "attendanceStats": {
      "eventId": "EVENT_ID",
      "totalCheckedIn": 5,
      "byStatus": {
        "CHECKED_IN": 4,
        "LATE": 1,
        "EXCUSED": 0
      },
      "firstCheckIn": "2025-02-15T08:50:00Z",
      "lastCheckIn": "2025-02-15T09:30:00Z"
    }
  }
}
```

---

## 🏢 Venue Integration (LOGe)

### 1. Get All Venues

**No authentication required**

**GraphQL Query:**
```graphql
query {
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
```

**Expected Response:**
```json
{
  "data": {
    "venues": [
      {
        "id": "venue-1",
        "name": "Aula Utama",
        "description": "Main hall with full facilities",
        "capacity": 500,
        "location": "Gedung A Lantai 1",
        "facilities": ["Sound System", "Projector", "AC", "WiFi"],
        "available": true
      },
      {
        "id": "venue-2",
        "name": "Ruang Seminar A",
        "description": "Medium conference room",
        "capacity": 100,
        "location": "Gedung B Lantai 2",
        "facilities": ["Projector", "AC", "WiFi"],
        "available": true
      }
    ]
  }
}
```

### 2. Get Single Venue

**GraphQL Query:**
```graphql
query {
  venue(id: "venue-1") {
    id
    name
    description
    capacity
    location
    facilities
    available
  }
}
```

### 3. Check Venue Availability

**Requires authentication**

**Setup:** Add user token to headers

**GraphQL Query:**
```graphql
query {
  venueAvailability(venueId: "venue-1", date: "2025-02-15") {
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
```

**Expected Response:**
```json
{
  "data": {
    "venueAvailability": {
      "venueId": "venue-1",
      "date": "2025-02-15",
      "available": true,
      "timeSlots": [
        {
          "startTime": "08:00",
          "endTime": "12:00",
          "available": true
        },
        {
          "startTime": "13:00",
          "endTime": "17:00",
          "available": true
        },
        {
          "startTime": "18:00",
          "endTime": "21:00",
          "available": false
        }
      ]
    }
  }
}
```

### 4. Get Logistics

**GraphQL Query:**
```graphql
query {
  logistics {
    id
    name
    description
    category
    quantity
    available
  }
}
```

### 5. Get Logistics by Category

**GraphQL Query:**
```graphql
query {
  logisticsByCategory(category: "Furniture") {
    id
    name
    description
    category
    quantity
    available
  }
}
```

---

## 🎯 Complete Testing Flow

Follow this step-by-step to test the entire system:

### Step 1: Verify Services Are Running

```bash
curl http://localhost:3000/health
```

### Step 2: Register User

**GraphQL Mutation:**
```graphql
mutation {
  register(input: {
    email: "john@example.com"
    password: "password123"
    name: "John Doe"
    role: USER
  }) {
    token
  }
}
```

**Save:** `USER_TOKEN`

### Step 3: Register Admin

**GraphQL Mutation:**
```graphql
mutation {
  register(input: {
    email: "admin@example.com"
    password: "admin123"
    name: "Admin User"
    role: ADMIN
  }) {
    token
  }
}
```

**Save:** `ADMIN_TOKEN`

### Step 4: Create Event (as Admin)

Switch GraphQL headers to `ADMIN_TOKEN`

**GraphQL Mutation:**
```graphql
mutation {
  createEvent(input: {
    title: "Test Event"
    description: "Testing the system"
    date: "2025-02-15T09:00:00Z"
    startTime: "09:00"
    endTime: "17:00"
    location: "Aula Utama"
    capacity: 50
  }) {
    id
    title
    date
  }
}
```

**Save:** `EVENT_ID`

### Step 5: View Events (as User)

Switch GraphQL headers to `USER_TOKEN`

**GraphQL Query:**
```graphql
query {
  events(page: 1, limit: 10) {
    events {
      id
      title
      date
    }
  }
}
```

### Step 6: Register for Event (as User)

**GraphQL Mutation:**
```graphql
mutation {
  registerForEvent(eventId: "EVENT_ID") {
    registeredAt
  }
}
```

### Step 7: Check In (as User)

**GraphQL Mutation:**
```graphql
mutation {
  checkIn(eventId: "EVENT_ID", notes: "Present") {
    checkInTime
    status
  }
}
```

### Step 8: View Attendance (as Admin)

Switch GraphQL headers to `ADMIN_TOKEN`

**GraphQL Query:**
```graphql
query {
  eventAttendance(eventId: "EVENT_ID") {
    id
    userName
    status
    checkInTime
  }
}
```

### Step 9: View Statistics (as Admin)

**GraphQL Query:**
```graphql
query {
  attendanceStats(eventId: "EVENT_ID") {
    totalCheckedIn
    byStatus {
      CHECKED_IN
      LATE
      EXCUSED
    }
  }
}
```

### Step 10: Check Venues

Switch to `USER_TOKEN` or no token

**GraphQL Query:**
```graphql
query {
  venues {
    id
    name
    capacity
  }
}
```

---

## 🛠️ Testing Tools

### 1. GraphQL Playground (Built-in)

**URL:** `http://localhost:3000/graphql`

**Features:**
- Built-in documentation
- Query/Mutation explorer
- Variable support
- Header management

### 2. Postman

1. Create new collection
2. Add requests for each endpoint
3. Use environment variables:

```json
{
  "baseUrl": "http://localhost:3000",
  "userToken": "YOUR_USER_TOKEN",
  "adminToken": "YOUR_ADMIN_TOKEN",
  "eventId": "YOUR_EVENT_ID"
}
```

4. Use `{{variable}}` in requests

### 3. cURL

```bash
# Example: Create event via cURL
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "query": "mutation { createEvent(input: { title: \"Event\", date: \"2025-02-15T09:00:00Z\" }) { id title } }"
  }'
```

### 4. REST API Alternative

If you prefer REST instead of GraphQL:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'

# Create Event
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Event","date":"2025-02-15T09:00:00Z"}'

# Register for Event
curl -X POST http://localhost:3000/api/events/EVENT_ID/register \
  -H "Authorization: Bearer USER_TOKEN"

# Check In
curl -X POST http://localhost:3000/api/attendance/check-in \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":"EVENT_ID"}'
```

---

## 📊 Test Cases Summary

| Feature | Test | Expected Result |
|---------|------|-----------------|
| Register | Create user | Returns token |
| Login | Login with credentials | Returns token |
| Create Event | Admin creates event | Event created with ID |
| View Events | Query events | Returns list of events |
| Register Event | User registers | Registration recorded |
| Check In | User checks in | Attendance recorded |
| View Attendance | Admin queries attendance | Lists all check-ins |
| Venues | Query venues | Returns LOGe venue data |
| Logistics | Query logistics | Returns equipment/supplies |

---

## ✅ Validation Checklist

- [ ] Health check passes
- [ ] User registration works
- [ ] Admin registration works
- [ ] Login returns token
- [ ] Create event (admin only)
- [ ] View events (public)
- [ ] Register for event (users)
- [ ] Check in to event (users)
- [ ] View attendance (admin only)
- [ ] View statistics (admin only)
- [ ] View venues (public)
- [ ] Check venue availability (users)
- [ ] View logistics (public)
- [ ] All error cases handled properly

---

## 🎉 All Tests Passing?

If all tests pass, your TitikTemu Backend is **fully functional** and ready for:
- ✅ Production deployment
- ✅ Frontend integration
- ✅ Academic evaluation
- ✅ Team collaboration
