# Toyota Incentive Calculator

## Application URL

https://toyota-incentive.duckdns.org

## Admin Login Credentials

| Field | Value |
|-------|-------|
| Email | `admin@toyota.com` |
| Username | `admin` |
| Password | `Admin@123` |

## Instructions

1. Open the application URL.
2. Log in with email `admin@toyota.com` and the password above.
3. Navigate to the Admin Dashboard.
4. Configure incentive slabs if required.
5. Add officers and assign vehicle models.
6. View incentive calculations and reports from the dashboard.
7. Use the Logout option after testing.

## Features to Test

- Admin login
- Officer management
- Vehicle model management
- Incentive slab configuration
- Incentive calculation
- Reports / dashboard

## Notes

- Best viewed on Chrome, Edge, or Firefox.
- Internet connection required.
- HTTPS enabled.

## Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@toyota.com` |
| Username | `admin` |
| Password | `Admin@123` |

**Please change the password after first login.**

---

## Developer Documentation

A full-stack application for managing and calculating vehicle sales incentives (FastAPI, React, PostgreSQL).

### Quick Start (Local)

```bash
git clone <your-repo> incentive-app
cd incentive-app

# Docker
docker-compose up -d
curl http://localhost/api/health
```

### Production Deployment

```bash
cp .env.prod.example .env.prod
# Edit .env.prod with your production values

bash scripts/deploy.sh deploy
bash scripts/health-check.sh
```

### Documentation

| Document | Purpose |
|----------|---------|
| [PRODUCTION.md](./PRODUCTION.md) | Production setup and operations |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | AWS deployment (RDS, ALB, etc.) |
| [backend/README.md](./backend/README.md) | Backend API |
| [frontend/README.md](./frontend/README.md) | Frontend build and deployment |

### Technology Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, JWT auth, Alembic
- **Frontend**: React, Vite, Tailwind CSS
- **Infrastructure**: Docker, Nginx

### Run Tests

```bash
cd backend
python -m pytest tests/test_api.py -v
```

### API Docs

Swagger UI: `http://localhost:8000/docs` (when running locally)

---

**Status**: Production ready  
**Version**: 1.0.0
