# Monitoring & Logging

Guide to monitoring and logging for EZTest.

## Health Checks

### API Health Endpoint

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Automated Health Checks

**Docker Compose healthcheck:**

```yaml
# docker-compose.yml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**External monitoring:**

```bash
# Cron job (every 5 minutes)
*/5 * * * * curl -sf http://localhost:3000/api/health || echo "EzTest is down" | mail -s "Alert" admin@example.com
```

---

## Logging

### Application Logs

**View logs:**
```bash
# All services
docker-compose logs -f

# App only
docker-compose logs -f app

# With timestamps
docker-compose logs -t -f app

# Last N lines
docker-compose logs --tail=100 app
```

**Log locations (inside container):**
- Application output: stdout/stderr
- Next.js logs: stdout

### Database Logs

```bash
# PostgreSQL logs
docker-compose logs -f postgres
```

### Log Levels

Set in environment:
```env
# Development
NODE_ENV=development

# Production (less verbose)
NODE_ENV=production
```

### Structured Logging

For better log analysis, consider adding structured logging:

```typescript
// Example log format
console.log(JSON.stringify({
  level: 'info',
  timestamp: new Date().toISOString(),
  message: 'User logged in',
  userId: 'user-id',
  ip: request.ip,
}));
```

---

## Metrics

### Basic Metrics to Track

| Metric | Description | How to Get |
|--------|-------------|------------|
| Response Time | API response latency | Browser DevTools |
| Error Rate | % of failed requests | Application logs |
| Active Users | Current sessions | Database query |
| Database Size | Storage usage | PostgreSQL |

### Database Metrics

```sql
-- Database size
SELECT pg_database_size('eztest') / 1024 / 1024 AS size_mb;

-- Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'eztest';
```

### Docker Metrics

```bash
# Resource usage
docker stats

# Disk usage
docker system df
```

---

## Alerting

### Basic Alerting Script

```bash
#!/bin/bash
# health-check.sh

HEALTH_URL="http://localhost:3000/api/health"
ALERT_EMAIL="admin@example.com"

response=$(curl -sf $HEALTH_URL)
if [ $? -ne 0 ]; then
    echo "EzTest health check failed at $(date)" | mail -s "EzTest Alert" $ALERT_EMAIL
fi
```

### Cron Setup

```bash
# Check every 5 minutes
*/5 * * * * /path/to/health-check.sh
```

### Third-Party Monitoring

Consider using:
- **Uptime Robot** - Free uptime monitoring
- **Pingdom** - Website monitoring
- **Datadog** - Full observability
- **New Relic** - APM

---

## Log Management

### Log Rotation

**Docker logging:**
```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Centralized Logging

For production, consider:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Loki + Grafana**
- **Papertrail**
- **Loggly**

### Example: Send logs to Papertrail

```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "syslog"
      options:
        syslog-address: "udp://logs.papertrailapp.com:12345"
        tag: "eztest-app"
```

---

## Dashboard Ideas

### Grafana Dashboard

Monitor:
- API response times
- Request count
- Error rate
- Database connections
- Memory usage
- CPU usage

### Simple Status Page

Track:
- ✅ Application Status
- ✅ Database Status
- ✅ Email Service
- ✅ File Storage

---

## Troubleshooting with Logs

### Finding Errors

```bash
# Search for errors
docker-compose logs app | grep -i error

# Search for specific user
docker-compose logs app | grep "user-id"

# Time-based search
docker-compose logs --since="2024-01-15T10:00:00" app
```

### Common Log Patterns

**Successful request:**
```
GET /api/projects 200 45ms
```

**Failed request:**
```
POST /api/auth/login 401 12ms - Invalid credentials
```

**Database error:**
```
Error: Connection refused to database
```

---

## Performance Monitoring

### Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by XHR
4. Check timing for API calls

### Database Query Performance

```sql
-- Slow queries (requires pg_stat_statements)
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Application Performance

Consider adding:
- Request timing middleware
- Database query logging
- Memory usage tracking

---

## Related Documentation

- [Troubleshooting](./troubleshooting.md)
- [Deployment](./deployment/README.md)
- [Configuration](../getting-started/configuration.md)
