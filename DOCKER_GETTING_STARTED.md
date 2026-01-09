# Docker & Docker Compose Setup Complete ✅

## Summary of Created Files

### 1. Dockerfiles

All services now have optimized Dockerfiles using Alpine Linux for minimal image size:

| Service                | Location                                     | Port | Size   |
| ---------------------- | -------------------------------------------- | ---- | ------ |
| API Gateway            | `gateway/Dockerfile`                         | 3000 | ~200MB |
| Auth Service           | `services/auth-service/Dockerfile`           | 3001 | ~200MB |
| Event Service          | `services/event-service/Dockerfile`          | 3002 | ~200MB |
| Attendance Service     | `services/attendance-service/Dockerfile`     | 3003 | ~200MB |
| Venue Consumer Service | `services/venue-consumer-service/Dockerfile` | 3004 | ~200MB |

**Features:**

- Alpine Linux base (lightweight)
- Non-root user execution (security)
- Health checks built-in
- dumb-init for proper signal handling
- Production-ready configuration

### 2. Docker Compose Orchestration

**File:** `docker-compose.yml`

Manages all services including:

- PostgreSQL 15 database
- Network isolation (bridge network)
- Volume persistence for database
- Dependency management
- Health checks
- Environment variable injection

**Key Features:**

- Automatic service discovery (DNS resolution between containers)
- Health check endpoints verify service readiness
- Services automatically restart on failure
- Database data persists in named volume

### 3. Configuration Files

| File            | Purpose                                 |
| --------------- | --------------------------------------- |
| `.env.docker`   | Example Docker environment variables    |
| `.dockerignore` | Files excluded from Docker builds       |
| `.env.example`  | Original environment template (updated) |

### 4. Management Scripts

**Bash (Linux/Mac):** `docker-manage.sh`

```bash
chmod +x docker-manage.sh
./docker-manage.sh up      # Start all services
./docker-manage.sh logs -f # View live logs
./docker-manage.sh shell gateway # Access gateway shell
```

**Windows Batch:** `docker-manage.bat`

```batch
docker-manage.bat up       # Start all services
docker-manage.bat logs     # View logs
docker-manage.bat shell gateway # Access gateway shell
```

### 5. Documentation

| File                      | Content                             |
| ------------------------- | ----------------------------------- |
| `docs/DOCKER_SETUP.md`    | Complete Docker guide with examples |
| `DOCKER_SETUP_SUMMARY.md` | Quick reference                     |

---

## Getting Started

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git

### Step 1: Configure Environment

```bash
# Copy Docker environment template
cp .env.docker .env

# Edit .env with your values (especially JWT_SECRET and passwords)
```

### Step 2: Build & Start

```bash
# Option A: Using docker-compose directly
docker-compose build
docker-compose up -d

# Option B: Using management script (recommended)
./docker-manage.sh up  # Bash/Linux/Mac
docker-manage.bat up   # Windows
```

### Step 3: Verify

```bash
# Check service status
docker-compose ps

# Test gateway
curl http://localhost:3000/health

# View logs
docker-compose logs -f gateway
```

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│              Host Machine (Docker)               │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │   Docker Bridge Network: titiktemu-network  │ │
│  │                                             │ │
│  │  ┌─────────┐  ┌─────────────────────────┐ │ │
│  │  │    DB   │  │   API Gateway           │ │ │
│  │  │  Port   │  │   Port 3000 (exposed)   │ │ │
│  │  │  5432   │  └────────────┬────────────┘ │ │
│  │  │         │               │              │ │
│  │  └────┬────┘   ┌───────────┴──────────┐  │ │
│  │       │        │                      │  │ │
│  │       │    ┌──────────────────────────┴─┐│ │
│  │       │    │  Microservices            ││ │
│  │       │    │  ┌──────────────────────┐ ││ │
│  │       ├────┼─→│ Auth Service (3001)  │ ││ │
│  │       │    │  └──────────────────────┘ ││ │
│  │       │    │  ┌──────────────────────┐ ││ │
│  │       ├────┼─→│ Event Service (3002) │ ││ │
│  │       │    │  └──────────────────────┘ ││ │
│  │       │    │  ┌──────────────────────┐ ││ │
│  │       ├────┼─→│ Attendance (3003)    │ ││ │
│  │       │    │  └──────────────────────┘ ││ │
│  │       │    │  ┌──────────────────────┐ ││ │
│  │       └────┼─→│ Venue Service (3004) │ ││ │
│  │            │  └──────────────────────┘ ││ │
│  │            └──────────────────────────┘ │ │
│  │                                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└──────────────────────────────────────────────────┘
```

---

## Common Operations

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v

# Restart specific service
docker-compose restart auth-service
```

### View Logs

```bash
# All services
docker-compose logs

# Follow in real-time
docker-compose logs -f

# Specific service
docker-compose logs -f gateway

# Last 100 lines
docker-compose logs --tail=100
```

### Database Operations

```bash
# Access database CLI
docker-compose exec postgres psql -U titiktemu -d titiktemu_db

# Backup database
docker-compose exec postgres pg_dump -U titiktemu titiktemu_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U titiktemu titiktemu_db < backup.sql

# List all tables
docker-compose exec postgres psql -U titiktemu -d titiktemu_db -c "\dt"
```

### Service Debugging

```bash
# Access service shell
docker-compose exec gateway sh

# View service logs
docker-compose logs auth-service

# Check service health
curl http://localhost:3001/health

# Monitor resource usage
docker stats
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Update `.env` with production values
- [ ] Change `JWT_SECRET` to a secure random string (32+ chars)
- [ ] Set strong database password
- [ ] Configure `NODE_ENV=production`
- [ ] Set up proper `LOGE_GRAPHQL_URL`
- [ ] Test all health endpoints
- [ ] Backup strategy for database volumes
- [ ] Monitor container logs and metrics
- [ ] Set up container registry (Docker Hub, ECR, etc.)
- [ ] Consider Kubernetes or Docker Swarm for orchestration

---

## Environment Variables Reference

### Critical Variables

```env
JWT_SECRET=min-32-characters-random-string
DB_PASSWORD=strong-password
NODE_ENV=production
```

### Service URLs (Docker internal)

```env
AUTH_SERVICE_URL=http://auth-service:3001
EVENT_SERVICE_URL=http://event-service:3002
ATTENDANCE_SERVICE_URL=http://attendance-service:3003
VENUE_SERVICE_URL=http://venue-consumer-service:3004
```

### External Integrations

```env
LOGE_GRAPHQL_URL=http://your-loge-server:4000/graphql
```

See `.env.docker` and `docs/DOCKER_SETUP.md` for complete reference.

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs auth-service

# Verify ports aren't in use
netstat -an | grep LISTEN  # Mac/Linux
netstat -ano | find "LISTEN"  # Windows
```

### Database Connection Failed

```bash
# Test database connectivity
docker-compose exec postgres pg_isready -U titiktemu

# Check database exists
docker-compose exec postgres psql -U titiktemu -d titiktemu_db -c "SELECT 1"
```

### Health Checks Failing

```bash
# Manually test endpoint
curl -v http://localhost:3000/health

# Check service logs
docker-compose logs -f gateway

# Ensure health endpoint exists in service code
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | find ":3000"  # Windows

# Kill process or change port in docker-compose.yml
```

---

## Performance Tips

1. **Use Docker Compose Profiles** - Start only needed services
2. **Implement Caching** - Add cache directives in Dockerfile
3. **Resource Limits** - Set CPU/memory limits per service
4. **Database Optimization** - Add indexes, optimize queries
5. **Monitoring** - Use `docker stats` to track resource usage

---

## Next Steps

1. ✅ Review configuration in `.env.docker`
2. ✅ Run `docker-compose build` to build all images
3. ✅ Run `docker-compose up -d` to start services
4. ✅ Test with `curl http://localhost:3000/health`
5. ✅ Check logs with `docker-compose logs -f`
6. ✅ Access database if needed: `docker-compose exec postgres psql -U titiktemu -d titiktemu_db`

For detailed documentation, see [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md).

---

## Support

For issues or questions:

- Check `docs/DOCKER_SETUP.md` for detailed documentation
- Review `docker-compose.yml` configuration
- Check service logs: `docker-compose logs [service-name]`
- Verify environment variables in `.env`
