# 📚 TitikTemu Backend - API Documentation

## Overview

TitikTemu Backend provides both **REST API** and **GraphQL API** interfaces.

- **REST API Base URL:** `http://localhost:3000/api`
- **GraphQL Endpoint:** `http://localhost:3000/graphql`

---

## 🔐 Authentication

All protected endpoints require JWT authentication.

### Headers
```
Authorization: Bearer <your-jwt-token>
```

### Obtaining a Token

1. Register a new user or login
2. Include the returned token in subsequent requests

---

## 📡 REST API Endpoints

### Auth Service (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/validate` | Validate token | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER"  // or "ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "jwt-token"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### Event Service (`/api/events`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/events` | Get all events | No |
| GET | `/api/events/:id` | Get event by ID | No |
| POST | `/api/events` | Create event | Admin |
| PUT | `/api/events/:id` | Update event | Admin |
| DELETE | `/api/events/:id` | Delete event | Admin |
| POST | `/api/events/:id/register` | Register for event | Yes |
| GET | `/api/events/:id/participants` | Get participants | Admin |

#### Create Event

```http
POST /api/events
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Tech Workshop 2025",
  "description": "Learn about microservices",
  "date": "2025-02-15T09:00:00Z",
  "startTime": "09:00",
  "endTime": "17:00",
  "location": "Aula Utama",
  "venueId": "venue-1",
  "venueName": "Aula Utama",
  "capacity": 100
}
```

#### Get Events

```http
GET /api/events?status=PUBLISHED&upcoming=true&page=1&limit=10
```

---

### Attendance Service (`/api/attendance`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/attendance/check-in` | Check in to event | Yes |
| GET | `/api/attendance/event/:id` | Get event attendance | Admin |
| GET | `/api/attendance/user/:userId` | Get user attendance | Yes* |
| GET | `/api/attendance/stats/:eventId` | Get attendance stats | Admin |

*Users can only view their own attendance

#### Check In

```http
POST /api/attendance/check-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "event-uuid",
  "notes": "Optional notes"
}
```

---

### Venue Service (`/api/venues`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/venues` | Get all venues | No |
| GET | `/api/venues/:id` | Get venue by ID | No |
| GET | `/api/venues/:id/availability` | Check availability | Yes |
| GET | `/api/venues/logistics` | Get logistics | No |
| GET | `/api/venues/logistics/:category` | Get by category | No |

---

## 🔷 GraphQL API

### Endpoint

```
POST http://localhost:3000/graphql
```

### Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Queries

#### Get All Events

```graphql
query {
  events(status: PUBLISHED, upcoming: true, page: 1, limit: 10) {
    events {
      id
      title
      description
      date
      location
      capacity
      participantCount
    }
    pagination {
      page
      total
      totalPages
    }
  }
}
```

#### Get Single Event

```graphql
query {
  event(id: "event-uuid") {
    id
    title
    description
    date
    venueId
    venueName
  }
}
```

#### Get Venues (from LOGe)

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

#### Get Current User

```graphql
query {
  me {
    id
    email
    name
    role
  }
}
```

### Mutations

#### Register User

```graphql
mutation {
  register(input: {
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
    role: USER
  }) {
    user {
      id
      email
      name
    }
    token
  }
}
```

#### Login

```graphql
mutation {
  login(input: {
    email: "user@example.com"
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

#### Create Event

```graphql
mutation {
  createEvent(input: {
    title: "Tech Workshop"
    description: "Learn microservices"
    date: "2025-02-15T09:00:00Z"
    location: "Aula Utama"
    capacity: 100
  }) {
    id
    title
    date
  }
}
```

#### Register for Event

```graphql
mutation {
  registerForEvent(eventId: "event-uuid") {
    id
    eventId
    registeredAt
  }
}
```

#### Check In

```graphql
mutation {
  checkIn(eventId: "event-uuid", notes: "On time") {
    id
    eventId
    checkInTime
    status
  }
}
```

---

## 🏥 Health Check

```http
GET http://localhost:3000/health
```

**Response:**
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

## 📋 Error Responses

### Standard Error Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |
| 503 | Service Unavailable |
