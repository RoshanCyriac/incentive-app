# Getting Started with Toyota Incentive Calculator

Welcome! This guide will help you get started with the Toyota Incentive Calculator application.

## 📍 Quick Navigation

### 🏆 For Production Deployment
**Start here if you're deploying to production**:
1. Read [PRODUCTION.md](./PRODUCTION.md) (15 minutes)
2. Follow the checklist: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
3. Run deployment: `bash scripts/deploy.sh deploy`
4. Verify: `bash scripts/health-check.sh`

### 💻 For Local Development
**Start here for local development**:
1. Clone the repo: `git clone <repo>`
2. Read [Development Setup](#development-setup) below
3. Backend: `cd backend && python -m pytest tests/`
4. Frontend: `cd frontend && npm run dev`

### 🚀 For AWS Infrastructure
**Detailed AWS setup (RDS, ALB, CloudFront, etc.)**:
- See [DEPLOYMENT.md](./DEPLOYMENT.md)

### 📊 For Project Overview
**Executive summary and architecture**:
- See [PRODUCTION_SUMMARY.md](./PRODUCTION_SUMMARY.md)

---

## 🚀 Quick Start (5 minutes)

### Option 1: Docker (Recommended)

```bash
# Start development environment
docker-compose up -d

# Access
Frontend: http://localhost
API: http://localhost/api
Docs: http://localhost/api/docs
```

### Option 2: Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m pytest tests/  # Verify all tests pass
export DATABASE_URL=sqlite:///./test.db
export SECRET_KEY=dev-secret-key
python -m uvicorn main:app --reload

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

---

## 📚 Documentation Structure

```
README.md                      ← Project overview & quick links
GETTING_STARTED.md            ← This file - quick navigation guide
PRODUCTION.md                 ← 🏆 MAIN PRODUCTION GUIDE (Start here!)
PRODUCTION_SUMMARY.md         ← Executive summary & checklist
DEPLOYMENT.md                 ← Detailed AWS infrastructure setup
DEPLOYMENT_CHECKLIST.md       ← Pre/post deployment tasks
docker-compose.yml            ← Development Docker setup
docker-compose.prod.yml       ← Production Docker setup
.env.example                  ← Development environment template
.env.prod.example             ← Production environment template
scripts/
  └─ deploy.sh               ← Automated deployment (deploy/rollback/health)
  └─ health-check.sh         ← Health monitoring
backend/
  └─ (Python FastAPI app)
frontend/
  └─ (React + Vite app)
```

---

## � Typical Workflows

### Workflow 1: Fresh Production Deployment

```bash
# 1. Prepare
cp .env.prod.example .env.prod
nano .env.prod  # Add RDS endpoint and SECRET_KEY

# 2. Deploy
bash scripts/deploy.sh deploy

# 3. Verify
bash scripts/health-check.sh

# 4. Access
# https://your-domain.com
```

### Workflow 2: Update Application

```bash
# 1. Update code
git pull origin main

# 2. Redeploy
bash scripts/deploy.sh deploy

# 3. Verify
bash scripts/health-check.sh
```

### Workflow 3: Emergency Rollback

```bash
# Rollback immediately
bash scripts/deploy.sh rollback

# Verify
bash scripts/health-check.sh
```

### Workflow 4: Local Development Testing

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend development
cd frontend
npm run dev  # http://localhost:3000

# Both with Docker
docker-compose up -d
```

---

## 📋 System Requirements

### For Local Development
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (optional)
- 2GB RAM minimum
- 5GB disk space

### For Production
- AWS Account
- RDS PostgreSQL 15+
- EC2 instance (t3.small or larger)
- Application Load Balancer
- SSL/TLS certificate

---

## 🔧 Configuration

### Development (.env)
```bash
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=dev-secret-key
VITE_API_URL=http://localhost:8000
```

### Production (.env.prod)
```bash
DATABASE_URL=postgresql://user:pass@rds-host/db
SECRET_KEY=<secure-32-char-key>
VITE_API_URL=https://your-domain.com/api
ENVIRONMENT=production
```

---

## 🧪 Testing

### Run All Tests

```bash
cd backend
python -m pytest tests/test_api.py -v
```

### Test Results
 **20/20 tests passing**
- Authentication tests
- CRUD operations
- Business logic
- Authorization checks

---

## 🚀 Deployment Options

### Option 1: Docker Compose (Simplest)
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Option 2: Manual Scripts (Recommended)
```bash
# Deploy with automated checks
bash scripts/deploy.sh deploy

# Health check
bash scripts/health-check.sh

# Rollback if needed
bash scripts/deploy.sh rollback
```

### Option 3: CI/CD Pipeline
Deploy via GitHub Actions, GitLab CI, or similar (scripts provided)

---

## 🔒 Security Features

 JWT authentication  
 Password hashing (Argon2)  
 Role-based access control  
 HTTPS/TLS encryption  
 CORS protection  
 SQL injection prevention  
 Environment-based secrets  

---

## 📞 Quick Help

### Issue: Port already in use
```bash
# Kill process on port 8000
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Issue: Database connection error
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# For local SQLite
export DATABASE_URL=sqlite:///./test.db
```

### Issue: Tests failing
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Run tests with verbose output
python -m pytest tests/ -vv
```

### Issue: Docker compose error
```bash
# Check if Docker is running
docker ps

# Rebuild images
docker-compose build

# Start fresh
docker-compose down -v
docker-compose up -d
```

---

## 📈 Next Steps

### For Development
1. Read backend README: `cd backend && cat README.md`
2. Read frontend README: `cd frontend && cat README.md`
3. Run tests: `cd backend && python -m pytest tests/`
4. Start dev server: See [Quick Start](#quick-start-5-minutes)

### For Production
1. **Read [PRODUCTION.md](./PRODUCTION.md)** (Main guide)
2. Complete [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
3. Prepare `.env.prod` with RDS endpoint
4. Run: `bash scripts/deploy.sh deploy`
5. Verify: `bash scripts/health-check.sh`

### For Infrastructure
1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for AWS setup
2. Create RDS PostgreSQL instance
3. Setup EC2 instance
4. Configure Application Load Balancer
5. Deploy application

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Docker**: https://docs.docker.com/

---

## 🆘 Support

### I need help with...

| Topic | Resource |
|-------|----------|
| Production deployment | [PRODUCTION.md](./PRODUCTION.md) |
| AWS infrastructure | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Local development | [Development Setup](#development-setup) |
| Testing | See backend/README.md |
| API usage | http://localhost:8000/docs |
| Troubleshooting | [PRODUCTION_SUMMARY.md](./PRODUCTION_SUMMARY.md#-troubleshooting-quick-reference) |

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Docker containers running: `docker-compose ps`
- [ ] Backend responding: `curl http://localhost/api/health`
- [ ] Frontend accessible: `curl http://localhost/`
- [ ] Tests passing: `cd backend && pytest tests/`
- [ ] Login works: Try login at http://localhost

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: May 28, 2024

Questions? Check the relevant documentation file above!
