
# 📌 Project Development Plan — **TitikTemu Backend**

## 1. Project Overview

**TitikTemu** adalah sistem backend manajemen event Kampus X berbasis  **microservices** , yang memungkinkan:

* Mahasiswa melihat dan mendaftar event
* Panitia membuat dan mengelola event
* Integrasi venue & logistik dari sistem eksternal (LOGe) melalui **GraphQL**

Fokus utama proyek ini adalah  **backend architecture** , sedangkan frontend dan deployment bersifat  **opsional/bonus** .

---

## 2. High-Level Architecture

<pre class="overflow-visible! px-0!" data-start="710" data-end="989"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>Client / Tester (Postman)
        ↓
API </span><span>Gateway</span><span></span><span>(Express)</span><span>
        ↓
GraphQL </span><span>Gateway</span><span></span><span>(Apollo Server)</span><span>
        ↓
Microservices (REST)
 ├── Auth Service
 ├── Event Service
 ├── Attendance Service
 └── Venue Consumer Service
        ↓
PostgreSQL (Supabase, per-service schema)
</span></span></code></div></div></pre>

---

## 3. Technology Stack

### Core Stack

* **Node.js**
* **Express.js**
* **REST API (internal)**
* **GraphQL (integration & API layer)**

### Database

* **PostgreSQL (Supabase)**
* **Prisma ORM**
* **1 schema per service**

### Security

* **JWT (RS256 recommended)**
* Auth handled centrally via Auth Service

### Deployment (Optional)

* Backend: **Railway**
* Frontend (optional): **Next.js (Vercel)**

---

## 4. Microservices Breakdown

### 4.1 Auth Service

**Purpose:** Authentication & authorization

Responsibilities:

* User registration
* User login
* JWT issuance
* Token validation

Endpoints (REST):

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/validate`

Database:

* `users`
* `roles`

---

### 4.2 Event Service

**Purpose:** Core event management

Responsibilities:

* Create event (admin only)
* List upcoming events
* Register participant to event
* Store venue reference (external ID)

Endpoints (REST):

* `POST /events`
* `GET /events`
* `POST /events/:id/register`

Database:

* `events`
* `event_participants`

---

### 4.3 Attendance Service

**Purpose:** Event attendance tracking

Responsibilities:

* Record participant attendance
* Validate registered users
* Attendance reporting

Endpoints (REST):

* `POST /attendance/check-in`
* `GET /attendance/event/:id`

Database:

* `attendance_records`

---

### 4.4 Venue Consumer Service

**Purpose:** Integration with LOGe system (external group)

Responsibilities:

* Consume venue & logistics data from LOGe
* Validate availability
* Forward selected venue to Event Service

Integration:

* **GraphQL client**
* Queries LOGe GraphQL API

Does NOT store master venue data.

---

## 5. API Gateway Responsibilities

* Single entry point for all requests
* Route requests to correct microservice
* JWT verification middleware
* Error handling & logging
* Health check endpoint

Base path:

<pre class="overflow-visible! px-0!" data-start="2857" data-end="2871"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>/api/*
</span></span></code></div></div></pre>

Example:

<pre class="overflow-visible! px-0!" data-start="2882" data-end="2933"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>/api/auth/*
/api/events/*
/api/attendance/*
</span></span></code></div></div></pre>

---

## 6. GraphQL Layer Plan

### Purpose

* Unified API layer
* Mandatory integration interface antar kelompok
* Data contract clarity

### Location

* GraphQL Server runs inside **API Gateway**

### GraphQL Responsibilities

* Expose:
  * Events
  * Venue data (from LOGe)
* Consume:
  * LOGe venue & logistics API

### Example Schema (Simplified)

<pre class="overflow-visible! px-0!" data-start="3284" data-end="3484"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-graphql"><span><span>type</span><span> Event </span><span>{</span><span>
  </span><span>id</span><span>:</span><span> ID</span><span>!</span><span>
  </span><span>title</span><span>:</span><span> String</span><span>!</span><span>
  </span><span>date</span><span>:</span><span> String</span><span>!</span><span>
  </span><span>venueId</span><span>:</span><span> String
</span><span>}</span><span>

</span><span>type</span><span></span><span>Query</span><span></span><span>{</span><span>
  </span><span>events</span><span>:</span><span></span><span>[</span><span>Event</span><span>]</span><span>
  </span><span>venues</span><span>:</span><span></span><span>[</span><span>Venue</span><span>]</span><span>
</span><span>}</span><span>

</span><span>type</span><span></span><span>Mutation</span><span></span><span>{</span><span>
  registerEvent</span><span>(</span><span>eventId</span><span>:</span><span> ID</span><span>!</span><span>)</span><span>:</span><span> Boolean
</span><span>}</span><span>
</span></span></code></div></div></pre>

---

## 7. Database Strategy

* PostgreSQL via Supabase
* **Separate schema per service**
* No shared tables across services
* Communication via API, not DB join

Example schemas:

* `auth_schema`
* `event_schema`
* `attendance_schema`

---

## 8. Development Phases

### Phase 1 — Foundation

* Initialize monorepo structure
* Setup API Gateway
* Setup Auth Service
* Configure Prisma + Supabase

### Phase 2 — Core Services

* Implement Event Service
* Implement Attendance Service
* Implement role-based access

### Phase 3 — Integration

* Implement Venue Consumer Service
* Integrate with LOGe via GraphQL
* Add GraphQL Gateway layer

### Phase 4 — Stabilization

* Error handling
* Logging
* API documentation
* Health checks

### Phase 5 — Optional Enhancements

* Frontend (Next.js)
* Deployment (Railway/Vercel)
* Performance testing

---

## 9. Deliverables for Tugas Besar

### Mandatory

* Backend microservices
* API Gateway
* GraphQL integration
* ERD
* Architecture diagram
* Sequence diagram
* Documentation

### Optional (Bonus)

* Frontend UI
* Cloud deployment
* Public API demo

---

## 10. Success Criteria

Project is considered complete if:

* Semua service berjalan independen
* Integrasi LOGe berhasil via GraphQL
* API Gateway berfungsi
* Dokumentasi sesuai proposal
* Use case mahasiswa & panitia terpenuhi

---

## 11. Notes for AI Agent

* Prioritize correctness over optimization
* Do NOT merge databases
* Do NOT bypass API Gateway
* GraphQL required for integration
* REST allowed internally
