# Production Deployment Checklist

**Project**: Toyota Incentive Calculator  
**Date**: May 28, 2024  
**Status**: Ready for Production Deployment

## ✅ Pre-Deployment Checklist

### Infrastructure Setup
- [ ] AWS Account created and configured
- [ ] RDS PostgreSQL instance created (db.t3.micro or larger)
- [ ] EC2 instance created (t3.small or larger)
- [ ] Security groups configured:
  - [ ] EC2 allows ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
  - [ ] RDS allows port 5432 from EC2 security group only
- [ ] Application Load Balancer (ALB) created
- [ ] Route 53 DNS configured
- [ ] SSL/TLS certificate created (AWS Certificate Manager)
- [ ] CloudFront distribution created (optional, for CDN)

### Application Preparation
- [ ] Code pushed to git repository with version tag
- [ ] .env.prod file created with production values:
  - [ ] DATABASE_URL pointing to RDS endpoint
  - [ ] SECRET_KEY generated (min 32 random characters)
  - [ ] VITE_API_URL set to production domain
  - [ ] ENVIRONMENT set to "production"
- [ ] Docker images built and tested locally
- [ ] All 20 tests passing locally
- [ ] Environment variables validated

### Security Verification
- [ ] SECRET_KEY is 32+ characters, random
- [ ] DATABASE_URL uses strong password (16+ chars)
- [ ] RDS encryption at rest enabled
- [ ] SSL certificate valid and installed
- [ ] HTTPS redirect configured
- [ ] Security groups restrict access properly
- [ ] MFA enabled for AWS console
- [ ] IAM roles configured with least privilege
- [ ] CloudTrail enabled for audit logging

### Documentation Review
- [ ] PRODUCTION.md reviewed
- [ ] DEPLOYMENT.md reviewed
- [ ] PRODUCTION_SUMMARY.md reviewed
- [ ] Deployment scripts tested locally
- [ ] Health check script verified

## 🚀 Deployment Steps

### Step 1: Prepare Environment
- [ ] SSH into EC2 instance
- [ ] Clone repository: `git clone <repo>`
- [ ] Copy .env.prod with production values
- [ ] Verify environment variables: `cat .env.prod`

### Step 2: Deploy Application
- [ ] Run deployment: `bash scripts/deploy.sh deploy`
- [ ] Monitor deployment logs
- [ ] Wait for all services to start (2-5 minutes)
- [ ] Verify no errors in logs

### Step 3: Verify Deployment
- [ ] Run health check: `bash scripts/health-check.sh`
- [ ] All checks should pass ✓
- [ ] Test API endpoint: `curl https://your-domain.com/api/health`
- [ ] Test frontend loading: `curl https://your-domain.com/`

### Step 4: Post-Deployment Tests
- [ ] Login test: POST `/api/auth/login` → 200 OK with token
- [ ] Admin endpoints accessible with admin token
- [ ] Officer endpoints accessible with officer token
- [ ] Data persistence verified

### Step 5: Configure Monitoring
- [ ] CloudWatch alarms created:
  - [ ] High CPU utilization
  - [ ] High memory usage
  - [ ] Database connection errors
  - [ ] API errors (5xx)
- [ ] SNS notifications configured
- [ ] PagerDuty or similar integration setup

## 🔄 Post-Deployment Verification

### Day 1
- [ ] All services running without errors
- [ ] No high CPU or memory usage
- [ ] No database connection errors
- [ ] API response times acceptable
- [ ] Users can login successfully
- [ ] Admin features functional
- [ ] Officer features functional

### Week 1
- [ ] Monitor CloudWatch metrics daily
- [ ] Review application logs for errors
- [ ] Verify backups are being taken
- [ ] Test login with multiple users
- [ ] Performance baselines established
- [ ] No security alerts

### Month 1
- [ ] All metrics within acceptable ranges
- [ ] Manual RDS snapshot created
- [ ] Disaster recovery tested
- [ ] Documentation updated if needed
- [ ] Cost analysis performed
- [ ] Performance optimization identified

## 🔄 Rollback Checklist

If deployment fails:
- [ ] Identify error in deployment logs
- [ ] Run: `bash scripts/deploy.sh rollback`
- [ ] Verify rollback successful: `bash scripts/health-check.sh`
- [ ] Test functionality
- [ ] Investigate root cause
- [ ] Fix and redeploy

## 📊 Monitoring Setup

### CloudWatch Metrics to Track
- [ ] CPU Utilization (threshold: 80%)
- [ ] Memory Usage (threshold: 80%)
- [ ] Disk Space (threshold: 90%)
- [ ] Database Connections (threshold: 80% of max)
- [ ] API Response Time (threshold: 500ms p95)
- [ ] Error Rate (threshold: 1%)

### Logs to Review
- [ ] Backend application logs
- [ ] Frontend access logs
- [ ] Nginx error logs
- [ ] Database slow query logs
- [ ] CloudTrail audit logs

### Alerts to Configure
- [ ] Service down alert
- [ ] High error rate alert
- [ ] High latency alert
- [ ] High resource usage alert
- [ ] Database connection errors alert

## 🔐 Security Hardening

### Day 1 After Deployment
- [ ] Verify HTTPS-only enforcement
- [ ] Test CORS configuration
- [ ] Verify JWT token expiration
- [ ] Check password policy
- [ ] Review audit logs

### Week 1
- [ ] Enable WAF (Web Application Firewall)
- [ ] Configure rate limiting
- [ ] Review security groups again
- [ ] Update security headers
- [ ] Test for common vulnerabilities

### Ongoing
- [ ] Monthly security audits
- [ ] Quarterly penetration testing
- [ ] Update Docker images monthly
- [ ] Rotate secrets annually
- [ ] Monitor for CVEs

## 📈 Performance Baseline

Record these metrics after deployment:

```
API Response Times (milliseconds):
- Login: _____ ms
- Get Profile: _____ ms
- List Cars: _____ ms
- Create Sales: _____ ms
- Get Incentive: _____ ms

Database Performance:
- Query time (p95): _____ ms
- Connection pool utilization: ______ %
- Slow queries: _____ count

Infrastructure:
- CPU Usage (baseline): ______ %
- Memory Usage (baseline): ______ %
- Disk Usage (baseline): ______ %
```

## 🆘 Emergency Procedures

### Service Down
1. Check status: `docker-compose ps`
2. View logs: `docker-compose logs -f backend`
3. Restart service: `docker-compose restart backend`
4. If persists: Run `bash scripts/deploy.sh rollback`

### Database Issues
1. Verify connection: `psql $DATABASE_URL -c "SELECT 1;"`
2. Check RDS status in AWS console
3. Review slow query logs
4. Contact DBA if issue persists

### High Resource Usage
1. Identify process: `docker stats`
2. Check application logs for errors
3. Restart affected container: `docker-compose restart <service>`
4. Scale horizontally if load is legitimate

### Security Incident
1. Check CloudTrail logs: `aws cloudtrail lookup-events`
2. Review access logs for suspicious activity
3. Contact security team
4. Consider rotating credentials
5. Document incident

## 📞 Contacts

### Support Escalation

| Issue | Contact | Time |
|-------|---------|------|
| General question | DevOps team | Business hours |
| Performance issue | DBA / DevOps | ASAP |
| Security issue | Security team | ASAP |
| Service down | On-call engineer | ASAP |
| Infrastructure | AWS support | ASAP |

### Useful Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f <service>

# Restart service
docker-compose restart <service>

# Health check
bash scripts/health-check.sh

# Redeploy
bash scripts/deploy.sh deploy

# Rollback
bash scripts/deploy.sh rollback

# Database backup
aws rds create-db-snapshot \
  --db-instance-identifier incentive-prod \
  --db-snapshot-identifier backup-$(date +%Y%m%d-%H%M%S)

# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier incentive-prod \
  --query 'DBInstances[0].[DBInstanceStatus,PendingModifiedValues]'
```

## 📋 Sign-Off

- [ ] Technical Lead Review: _____________ (Date: _______)
- [ ] DevOps Lead Approval: _____________ (Date: _______)
- [ ] Security Team Approval: ___________ (Date: _______)
- [ ] Operations Lead Approval: _________ (Date: _______)

## 📝 Notes

```
Deployment Date: _______________
Deployed By: ____________________
Notes: __________________________
________________________________
________________________________
```

---

**Document Version**: 1.0.0  
**Last Updated**: May 28, 2024  
**Next Review**: June 30, 2024
