# Production Deployment Guide - Toyota Incentive Calculator

## Quick Start

```bash
# 1. Prepare environment
cp .env.prod.example .env.prod
nano .env.prod  # Edit with production values

# 2. Deploy
bash scripts/deploy.sh deploy

# 3. Check health
bash scripts/health-check.sh
```

## Production Configuration Files

### `docker-compose.prod.yml`
Extends the base `docker-compose.yml` with production-specific settings:

- **No Local Database**: Uses RDS (AWS Relational Database Service)
- **No Volume Mounts**: Uses built Docker images only (no hot reload)
- **Resource Limits**: 
  - Backend: 512MB RAM
  - Frontend: 256MB RAM
  - Nginx: 256MB RAM
- **Restart Policy**: All services restart automatically on failure
- **Logging**: JSON file driver with 10MB max size, 3 file rotation
- **No Direct Ports**: Services only communicate via Nginx

### `.env.prod`
Production environment configuration:

```bash
# Database (RDS)
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/incentive_db

# Application
ENVIRONMENT=production
SECRET_KEY=<32+ character random key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Frontend
VITE_API_URL=https://your-domain.com/api

# Security
SECURE_COOKIES=true
HTTPS_ONLY=true
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│  User Browser / Mobile App                              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
     ┌───────────────▼───────────────┐
     │  CloudFront / CDN              │
     │  (Static Assets Caching)       │
     └───────────────┬───────────────┘
                     │
     ┌───────────────▼───────────────┐
     │  Application Load Balancer     │
     │  (Route 53 → ALB)              │
     └───────────────┬───────────────┘
                     │ HTTP
     ┌───────────────▼───────────────┐
     │  EC2 / ECS Instance            │
     │  ┌──────────────────────────┐  │
     │  │ Docker Compose           │  │
     │  │ ┌────────┐ ┌──────────┐ │  │
     │  │ │ Nginx  │ │ Frontend │ │  │
     │  │ └───┬────┘ └──────────┘ │  │
     │  │     │                   │  │
     │  │     └──────┬────────────┤  │
     │  │ ┌──────────▼──┐         │  │
     │  │ │  Backend    │         │  │
     │  │ │  (FastAPI)  │         │  │
     │  │ └──────────┬──┘         │  │
     │  └────────────┼────────────┘  │
     └───────────────┼───────────────┘
                     │ SQL
     ┌───────────────▼───────────────┐
     │  AWS RDS PostgreSQL            │
     │  (Multi-AZ / Automated Backups)│
     └────────────────────────────────┘
```

## Deployment Scenarios

### Scenario 1: Fresh Deployment

```bash
# Setup environment
cp .env.prod.example .env.prod
# Edit .env.prod with RDS endpoint and credentials

# Run deployment
bash scripts/deploy.sh deploy

# Verify
bash scripts/health-check.sh
```

### Scenario 2: Update Application (No Database Changes)

```bash
# Pull latest code
git pull origin main

# Deploy with rolling updates
bash scripts/deploy.sh deploy
```

### Scenario 3: Database Schema Changes

```bash
# Deploy will run migrations automatically
# Alembic will handle schema migrations safely
bash scripts/deploy.sh deploy
```

### Scenario 4: Emergency Rollback

```bash
# Rollback to previous version
bash scripts/deploy.sh rollback

# Verify rollback
bash scripts/health-check.sh
```

## Key Features

### ✅ High Availability
- Multi-AZ RDS database
- Auto-restart for failed containers
- Load balancer for traffic distribution
- CDN for static assets

### ✅ Security
- HTTPS/TLS encryption
- Environment-based configuration
- JWT token authentication
- SQL injection prevention via ORM
- CORS configuration

### ✅ Monitoring & Logging
- CloudWatch logs (10MB rotating files)
- Health check endpoints
- Performance monitoring
- Automated alerts

### ✅ Disaster Recovery
- Automated daily RDS backups (30-day retention)
- Point-in-time recovery capability
- Docker image versioning
- Deployment rollback capability

### ✅ Cost Optimization
- t3.micro RDS instance (~$20/month)
- t3.small EC2 instance (~$10/month)
- Spot instances for non-critical workloads
- Auto-scaling based on load

## Environment Variables Reference

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@rds-host/db` | Database connection |
| `ENVIRONMENT` | Yes | `production` | Application environment |
| `SECRET_KEY` | Yes | `<random-32+ chars>` | JWT signing key |
| `ALGORITHM` | No | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `480` | Token expiration |
| `VITE_API_URL` | Yes | `https://api.domain.com` | Frontend API URL |
| `SECURE_COOKIES` | No | `true` | Enable secure flag |
| `HTTPS_ONLY` | No | `true` | Redirect HTTP to HTTPS |

## Troubleshooting

### Containers Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check resource constraints
docker stats

# Verify environment variables
docker-compose config | head -50
```

### Database Connection Error

```bash
# Verify RDS endpoint
nslookup your-rds-endpoint.amazonaws.com

# Check security groups
# - RDS security group must allow port 5432 from app server
# - App server must be in same VPC or whitelisted

# Test connection
psql -h your-rds-endpoint -U dbuser -d incentive_db
```

### High Memory Usage

```bash
# Check which container uses most memory
docker stats --no-stream

# Adjust limits in docker-compose.prod.yml
# Restart: docker-compose restart <service>
```

### Slow Performance

```bash
# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 300 \
  --statistics Average

# Check slow queries
docker-compose exec backend \
  psql $DATABASE_URL -c "\
    SELECT query, calls, mean_time \
    FROM pg_stat_statements \
    ORDER BY mean_time DESC LIMIT 10;"
```

### Deployment Fails

```bash
# Check deployment log
tail -f deployment-logs/deployment_*.log

# Check if previous deployment is still running
docker-compose ps

# Force cleanup and redeploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -v
bash scripts/deploy.sh deploy
```

## Monitoring Dashboard

### Create CloudWatch Dashboard

```bash
# View application metrics
aws cloudwatch get-dashboard --dashboard-name incentive-prod

# Create custom metric
aws cloudwatch put-metric-data \
  --namespace incentive/app \
  --metric-name ActiveUsers \
  --value 100
```

### Setup Alarms

```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name high-cpu-usage \
  --alarm-description "Alert when CPU usage is high" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:region:account:topic

# RDS database connection alarm
aws cloudwatch put-metric-alarm \
  --alarm-name high-db-connections \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

## Maintenance Tasks

### Daily Tasks
- ✓ Monitor health checks
- ✓ Review CloudWatch logs
- ✓ Check disk space usage

### Weekly Tasks
- ✓ Create manual RDS snapshot
- ✓ Review slow query logs
- ✓ Update security groups if needed

### Monthly Tasks
- ✓ Update Docker base images
- ✓ Review and optimize costs
- ✓ Test disaster recovery procedures
- ✓ Rotate SSL certificates (if needed)

## Scaling Guidelines

### Vertical Scaling (Larger Instances)

```bash
# Increase EC2 instance type (requires stop/start)
aws ec2 stop-instances --instance-ids i-xxxxx
# Change instance type in AWS console
aws ec2 start-instances --instance-ids i-xxxxx
```

### Horizontal Scaling (Multiple Instances)

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
    ports:
      - "8001:8000"
      - "8002:8000"
      - "8003:8000"
```

### Auto-Scaling with ECS

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-def.json

# Create service with auto-scaling
aws ecs create-service \
  --cluster incentive-prod \
  --service-name backend \
  --task-definition incentive-backend:1 \
  --desired-count 3 \
  --launch-type FARGATE
```

## Performance Optimization

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_sales_by_month ON sales_entries(year, month);
CREATE INDEX idx_user_email ON users(email);

-- Monitor query performance
SELECT query, calls, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Caching Strategy
- Frontend: CloudFront for static assets (24h TTL)
- API: Redis cache for frequently accessed data
- Database: Connection pooling (already configured)

### Network Optimization
- Enable gzip compression (Nginx configured)
- CDN for static files
- API response caching headers

## Disaster Recovery Plan

### Backup Strategy
- **RDS Automated Backups**: Every night, 30-day retention
- **Manual Snapshots**: Weekly, retained for 90 days
- **Application Code**: Git repository with release tags
- **Configuration**: Backed up in Secrets Manager

### Recovery Time Objectives (RTO)
- **Full Recovery**: < 2 hours
- **Database Failover**: < 5 minutes
- **Application Restart**: < 2 minutes

### Recovery Procedures

**1. Database Recovery**
```bash
# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier incentive-recovered \
  --db-snapshot-identifier incentive-prod-snapshot-20240115
```

**2. Application Recovery**
```bash
# Rollback deployment
bash scripts/deploy.sh rollback
```

**3. Complete Infrastructure Recovery**
```bash
# Redeploy from scratch
bash scripts/deploy.sh deploy
```

## Security Checklist

- [ ] Secret key is 32+ random characters
- [ ] Database password is strong (16+ chars, mixed case, numbers, symbols)
- [ ] RDS is in private subnet
- [ ] Security groups restrict access properly
- [ ] SSL certificate is valid and not expired
- [ ] HTTPS is enforced (redirect HTTP)
- [ ] CORS is configured for your domain only
- [ ] Environment variables are not in git repository
- [ ] IAM roles have least privilege access
- [ ] MFA is enabled for AWS console access
- [ ] CloudTrail is enabled for audit logging
- [ ] Regular security updates are applied

## Support & Escalation

### Issues & Resolution

| Issue | Resolution |
|-------|-----------|
| Service won't start | Check logs: `docker-compose logs backend` |
| High memory usage | Increase limits or scale horizontally |
| Database connection errors | Check security groups and RDS endpoint |
| Slow API responses | Check CloudWatch metrics and slow query logs |
| Deployment fails | Review deployment log and rollback if needed |

### Contact Information
- **DevOps Lead**: devops@company.com
- **Database Admin**: dba@company.com
- **Security Team**: security@company.com

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

**Last Updated**: May 28, 2024  
**Version**: 1.0.0  
**Status**: Production Ready
