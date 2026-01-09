# Using Cloud PostgreSQL with Docker (Supabase, AWS RDS, Azure, etc.)

## Overview

You can easily replace the local PostgreSQL container with a cloud-hosted database like:

- **Supabase** (PostgreSQL + extras)
- **AWS RDS PostgreSQL**
- **Azure Database for PostgreSQL**
- **Google Cloud SQL**
- **DigitalOcean Managed Databases**

## Why Use Cloud PostgreSQL?

✅ **No container management needed** - Database team handles it
✅ **Automatic backups** - Built-in redundancy
✅ **Automatic scaling** - Handles growth
✅ **Better security** - Enterprise-grade encryption
✅ **Monitoring built-in** - Dashboards & alerts
✅ **Reduced resource usage** - Less Docker containers
✅ **Production-ready** - Proven reliability
✅ **Faster deployments** - Skip DB setup

## Quick Setup with Supabase

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Create a new project"
3. Name it (e.g., "titiktemu-prod")
4. Create a strong password
5. Select region closest to you
6. Wait for project to initialize

### Step 2: Get Connection String

1. In Supabase dashboard, click "Connect"
2. Select "URI"
3. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-region.pooling.supabase.co:6543/postgres
   ```

### Step 3: Update .env File

Replace the local DB variables with cloud credentials:

```env
# OLD (Local PostgreSQL)
DB_USER=titiktemu
DB_PASSWORD=titiktemu_password
DB_NAME=titiktemu_db
DB_PORT=5432

# NEW (Supabase - Replace with your actual credentials)
# Option 1: Using individual variables
DB_HOST=aws-0-xxxxx.pooling.supabase.co
DB_PORT=6543
DB_USER=postgres.xxxxx
DB_PASSWORD=your-supabase-password
DB_NAME=postgres

# Option 2: Using DATABASE_URL directly (recommended)
# DATABASE_URL=postgresql://postgres.xxxxx:your-password@aws-0-xxxxx.pooling.supabase.co:6543/postgres?schema=auth_schema
```

### Step 4: Update docker-compose.yml

Comment out or remove the PostgreSQL service:

```yaml
# Remove or comment out this entire section:
# postgres:
#   image: postgres:15-alpine
#   ...
```

See [Alternative docker-compose.yml](#alternative-docker-composeyml) below for complete example.

### Step 5: Update Service DATABASE_URLs

For each service in docker-compose.yml:

```yaml
auth-service:
  environment:
    # Use Supabase connection with schema
    DATABASE_URL: postgresql://postgres.xxxxx:password@aws-0-xxxxx.pooling.supabase.co:6543/postgres?schema=auth_schema

event-service:
  environment:
    DATABASE_URL: postgresql://postgres.xxxxx:password@aws-0-xxxxx.pooling.supabase.co:6543/postgres?schema=event_schema

attendance-service:
  environment:
    DATABASE_URL: postgresql://postgres.xxxxx:password@aws-0-xxxxx.pooling.supabase.co:6543/postgres?schema=attendance_schema
```

### Step 6: Deploy Services

```bash
# Copy environment
cp .env.docker .env

# Edit .env with Supabase credentials
# Then build and start
docker-compose build
docker-compose up -d
```

## Alternative docker-compose.yml

Here's what docker-compose.yml looks like WITHOUT PostgreSQL:

```yaml
version: "3.8"

services:
  # ❌ NO PostgreSQL SERVICE - Using Supabase instead!

  # Auth Service
  auth-service:
    build:
      context: ./services/auth-service
      dockerfile: Dockerfile
    container_name: titiktemu_auth_service
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 3001
      # Using Supabase connection string
      DATABASE_URL: ${SUPABASE_AUTH_DATABASE_URL:-postgresql://user:password@host:6543/postgres?schema=auth_schema}
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-min-32-chars}
      TZ: "UTC"
    ports:
      - "3001:3001"
    networks:
      - titiktemu-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Event Service
  event-service:
    build:
      context: ./services/event-service
      dockerfile: Dockerfile
    container_name: titiktemu_event_service
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 3002
      DATABASE_URL: ${SUPABASE_EVENT_DATABASE_URL:-postgresql://user:password@host:6543/postgres?schema=event_schema}
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-min-32-chars}
      TZ: "UTC"
    ports:
      - "3002:3002"
    networks:
      - titiktemu-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3002/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Attendance Service
  attendance-service:
    build:
      context: ./services/attendance-service
      dockerfile: Dockerfile
    container_name: titiktemu_attendance_service
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 3003
      DATABASE_URL: ${SUPABASE_ATTENDANCE_DATABASE_URL:-postgresql://user:password@host:6543/postgres?schema=attendance_schema}
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-min-32-chars}
      TZ: "UTC"
    ports:
      - "3003:3003"
    networks:
      - titiktemu-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3003/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Venue Consumer Service
  venue-consumer-service:
    build:
      context: ./services/venue-consumer-service
      dockerfile: Dockerfile
    container_name: titiktemu_venue_service
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 3004
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-min-32-chars}
      LOGE_GRAPHQL_URL: ${LOGE_GRAPHQL_URL:-http://localhost:4000/graphql}
      TZ: "UTC"
    ports:
      - "3004:3004"
    networks:
      - titiktemu-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3004/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # API Gateway
  gateway:
    build:
      context: ./gateway
      dockerfile: Dockerfile
    container_name: titiktemu_gateway
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 3000
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-min-32-chars}
      AUTH_SERVICE_URL: ${AUTH_SERVICE_URL:-http://auth-service:3001}
      EVENT_SERVICE_URL: ${EVENT_SERVICE_URL:-http://event-service:3002}
      ATTENDANCE_SERVICE_URL: ${ATTENDANCE_SERVICE_URL:-http://attendance-service:3003}
      VENUE_SERVICE_URL: ${VENUE_SERVICE_URL:-http://venue-consumer-service:3004}
      TZ: "UTC"
    ports:
      - "3000:3000"
    depends_on:
      - auth-service
      - event-service
      - attendance-service
      - venue-consumer-service
    networks:
      - titiktemu-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  titiktemu-network:
    driver: bridge
# ❌ No volumes needed - database is in the cloud!
```

## Updated .env File

```env
# Docker Environment Configuration
# Using Cloud PostgreSQL (Supabase, AWS RDS, etc.)

# Node Environment
NODE_ENV=production

# ========== CLOUD DATABASE CONFIGURATION ==========
# Replace these with your cloud database credentials

# Supabase Connection String Example:
# postgresql://postgres.xxxxx:password@aws-0-xxxxx.pooling.supabase.co:6543/postgres
SUPABASE_HOST=aws-0-xxxxx.pooling.supabase.co
SUPABASE_PORT=6543
SUPABASE_USER=postgres.xxxxx
SUPABASE_PASSWORD=your-supabase-password
SUPABASE_DB=postgres

# Service-specific DATABASE_URLs
SUPABASE_AUTH_DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-xxxxx.pooling.supabase.co:6543/postgres?schema=auth_schema
SUPABASE_EVENT_DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-xxxxx.pooling.supabase.co:6543/postgres?schema=event_schema
SUPABASE_ATTENDANCE_DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-xxxxx.pooling.supabase.co:6543/postgres?schema=attendance_schema

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-that-must-be-at-least-32-characters-long

# Service URLs (Docker internal)
AUTH_SERVICE_URL=http://auth-service:3001
EVENT_SERVICE_URL=http://event-service:3002
ATTENDANCE_SERVICE_URL=http://attendance-service:3003
VENUE_SERVICE_URL=http://venue-consumer-service:3004

# External Service URLs
LOGE_GRAPHQL_URL=http://localhost:5000/graphql

# Ports (exposed to host)
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
EVENT_SERVICE_PORT=3002
ATTENDANCE_SERVICE_PORT=3003
VENUE_SERVICE_PORT=3004
```

## Setup Instructions by Provider

### Supabase (Recommended)

```bash
# 1. Go to supabase.com and create project
# 2. In Project Settings → Database → Connection String
# 3. Copy the URI connection string
# 4. Update .env with:
SUPABASE_AUTH_DATABASE_URL=postgresql://postgres.xxxxx:pwd@host:6543/postgres?schema=auth_schema
```

**Supabase Tips:**

- Use connection pooling (Port 6543)
- Create separate schemas for each service
- Use Supabase Auth for JWT if available
- Monitor via Supabase dashboard

### AWS RDS

```bash
# Connection string format:
# postgresql://username:password@endpoint:5432/database
# Example:
SUPABASE_AUTH_DATABASE_URL=postgresql://admin:password@titiktemu-db.xxxxx.us-east-1.rds.amazonaws.com:5432/postgres?schema=auth_schema
```

**RDS Tips:**

- Create security group to allow container access
- Use IAM authentication for better security
- Enable automated backups
- Monitor via CloudWatch

### Azure Database for PostgreSQL

```bash
# Connection string format:
# postgresql://username@server:password@server.postgres.database.azure.com:5432/database
SUPABASE_AUTH_DATABASE_URL=postgresql://pgadmin@titiktemu:password@titiktemu.postgres.database.azure.com:5432/postgres?schema=auth_schema
```

### Google Cloud SQL

```bash
# Use Cloud SQL Auth Proxy or direct connection
SUPABASE_AUTH_DATABASE_URL=postgresql://postgres:password@35.xxx.xxx.xxx:5432/postgres?schema=auth_schema
```

### DigitalOcean Managed Database

```bash
# Get connection string from DigitalOcean dashboard
SUPABASE_AUTH_DATABASE_URL=postgresql://doadmin:password@db-xxxxx-do-user-xxxxx-0.db.ondigitalocean.com:25060/defaultdb?schema=auth_schema
```

## Step-by-Step Migration

### 1. Backup Current Data (if any)

```bash
# Local PostgreSQL backup
docker-compose exec postgres pg_dump -U titiktemu titiktemu_db > local_backup.sql
```

### 2. Create Cloud Database

- Sign up at your chosen provider
- Create PostgreSQL database
- Get connection string

### 3. Create Schemas in Cloud DB

```bash
# Connect to cloud database
psql postgresql://user:password@host:port/database

# Create schemas
CREATE SCHEMA auth_schema;
CREATE SCHEMA event_schema;
CREATE SCHEMA attendance_schema;
```

### 4. Update Configuration

```bash
# Edit .env with cloud credentials
# Update docker-compose.yml (remove postgres service)
```

### 5. Run Migrations

```bash
# Prisma will create tables in cloud database
npm run db:push --workspaces
```

### 6. Start Services

```bash
docker-compose up -d
```

## Benefits vs. Drawbacks

### Cloud Database Benefits ✅

- No container management
- Automatic backups
- High availability
- Better scaling
- Professional monitoring
- Less resource usage
- Easier team access

### Cloud Database Drawbacks ❌

- Monthly cost (~$50+)
- Network latency
- Vendor lock-in
- Less control over schema changes
- May need firewall setup

### Local Docker PostgreSQL Benefits ✅

- Free
- Full control
- No network latency
- Great for development
- Easy to reset

### Local Docker PostgreSQL Drawbacks ❌

- Manual backups
- Limited scaling
- Uses host resources
- Not production-ready for high traffic

## Monitoring & Debugging

### With Cloud Database

**Connect via CLI:**

```bash
# Supabase
psql postgresql://postgres.xxxxx:password@host:6543/postgres

# AWS RDS
psql -h endpoint -U username -d database

# Azure
psql -h server.postgres.database.azure.com -U user@server -d database
```

**Check schemas:**

```sql
\dn  -- List schemas
\dt  -- List tables

-- Check service table counts
SELECT schemaname, COUNT(*) as table_count
FROM pg_tables
GROUP BY schemaname;
```

**View connection stats:**

```bash
# From Supabase dashboard
# From AWS RDS console
# From Azure Portal

# Or query:
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

## Hybrid Setup (Development vs. Production)

You can use different databases for different environments:

```env
# .env.docker (development - local)
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DATABASE_URL=postgresql://titiktemu:password@postgres:5432/titiktemu_db

# .env.prod (production - cloud)
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@cloud-host:port/database?schema=auth_schema
```

Then use:

```bash
# Development (with local DB)
docker-compose up -d

# Production (with cloud DB)
cp .env.prod .env
docker-compose up -d
```

## Security Considerations

### Cloud Database Security

```yaml
# In docker-compose.yml, never hardcode credentials:
environment:
  # ❌ BAD - Don't do this
  DATABASE_URL: postgresql://user:password@host/db

  # ✅ GOOD - Use environment variables
  DATABASE_URL: ${DATABASE_URL}

  # ✅ BETTER - Use secrets
  DATABASE_URL: ${CLOUD_DATABASE_URL}
```

### Best Practices

1. **Use strong passwords** - 32+ characters
2. **Enable SSL/TLS** - Cloud providers usually enforce this
3. **Restrict IP access** - Allow only your app servers
4. **Use connection pooling** - Reduces connection count
5. **Monitor access logs** - Check for suspicious activity
6. **Enable encryption at rest** - Provider default usually
7. **Regular backups** - Test restore procedures
8. **Rotate credentials** - Every 3-6 months

## Comparison Table

| Feature    | Local Docker | Cloud (Supabase) | Cloud (RDS)    |
| ---------- | ------------ | ---------------- | -------------- |
| Cost       | Free         | $25/month        | $50/month      |
| Setup Time | 5 min        | 15 min           | 30 min         |
| Backups    | Manual       | Automatic        | Automatic      |
| Scaling    | Manual       | Auto             | Manual + cost  |
| Latency    | None         | Low (30-100ms)   | Low (30-100ms) |
| Support    | Community    | Built-in         | AWS Support    |
| SSL/TLS    | Optional     | Required         | Optional       |
| Monitoring | Docker stats | Dashboard        | CloudWatch     |

## Troubleshooting

### Connection Timeout

```bash
# Check firewall rules
# Check connection string format
# Verify credentials are correct
# Test with psql client
psql "postgresql://user:pass@host:port/db"
```

### Too Many Connections

```bash
# Enable connection pooling in docker-compose.yml
# Reduce connection timeout
# Use PgBouncer for pooling
```

### Slow Queries

```bash
# Check cloud provider's query monitoring
# Add indexes to frequently queried columns
# Optimize Prisma queries
```

### SSL/TLS Errors

```bash
# Check if SSL is required by provider
# Add ?sslmode=require to connection string
# Verify certificate validity
```

## When to Use Each

**Use Local Docker PostgreSQL when:**

- 🔧 Developing locally
- 💰 Budget is tight
- 🏠 Self-hosted deployment
- 🔄 Need frequent resets
- 👥 Single developer

**Use Cloud PostgreSQL when:**

- 🚀 Production deployment
- 📈 Expecting high traffic
- 🏢 Multiple team members
- 🔒 Need high security/compliance
- 🌍 Multi-region deployment
- ⏰ 24/7 uptime required

---

**Need help migrating?** Let me know which cloud provider you're using!
