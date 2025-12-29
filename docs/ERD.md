# 📊 TitikTemu Backend - Entity Relationship Diagram

## Overview

The database is split into **three separate schemas**, each owned by a specific microservice.
There are **no cross-schema relationships** - services communicate via REST APIs.

---

## Auth Schema (`auth_schema`)

Managed by: **Auth Service**

```
┌─────────────────────────────────────────────────────────────────┐
│                            users                                │
├─────────────────────────────────────────────────────────────────┤
│ id          │ UUID      │ PK        │ Primary key               │
│ email       │ VARCHAR   │ UNIQUE    │ User email                │
│ password    │ VARCHAR   │ NOT NULL  │ Bcrypt hashed password    │
│ name        │ VARCHAR   │ NOT NULL  │ User full name            │
│ role        │ ENUM      │ NOT NULL  │ USER, ADMIN               │
│ created_at  │ TIMESTAMP │ DEFAULT   │ Creation timestamp        │
│ updated_at  │ TIMESTAMP │ AUTO      │ Last update timestamp     │
└─────────────────────────────────────────────────────────────────┘
```

### Role Enum

```
USER  - Regular student/participant
ADMIN - Event organizer/panitia
```

---

## Event Schema (`event_schema`)

Managed by: **Event Service**

```
┌─────────────────────────────────────────────────────────────────┐
│                           events                                │
├─────────────────────────────────────────────────────────────────┤
│ id          │ UUID      │ PK        │ Primary key               │
│ title       │ VARCHAR   │ NOT NULL  │ Event title               │
│ description │ TEXT      │ NULLABLE  │ Event description         │
│ date        │ TIMESTAMP │ NOT NULL  │ Event date                │
│ start_time  │ VARCHAR   │ NULLABLE  │ Start time (HH:MM)        │
│ end_time    │ VARCHAR   │ NULLABLE  │ End time (HH:MM)          │
│ location    │ VARCHAR   │ NULLABLE  │ Event location            │
│ venue_id    │ VARCHAR   │ NULLABLE  │ External venue ID (LOGe)  │
│ venue_name  │ VARCHAR   │ NULLABLE  │ Cached venue name         │
│ capacity    │ INTEGER   │ DEFAULT   │ Max participants (100)    │
│ status      │ ENUM      │ DEFAULT   │ Event status              │
│ created_by  │ UUID      │ NOT NULL  │ Admin user ID             │
│ created_at  │ TIMESTAMP │ DEFAULT   │ Creation timestamp        │
│ updated_at  │ TIMESTAMP │ AUTO      │ Last update timestamp     │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      event_participants                         │
├─────────────────────────────────────────────────────────────────┤
│ id            │ UUID      │ PK       │ Primary key              │
│ event_id      │ UUID      │ FK       │ Reference to events      │
│ user_id       │ UUID      │ NOT NULL │ User ID (from Auth)      │
│ user_name     │ VARCHAR   │ NULLABLE │ Cached user name         │
│ user_email    │ VARCHAR   │ NULLABLE │ Cached user email        │
│ registered_at │ TIMESTAMP │ DEFAULT  │ Registration timestamp   │
├─────────────────────────────────────────────────────────────────┤
│ UNIQUE (event_id, user_id)  │ One registration per user/event   │
└─────────────────────────────────────────────────────────────────┘
```

### Event Status Enum

```
DRAFT     - Event is being prepared
PUBLISHED - Event is visible and open for registration
CANCELLED - Event has been cancelled
COMPLETED - Event has ended
```

---

## Attendance Schema (`attendance_schema`)

Managed by: **Attendance Service**

```
┌─────────────────────────────────────────────────────────────────┐
│                      attendance_records                         │
├─────────────────────────────────────────────────────────────────┤
│ id            │ UUID      │ PK       │ Primary key              │
│ event_id      │ UUID      │ NOT NULL │ Event ID                 │
│ user_id       │ UUID      │ NOT NULL │ User ID                  │
│ user_name     │ VARCHAR   │ NULLABLE │ Cached user name         │
│ user_email    │ VARCHAR   │ NULLABLE │ Cached user email        │
│ status        │ ENUM      │ DEFAULT  │ Attendance status        │
│ check_in_time │ TIMESTAMP │ DEFAULT  │ Check-in timestamp       │
│ notes         │ TEXT      │ NULLABLE │ Optional notes           │
│ created_at    │ TIMESTAMP │ DEFAULT  │ Creation timestamp       │
│ updated_at    │ TIMESTAMP │ AUTO     │ Last update timestamp    │
├─────────────────────────────────────────────────────────────────┤
│ UNIQUE (event_id, user_id)  │ One check-in per user/event       │
└─────────────────────────────────────────────────────────────────┘
```

### Attendance Status Enum

```
CHECKED_IN - User checked in on time
LATE       - User checked in late
EXCUSED    - User has excused absence
```

---

## Relationship Diagram

```
                        ┌─────────────────┐
                        │   auth_schema   │
                        │                 │
                        │  ┌───────────┐  │
                        │  │   users   │  │
                        │  │    (id)   │  │
                        │  └─────┬─────┘  │
                        │        │        │
                        └────────│────────┘
                                 │
                                 │ Referenced by user_id
                                 │ (no foreign key - via API)
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   event_schema   │  │   event_schema   │  │attendance_schema │
│                  │  │                  │  │                  │
│  ┌────────────┐  │  │ ┌─────────────┐  │  │ ┌─────────────┐  │
│  │   events   │──┼──┼─│  event_     │  │  │ │ attendance_ │  │
│  │created_by  │  │  │ │ participants│  │  │ │   records   │  │
│  └────────────┘  │  │ │  user_id    │  │  │ │   user_id   │  │
│        │         │  │ └─────────────┘  │  │ │  event_id   │  │
│        │ 1:N     │  │                  │  │ └─────────────┘  │
│        ▼         │  │                  │  │                  │
│  ┌────────────┐  │  │                  │  │                  │
│  │   event_   │  │  │                  │  │                  │
│  │participants│  │  │                  │  │                  │
│  └────────────┘  │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## External Data (LOGe System)

The Venue Consumer Service queries the LOGe external system via GraphQL.
No local venue data is stored.

```
                    ┌────────────────────────────────────┐
                    │     LOGe External System           │
                    │     (GraphQL Server)               │
                    ├────────────────────────────────────┤
                    │  venues                            │
                    │  ├── id                            │
                    │  ├── name                          │
                    │  ├── description                   │
                    │  ├── capacity                      │
                    │  ├── location                      │
                    │  ├── facilities[]                  │
                    │  └── available                     │
                    │                                    │
                    │  logistics                         │
                    │  ├── id                            │
                    │  ├── name                          │
                    │  ├── description                   │
                    │  ├── category                      │
                    │  ├── quantity                      │
                    │  └── available                     │
                    │                                    │
                    │  venue_availability                │
                    │  ├── venueId                       │
                    │  ├── date                          │
                    │  ├── available                     │
                    │  └── timeSlots[]                   │
                    └────────────────────────────────────┘
```

---

## Design Principles

1. **Schema Isolation**: Each service has its own schema
2. **No Foreign Keys Across Schemas**: Data integrity via application logic
3. **Cached Reference Data**: User names/emails cached to avoid cross-service queries
4. **UUID Primary Keys**: Globally unique identifiers
5. **Soft References**: External IDs stored as strings (e.g., venue_id from LOGe)
