# 🏗️ TitikTemu Backend - Architecture Documentation

## System Overview

TitikTemu is a microservices-based event management system for Kampus X. The architecture follows a strict separation of concerns with an API Gateway as the single entry point.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client Applications                          │
│                  (Postman, Frontend, Mobile App)                    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API Gateway                                │
│                    (Express + Apollo Server)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   REST API  │  │  GraphQL    │  │    Auth     │                  │
│  │   Routes    │  │  Gateway    │  │ Middleware  │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│                         Port: 3000                                  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Auth Service  │   │ Event Service │   │  Attendance   │
│   (REST)      │   │    (REST)     │   │   Service     │
│  Port: 3001   │   │  Port: 3002   │   │  Port: 3003   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  auth_schema  │   │ event_schema  │   │  attendance   │
│               │   │               │   │    _schema    │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │  PostgreSQL (Supabase)  │
               └─────────────────────────┘

                                │
┌───────────────────────────────┼───────────────────────┐
│                               │                       │
│        Venue Consumer Service (Port: 3004)            │
│        ┌─────────────────────────────────┐            │
│        │      GraphQL Client             │            │
│        │    (Apollo Client)              │            │
│        └──────────────┬──────────────────┘            │
│                       │                               │
└───────────────────────┼───────────────────────────────┘
                        │
                        ▼
               ┌─────────────────────────┐
               │   LOGe External System  │
               │    (GraphQL Server)     │
               └─────────────────────────┘
```

---

## Component Details

### 1. API Gateway (Port 3000)

**Responsibilities:**
- Single entry point for all client requests
- JWT token validation
- Request routing to microservices
- GraphQL Gateway layer
- Error handling and logging
- Health check aggregation

**Technology:**
- Express.js
- Apollo Server (GraphQL)
- axios (HTTP client)
- jsonwebtoken

### 2. Auth Service (Port 3001)

**Responsibilities:**
- User registration
- User authentication (login)
- JWT token generation
- Token validation
- User profile management

**Database Schema:** `auth_schema`
- `users` table

**Endpoints:**
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/validate`
- `GET /auth/profile`

### 3. Event Service (Port 3002)

**Responsibilities:**
- Event CRUD operations
- Participant registration
- Event listing with filters
- Venue reference storage

**Database Schema:** `event_schema`
- `events` table
- `event_participants` table

**Endpoints:**
- `GET /events`
- `GET /events/:id`
- `POST /events`
- `PUT /events/:id`
- `DELETE /events/:id`
- `POST /events/:id/register`
- `GET /events/:id/participants`

### 4. Attendance Service (Port 3003)

**Responsibilities:**
- Event check-in
- Attendance tracking
- Attendance statistics

**Database Schema:** `attendance_schema`
- `attendance_records` table

**Endpoints:**
- `POST /attendance/check-in`
- `GET /attendance/event/:id`
- `GET /attendance/user/:userId`
- `GET /attendance/stats/:eventId`

### 5. Venue Consumer Service (Port 3004)

**Responsibilities:**
- Consume venue data from LOGe (GraphQL)
- Consume logistics data from LOGe
- Check venue availability
- Proxy LOGe data to TitikTemu

**Note:** This service does NOT store venue data locally. It acts as a GraphQL client.

**Endpoints:**
- `GET /venues`
- `GET /venues/:id`
- `GET /venues/:id/availability`
- `GET /venues/logistics`
- `GET /venues/logistics/:category`

---

## Data Flow

### User Registration Flow

```
Client → Gateway → Auth Service → Database
   ↑                    │
   └────────────────────┘
        (JWT Token)
```

### Event Creation Flow (Admin)

```
Client → Gateway (Auth Check) → Event Service → Database
   ↑                                  │
   └──────────────────────────────────┘
           (Created Event)
```

### Event Registration Flow (User)

```
Client → Gateway (Auth Check) → Event Service → Database
   ↑                                  │
   └──────────────────────────────────┘
        (Registration Record)
```

### Venue Data Flow

```
Client → Gateway → Venue Consumer Service → LOGe (GraphQL)
   ↑                       │
   └───────────────────────┘
        (Venue Data)
```

---

## Security Architecture

### JWT-Based Authentication

1. User logs in via Auth Service
2. Auth Service generates JWT token
3. Client includes token in `Authorization: Bearer <token>` header
4. API Gateway validates token before forwarding requests
5. User info is passed to microservices via custom headers:
   - `x-user-id`
   - `x-user-email`
   - `x-user-role`
   - `x-user-name`

### Role-Based Access Control

| Role | Capabilities |
|------|-------------|
| USER | View events, register for events, check-in, view own attendance |
| ADMIN | All USER capabilities + create/update/delete events, view all attendance |

---

## Database Strategy

### Schema Separation

Each service has its own PostgreSQL schema:

```
┌────────────────────────────────────────────┐
│           PostgreSQL Database              │
│                                            │
│  ┌─────────────┐  ┌─────────────────────┐  │
│  │ auth_schema │  │    event_schema     │  │
│  │  ┌───────┐  │  │  ┌───────┐ ┌─────┐  │  │
│  │  │ users │  │  │  │events │ │parts│  │  │
│  │  └───────┘  │  │  └───────┘ └─────┘  │  │
│  └─────────────┘  └─────────────────────┘  │
│                                            │
│  ┌─────────────────────┐                   │
│  │  attendance_schema  │                   │
│  │   ┌──────────────┐  │                   │
│  │   │  attendance  │  │                   │
│  │   │   _records   │  │                   │
│  │   └──────────────┘  │                   │
│  └─────────────────────┘                   │
└────────────────────────────────────────────┘
```

### Key Principles

- **No shared tables** between services
- **No cross-service database joins**
- Communication via **REST APIs only**
- Each service manages its own data

---

## GraphQL Integration

### Internal GraphQL (Gateway)

The API Gateway exposes a GraphQL endpoint that:
- Provides unified API for clients
- Abstracts internal REST services
- Enables flexible queries

### External GraphQL (LOGe)

The Venue Consumer Service consumes:
- Venue data from LOGe
- Logistics data from LOGe
- Availability information

This is the **mandatory integration point** with external teams.

---

## Error Handling

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

### Error Codes

| Code | Type |
|------|------|
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entries) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |
