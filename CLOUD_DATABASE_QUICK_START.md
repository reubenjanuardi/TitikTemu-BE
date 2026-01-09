# Cloud Database Quick Reference

## 🚀 Quick Setup (Supabase Example)

### 1. Create Supabase Project

```
1. Go to supabase.com
2. Click "New Project"
3. Name: titiktemu-prod
4. Set strong password
5. Choose region
6. Wait 2-3 minutes
```

### 2. Get Connection String

```
1. In Supabase dashboard, click "Connect"
2. Select "URI"
3. Copy (looks like): postgresql://postgres.xxxxx:password@aws-0-xxxxx.pooling.supabase.co:6543/postgres
```

### 3. Create Schemas

```bash
# Connect to your database
psql postgresql://postgres.xxxxx:password@your-host:6543/postgres

# Create schemas (paste into psql):
CREATE SCHEMA auth_schema;
CREATE SCHEMA event_schema;
CREATE SCHEMA attendance_schema;
\q
```

### 4. Update Configuration

```bash
# Copy cloud environment file
cp .env.cloud .env

# Edit .env - replace the DATABASE_URLs with your actual credentials
# Or use docker-compose.cloud.yml instead of docker-compose.yml
```

### 5. Deploy

```bash
# Option A: Using docker-compose.cloud.yml (cloud DB only)
docker-compose -f docker-compose.cloud.yml build
docker-compose -f docker-compose.cloud.yml up -d

# Option B: Keep docker-compose.yml but update .env
docker-compose build
docker-compose up -d
```

---

## 📋 Connection String Format by Provider

### Supabase

```
postgresql://postgres.xxxxx:password@aws-0-region.pooling.supabase.co:6543/postgres?schema=auth_schema
                    ↑           ↑      ↑                                      ↑                      ↑
                 username    password  host                                   port              schema
```

### AWS RDS

```
postgresql://admin:password@titiktemu-db.xxxxx.us-east-1.rds.amazonaws.com:5432/postgres?schema=auth_schema
```

### Azure Database for PostgreSQL

```
postgresql://pgadmin@titiktemu:password@titiktemu.postgres.database.azure.com:5432/postgres?schema=auth_schema
```

### Google Cloud SQL

```
postgresql://postgres:password@35.xxx.xxx.xxx:5432/postgres?schema=auth_schema
```

### DigitalOcean

```
postgresql://doadmin:password@db-xxxxx.db.ondigitalocean.com:25060/postgres?schema=auth_schema
```

---

## 🔧 Which File to Use?

### Local PostgreSQL (Original)

```bash
# Use the original files
docker-compose.yml
.env.docker
```

### Cloud PostgreSQL

```bash
# Option 1: Use cloud-specific files (recommended)
docker-compose.cloud.yml
.env.cloud

# Option 2: Modify original files
docker-compose.yml (remove postgres service)
.env (update DATABASE_URLs)
```

---

## 📊 Environment Variables

### Minimal Configuration

```env
# Just these 3 environment variables needed:
AUTH_DATABASE_URL=postgresql://...?schema=auth_schema
EVENT_DATABASE_URL=postgresql://...?schema=event_schema
ATTENDANCE_DATABASE_URL=postgresql://...?schema=attendance_schema
JWT_SECRET=your-32-char-secret
```

### Full Configuration

```env
# All environment variables:
NODE_ENV=production
AUTH_DATABASE_URL=...
EVENT_DATABASE_URL=...
ATTENDANCE_DATABASE_URL=...
JWT_SECRET=...
AUTH_SERVICE_URL=http://auth-service:3001
EVENT_SERVICE_URL=http://event-service:3002
ATTENDANCE_SERVICE_URL=http://attendance-service:3003
VENUE_SERVICE_URL=http://venue-consumer-service:3004
LOGE_GRAPHQL_URL=...
```

---

## 🔐 Security Checklist

- [ ] DATABASE_URL is NOT in version control
- [ ] Use 32+ character JWT_SECRET
- [ ] Enable SSL/TLS in cloud database
- [ ] Restrict IP access if possible
- [ ] Use strong password (30+ chars)
- [ ] Enable database backups
- [ ] Test restore procedure
- [ ] Rotate credentials every 6 months
- [ ] Use connection pooling
- [ ] Monitor access logs

---

## 🚀 Running Services

### Using docker-compose.cloud.yml

```bash
# Copy environment
cp .env.cloud .env

# Edit .env with your cloud credentials

# Build
docker-compose -f docker-compose.cloud.yml build

# Start
docker-compose -f docker-compose.cloud.yml up -d

# View
docker-compose -f docker-compose.cloud.yml ps

# Logs
docker-compose -f docker-compose.cloud.yml logs -f

# Stop
docker-compose -f docker-compose.cloud.yml down
```

### Using modified docker-compose.yml

```bash
# Remove postgres service from docker-compose.yml
# Update DATABASE_URLs in .env

# Then use normal commands:
docker-compose build
docker-compose up -d
docker-compose ps
docker-compose logs -f
```

---

## 🐛 Troubleshooting

### "Connection refused"

```bash
# 1. Check DATABASE_URL is correct
# 2. Verify host is reachable
# 3. Check firewall/security rules
# 4. Test locally:
psql "your-database-url"
```

### "Too many connections"

```bash
# Add connection pooling
# In connection string, change port:
# Supabase: use port 6543 (pgbouncer pooling)
# Others: use PgBouncer or RDS Proxy
```

### "SSL certificate error"

```bash
# Add SSL mode to connection string:
postgresql://user:pass@host:port/db?sslmode=require
```

### "Authentication failed"

```bash
# Check credentials:
# - Username is correct
# - Password is correct (check for special chars)
# - Database exists
# - User has permission
```

---

## 📈 Monitoring Cloud Database

### Supabase

- Dashboard shows real-time stats
- Monitor → Database → View performance
- Auto-backups every 24 hours

### AWS RDS

- CloudWatch → RDS Dashboard
- Can see CPU, connections, queries
- Automated backups (default 7 days)

### Azure

- Azure Portal → Databases → Performance insights
- Monitor query performance
- Automated backups

### Google Cloud SQL

- Cloud Console → Cloud SQL → Instance
- View CPU, connections, storage
- Automated backups

---

## 💰 Cost Comparison

| Provider         | Free Tier      | Paid Start |
| ---------------- | -------------- | ---------- |
| Supabase         | 500 MB DB      | $25/month  |
| AWS RDS          | 12 months free | $50/month  |
| Azure            | $5 free credit | $50/month  |
| Google Cloud SQL | $300 credit    | $50/month  |
| DigitalOcean     | No             | $50/month  |

---

## 🆚 Local vs Cloud Comparison

| Feature     | Local Docker | Cloud (Supabase) |
| ----------- | ------------ | ---------------- |
| Setup time  | 2 min        | 10 min           |
| Cost        | Free         | $25/month        |
| Backups     | Manual       | Auto             |
| Scaling     | Manual       | Auto             |
| Downtime    | Possible     | < 0.1%           |
| Access      | Local only   | Anywhere         |
| Monitoring  | Docker stats | Dashboard        |
| Development | Easy         | Easy             |
| Production  | Limited      | Ready            |

---

## ✅ Deployment Checklist

- [ ] Cloud database created
- [ ] Connection string copied
- [ ] Schemas created (auth_schema, event_schema, attendance_schema)
- [ ] .env or .env.cloud updated
- [ ] docker-compose file updated (or using docker-compose.cloud.yml)
- [ ] Services build successfully
- [ ] Services start successfully (`docker-compose ps` shows all Up)
- [ ] Database connection working
- [ ] Health endpoints respond (curl http://localhost:3000)
- [ ] Logs show no errors

---

## 📚 Full Documentation

For complete details, see: [docs/CLOUD_DATABASE_SETUP.md](../docs/CLOUD_DATABASE_SETUP.md)

---

**Ready to use cloud database?** Follow the 5-step quick setup above!
