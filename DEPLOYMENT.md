# Production Deployment Guide

## Overview

This guide provides instructions for deploying the Toyota Incentive Calculator application to production using Docker Compose with AWS services.

## Prerequisites

- Docker & Docker Compose v2.0+
- AWS Account with:
  - RDS PostgreSQL instance
  - ECR (Elastic Container Registry) for private images
  - EC2 instance or ECS cluster
  - Application Load Balancer (ALB) or CloudFront
- SSL/TLS certificate (AWS Certificate Manager or similar)

## Architecture

```
User → Route 53 (DNS) → CloudFront/ALB
                           ↓
                    Nginx (Reverse Proxy)
                     ↙              ↘
              Frontend (React)    Backend (FastAPI)
                                     ↓
                            RDS PostgreSQL
```

## Deployment Steps

### 1. Prepare Production Environment

```bash
# Clone the repository
git clone <your-repo> incentive-app
cd incentive-app

# Create production environment file
cp .env.prod.example .env.prod

# Edit with production values
nano .env.prod
```

### 2. Configure AWS RDS Database

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier incentive-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.2 \
  --master-username dbadmin \
  --master-user-password "<strong-password>" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxx \
  --backup-retention-period 30 \
  --multi-az

# Get the RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier incentive-prod \
  --query 'DBInstances[0].Endpoint.Address'
```

### 3. Build Production Images

```bash
# Build backend image
docker build -t incentive-backend:latest ./backend

# Build frontend image
docker build -t incentive-frontend:latest ./frontend

# Push to ECR (optional but recommended)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag incentive-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/incentive-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/incentive-backend:latest

docker tag incentive-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/incentive-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/incentive-frontend:latest
```

### 4. Run Database Migrations

```bash
# Create migrations container
docker run --rm \
  --env-file .env.prod \
  --network host \
  incentive-backend:latest \
  alembic upgrade head
```

### 5. Deploy Application

```bash
# Set production environment
export $(cat .env.prod | xargs)

# Start services with production compose config
docker-compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### 6. Configure Load Balancer

**Using AWS Application Load Balancer (ALB):**

```bash
# Create target group for backend
aws elbv2 create-target-group \
  --name incentive-backend \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-xxxxx \
  --health-check-path /health \
  --health-check-interval-seconds 30

# Create listener rule
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --priority 1 \
  --conditions Field=path-pattern,Values="/api/*" \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

### 7. SSL/TLS Configuration

**Using AWS Certificate Manager:**

```bash
# Request certificate
aws acm request-certificate \
  --domain-name your-domain.com \
  --subject-alternative-names www.your-domain.com \
  --validation-method DNS

# Add HTTPS listener to ALB
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:...
```

## Monitoring & Logging

### CloudWatch Logs

```bash
# Create log group
aws logs create-log-group --log-group-name /incentive/backend

# View logs
aws logs tail /incentive/backend --follow
```

### Application Monitoring

```bash
# Check backend health
curl https://your-domain.com/api/health

# Check database connection
curl https://your-domain.com/api/health
```

## Database Backups

```bash
# Enable automated backups (already configured in RDS)
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier incentive-prod \
  --db-snapshot-identifier incentive-prod-snapshot-$(date +%Y%m%d)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier incentive-prod
```

## Scaling

### Horizontal Scaling (Multiple Instances)

```yaml
# Use docker-compose with multiple replicas
services:
  backend:
    deploy:
      replicas: 3
```

### Auto-scaling with ECS

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name incentive-prod

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service with auto-scaling
aws ecs create-service \
  --cluster incentive-prod \
  --service-name backend \
  --task-definition incentive-backend \
  --desired-count 3 \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=8000
```

## Disaster Recovery

### Backup Strategy

- **RDS Automated Backups**: 30-day retention
- **Weekly Snapshots**: Manual snapshots every Sunday
- **Application Code**: Git repository with tags for releases

### Recovery Procedures

```bash
# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier incentive-recovered \
  --db-snapshot-identifier incentive-prod-snapshot-20240101

# Restore from ECR images
docker pull <account-id>.dkr.ecr.us-east-1.amazonaws.com/incentive-backend:v1.0.0
```

## Security Best Practices

1. **Network Security**
   - Use VPC with private subnets for database
   - Security groups: Only allow necessary ports
   - Enable VPC Flow Logs

2. **Data Security**
   - Enable RDS encryption at rest
   - Use Secrets Manager for credentials
   - Enable SSL for database connections

3. **Application Security**
   - HTTPS only (redirect HTTP to HTTPS)
   - Security headers via Nginx
   - Regular security updates

4. **Access Control**
   - IAM roles for service authentication
   - Secrets Vault for credential management
   - MFA for AWS Console access

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs backend

# Check resource limits
docker stats

# Verify environment variables
docker-compose config | grep ENVIRONMENT
```

### Database Connection Issues

```bash
# Test RDS connectivity
docker run --rm --network host \
  -e PGPASSWORD=$POSTGRES_PASSWORD \
  postgres:15 \
  psql -h $RDS_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1"
```

### Performance Issues

```bash
# Monitor CPU and memory
docker stats --no-stream

# Check database query performance
docker-compose exec backend \
  psql $DATABASE_URL -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

## Rollback Procedures

```bash
# Revert to previous image version
docker-compose down
export IMAGE_TAG=v1.0.0
docker-compose up -d

# Database rollback (from snapshot)
aws rds restore-db-instance-from-db-snapshot ...
```

## Cost Optimization

- Use t3.micro RDS for small workloads (~$20/month)
- Use EC2 t3.nano for application server (~$5/month)
- Enable S3 lifecycle policies for log archival
- Use CloudFront for static asset caching
- Reserved Instances for predictable workloads

## Support & Maintenance

- **Logs Location**: CloudWatch `/incentive/backend`, `/incentive/frontend`
- **Monitoring Dashboard**: AWS CloudWatch custom dashboards
- **Alerting**: SNS notifications for critical events
- **On-call**: Set up PagerDuty integration for alerting

## Version Control

Tag releases and maintain deployment history:

```bash
# Tag a release
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# Checkout and deploy specific version
git checkout v1.0.0
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
