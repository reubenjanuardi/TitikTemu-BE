# Docker Setup Guide for TitikTemu

## Overview

This guide explains how to containerize and deploy TitikTemu microservices using Docker and Docker Compose.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git

## Quick Start

### 1. Clone and Setup

```bash
cd TitikTEMU-Backend
cp .env.docker .env
```

### 2. Configure Environment Variables

Edit `.env` file with your settings:

```env
NODE_ENV=production
DB_USER=titiktemu
DB_PASSWORD=your_secure_password
DB_NAME=titiktemu_db
JWT_SECRET=your-32-character-minimum-secret-key
```

### 3. Build and Start Services

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f gateway
docker-compose logs -f auth-service
```

### 4. Verify Services

```bash
# Check service status
docker-compose ps

# Test gateway health
curl http://localhost:3000/health

# Test auth service
curl http://localhost:3001/health
```

## Architecture

```
┌─────────────────────────────────────────────┐
│         Docker Host                         │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │     Docker Bridge Network             │  │
│  │   (titiktemu-network)                │  │
│  │                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │  PostgreSQL  │  │   Gateway    │ │  │
│  │  │  :5432       │  │   :3000      │ │  │
│  │  └──────────────┘  └──────────────┘ │  │
│  │        ▲                    │        │  │
│  │        │                    │        │  │
│  │  ┌─────┴─────────────────────┴─────┐ │  │
│  │  │  Auth, Event, Attendance,  │    │ │  │
│  │  │  Venue Services            │    │ │  │
│  │  │  :3001-3004                │    │ │  │
│  │  └────────────────────────────┘    │  │
│  │                                     │  │
│  └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

## Services & Ports

| Service            | Port | URL                   | Health Check                 |
| ------------------ | ---- | --------------------- | ---------------------------- |
| Gateway            | 3000 | http://localhost:3000 | http://localhost:3000/health |
| Auth Service       | 3001 | http://localhost:3001 | http://localhost:3001/health |
| Event Service      | 3002 | http://localhost:3002 | http://localhost:3002/health |
| Attendance Service | 3003 | http://localhost:3003 | http://localhost:3003/health |
| Venue Service      | 3004 | http://localhost:3004 | http://localhost:3004/health |
| PostgreSQL         | 5432 | localhost:5432        | N/A                          |

## Common Docker Commands

### Start Services

```bash
# Start in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up -d auth-service
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop auth-service
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f gateway

# Last 100 lines
docker-compose logs --tail=100

# Follow mode
docker-compose logs -f auth-service
```

### Database Management

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U titiktemu -d titiktemu_db

# View database schemas
docker-compose exec postgres psql -U titiktemu -d titiktemu_db -c "\dn"

# Backup database
docker-compose exec postgres pg_dump -U titiktemu titiktemu_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U titiktemu titiktemu_db < backup.sql
```

### Rebuild Services

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build auth-service

# Rebuild without cache
docker-compose build --no-cache

# Rebuild and restart
docker-compose up -d --build
```

## Environment Variables

### Required Variables

- `JWT_SECRET` - JWT signing secret (minimum 32 characters)
- `DB_PASSWORD` - PostgreSQL password

### Optional Variables

- `NODE_ENV` - `production` or `development` (default: production)
- `DB_USER` - PostgreSQL user (default: titiktemu)
- `DB_NAME` - Database name (default: titiktemu_db)
- `LOGE_GRAPHQL_URL` - External LOGe GraphQL endpoint

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs auth-service

# Verify port availability
netstat -an | grep 3000
```

### Database Connection Issues

```bash
# Test database connection
docker-compose exec postgres pg_isready -U titiktemu

# Check database
docker-compose exec postgres psql -U titiktemu -d titiktemu_db -c "SELECT 1"
```

### Rebuild Everything

```bash
# Complete reset
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Service Health Checks Failing

```bash
# Run health check manually
docker exec titiktemu_gateway curl http://localhost:3000/health

# Check service logs
docker-compose logs gateway
```

## Performance Optimization

### Resource Limits

Edit `docker-compose.yml` to add resource limits:

```yaml
services:
  auth-service:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
```

### Production Deployment

For production, consider:

1. **Use a Container Registry**

   ```bash
   docker tag titiktemu_gateway myregistry.azurecr.io/titiktemu/gateway:latest
   docker push myregistry.azurecr.io/titiktemu/gateway:latest
   ```

2. **Use Docker Secrets** for sensitive data
3. **Configure Logging** drivers
4. **Enable Container Restart Policies** (already configured)
5. **Set Resource Limits**
6. **Use Volume Backups** for persistence

## Networking

All services communicate via the `titiktemu-network` bridge network:

- **Internal communication**: Use service names (e.g., `http://auth-service:3001`)
- **External communication**: Use localhost with ports (e.g., `http://localhost:3001`)

## Security

- Services run as non-root user (nodejs)
- Health checks verify container readiness
- Environment variables for sensitive data
- Network isolation via bridge network

## Monitoring

```bash
# Monitor container stats
docker stats

# Inspect service
docker-compose exec gateway npm -v

# Check running processes
docker top titiktemu_gateway
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
