# 🚀 TitikTemu Backend - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** database (or Supabase account)

---

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd TitikTEMU-Backend

# Install root dependencies
npm install

# Install all workspace dependencies
npm install --workspaces
```

### 2. Environment Configuration

Copy environment example files and configure:

```bash
# Root environment
cp .env.example .env

# Gateway
cp gateway/.env.example gateway/.env

# Auth Service
cp services/auth-service/.env.example services/auth-service/.env

# Event Service
cp services/event-service/.env.example services/event-service/.env

# Attendance Service
cp services/attendance-service/.env.example services/attendance-service/.env

# Venue Consumer Service
cp services/venue-consumer-service/.env.example services/venue-consumer-service/.env
```

### 3. Configure Database URLs

Edit each service's `.env` file with your PostgreSQL/Supabase connection string:

```env
# Auth Service (.env)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=auth_schema

# Event Service (.env)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=event_schema

# Attendance Service (.env)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=attendance_schema
```

### 4. Configure JWT Secret

Use the same JWT secret across all services:

```env
JWT_SECRET=your-super-secret-key-min-32-chars
```

### 5. Generate Prisma Clients

```bash
# Generate Prisma clients for all services
npm run db:generate
```

### 6. Push Database Schema

```bash
# Push schema to database (creates tables)
npm run db:push
```

### 7. Start All Services

```bash
# Start all services concurrently
npm run dev:all
```

Or start individually:

```bash
# Terminal 1 - Auth Service
npm run dev:auth

# Terminal 2 - Event Service
npm run dev:event

# Terminal 3 - Attendance Service
npm run dev:attendance

# Terminal 4 - Venue Consumer Service
npm run dev:venue

# Terminal 5 - API Gateway
npm run dev:gateway
```

---

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Event Service | 3002 | http://localhost:3002 |
| Attendance Service | 3003 | http://localhost:3003 |
| Venue Consumer Service | 3004 | http://localhost:3004 |

---

## Verify Installation

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "service": "api-gateway",
  "status": "healthy",
  "services": [...]
}
```

### Test Authentication

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test GraphQL

Open GraphQL Playground at: http://localhost:3000/graphql

Try this query:
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

## Database Management

### Using Prisma Studio

```bash
# Auth Service
cd services/auth-service && npx prisma studio

# Event Service
cd services/event-service && npx prisma studio

# Attendance Service
cd services/attendance-service && npx prisma studio
```

### Running Migrations

```bash
npm run db:migrate
```

---

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 2. Get Connection String

1. Go to Settings → Database
2. Copy the connection string (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password

### 3. Configure Schema

Each service uses a different schema. The connection string format:

```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?schema=auth_schema
```

---

## Development Tips

### Logs

All services log to console in development mode. Use `morgan` for request logging.

### Hot Reload

All services use `nodemon` for hot reload during development.

### Prisma Commands

```bash
# Generate client after schema changes
npx prisma generate

# Push schema changes to database
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# View data in browser
npx prisma studio
```

---

## 🔗 LOGe Integration Setup

### Configure API Keys

The system uses API keys for secure communication with the external LOGe venue management system.

**In `.env` file:**

```env
# LOGe API Key for TitikTemu to call LOGe (outgoing)
LOGE_API_KEY=your-api-key-here

# LOGe API Key for LOGe to call TitikTemu (incoming)
LOGE_INCOMING_API_KEY=your-shared-secret-key
```

**Two API Keys:**

1. **`LOGE_API_KEY`** - Used by TitikTemu services (venue-consumer-service) to call LOGe GraphQL API
2. **`LOGE_INCOMING_API_KEY`** - Used by LOGe to authenticate when calling TitikTemu public API

### LOGe Access to TitikTemu Data

LOGe can fetch event data from TitikTemu using the Public API with just an API key (no JWT required):

```bash
# Get all events
curl -H "X-LOGE-API-Key: your-shared-secret-key" \
  http://localhost:3002/api/public/events

# Get event by ID
curl -H "X-LOGE-API-Key: your-shared-secret-key" \
  http://localhost:3002/api/public/events/{event-id}

# Get venue bookings
curl -H "X-LOGE-API-Key: your-shared-secret-key" \
  http://localhost:3002/api/public/venue-bookings?venueId=1
```

**Public API Endpoints:**
- `GET /api/public/events` - List all events
- `GET /api/public/events/:id` - Get event details
- `GET /api/public/venue-bookings` - Get events with venue bookings

**Security Note:** Make sure to use a strong, randomly generated API key and keep it secure. Share it only with authorized LOGe system administrators.

---

## Troubleshooting

### "Cannot find module" errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm install --workspaces
```

### Database connection errors

- Verify DATABASE_URL is correct
- Check if Supabase project is running
- Ensure schema name is included in URL

### Port already in use

```bash
# Find process using port
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Prisma client errors

```bash
# Regenerate Prisma client
cd services/<service-name>
npx prisma generate
```
