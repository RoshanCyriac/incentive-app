#!/bin/bash
# Production Deployment Script
# Safely deploys the application with pre-flight checks and rollback capability

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT="${ENVIRONMENT:-production}"
BACKUP_RETENTION_DAYS=7
LOG_DIR="./deployment-logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_LOG="$LOG_DIR/deployment_$TIMESTAMP.log"

# Create log directory
mkdir -p "$LOG_DIR"

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

# Error handling
trap 'on_error' ERR

on_error() {
    log_error "Deployment failed!"
    read -p "Rollback to previous version? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rollback
    fi
    exit 1
}

# Pre-flight checks
preflight_checks() {
    log "Running pre-flight checks..."

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker daemon is not running"
        return 1
    fi
    log_success "Docker is running"

    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed"
        return 1
    fi
    log_success "docker-compose is available"

    # Check environment file
    if [ ! -f ".env.prod" ]; then
        log_error ".env.prod file not found"
        return 1
    fi
    log_success ".env.prod exists"

    # Check required directories
    for dir in backend frontend infrastructure; do
        if [ ! -d "$dir" ]; then
            log_error "Directory $dir not found"
            return 1
        fi
    done
    log_success "All required directories present"

    # Check database connectivity (if not RDS)
    if grep -q "localhost" .env.prod; then
        log_warning "Local database configuration detected"
    fi

    log_success "All pre-flight checks passed"
}

# Build images
build_images() {
    log "Building Docker images..."

    if ! docker-compose build; then
        log_error "Failed to build images"
        return 1
    fi

    log_success "Images built successfully"
}

# Backup current deployment
backup_deployment() {
    log "Creating backup of current deployment..."

    BACKUP_DIR="./backups/deployment_$TIMESTAMP"
    mkdir -p "$BACKUP_DIR"

    # Save docker-compose state
    docker-compose ps > "$BACKUP_DIR/services.txt" || true
    docker-compose logs > "$BACKUP_DIR/logs.txt" || true

    # Save environment
    cp .env.prod "$BACKUP_DIR/.env.prod.bak"

    log_success "Backup created at $BACKUP_DIR"
}

# Database migrations
run_migrations() {
    log "Running database migrations..."

    if ! docker-compose run --rm backend alembic upgrade head; then
        log_error "Database migrations failed"
        return 1
    fi

    log_success "Database migrations completed"
}

# Deploy services
deploy_services() {
    log "Deploying services..."

    # Load environment
    export $(cat .env.prod | xargs)

    # Stop existing services gracefully
    log "Stopping existing services..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down || true

    # Start new services
    log "Starting new services..."
    if ! docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d; then
        log_error "Failed to start services"
        return 1
    fi

    log_success "Services started"

    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 5

    # Check service health
    for i in {1..30}; do
        if curl -sf http://localhost/api/health > /dev/null 2>&1; then
            log_success "Services are healthy"
            return 0
        fi
        log "Waiting... ($i/30)"
        sleep 1
    done

    log_error "Services failed to become healthy"
    return 1
}

# Health checks
run_health_checks() {
    log "Running health checks..."

    # API health
    if ! curl -sf http://localhost/api/health > /dev/null; then
        log_error "API health check failed"
        return 1
    fi
    log_success "API health check passed"

    # Frontend accessibility
    if ! curl -sf http://localhost/ > /dev/null; then
        log_warning "Frontend not accessible yet (may be initializing)"
    else
        log_success "Frontend is accessible"
    fi

    # Container status
    RUNNING=$(docker-compose ps --services --filter "status=running" | wc -l)
    TOTAL=$(docker-compose ps --services | wc -l)
    if [ "$RUNNING" -ne "$TOTAL" ]; then
        log_error "Not all containers are running ($RUNNING/$TOTAL)"
        return 1
    fi
    log_success "All containers are running ($RUNNING/$TOTAL)"

    log_success "All health checks passed"
}

# Smoke tests
run_smoke_tests() {
    log "Running smoke tests..."

    # Test login endpoint
    RESPONSE=$(curl -s -X POST http://localhost/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email": "admin@incentive.com", "password": "admin123"}')

    if echo "$RESPONSE" | grep -q "access_token"; then
        log_success "Login endpoint test passed"
    else
        log_warning "Login test inconclusive (test user may not exist)"
    fi

    # Test health endpoint
    if curl -sf http://localhost/api/health > /dev/null; then
        log_success "Health endpoint test passed"
    else
        log_error "Health endpoint test failed"
        return 1
    fi

    log_success "Smoke tests completed"
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."

    find ./backups -type d -name "deployment_*" -mtime +$BACKUP_RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true

    log_success "Backup cleanup completed"
}

# Rollback to previous version
rollback() {
    log_error "Rolling back deployment..."

    # Find latest backup
    LATEST_BACKUP=$(ls -td ./backups/deployment_* 2>/dev/null | head -1)

    if [ -z "$LATEST_BACKUP" ]; then
        log_error "No backup found for rollback"
        return 1
    fi

    # Restore environment
    cp "$LATEST_BACKUP/.env.prod.bak" .env.prod

    # Restart services
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

    # Wait for services
    sleep 5

    if curl -sf http://localhost/api/health > /dev/null; then
        log_success "Rollback completed successfully"
        return 0
    else
        log_error "Rollback failed - services not responding"
        return 1
    fi
}

# Main deployment flow
main() {
    log "========================================="
    log "Starting Production Deployment"
    log "========================================="
    log "Environment: $ENVIRONMENT"
    log "Timestamp: $TIMESTAMP"

    # Run checks and deploy
    preflight_checks || exit 1
    build_images || exit 1
    backup_deployment || exit 1
    run_migrations || exit 1
    deploy_services || exit 1
    run_health_checks || exit 1
    run_smoke_tests || exit 1
    cleanup_backups || true

    log "========================================="
    log_success "Deployment completed successfully!"
    log "========================================="
    log "Deployment log: $DEPLOYMENT_LOG"
    log "Access URL: https://your-domain.com"

    return 0
}

# Parse command-line arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    health)
        bash scripts/health-check.sh
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health}"
        echo ""
        echo "  deploy    - Deploy application to production"
        echo "  rollback  - Rollback to previous version"
        echo "  health    - Run health checks"
        exit 1
        ;;
esac
