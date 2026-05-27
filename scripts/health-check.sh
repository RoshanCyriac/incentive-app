#!/bin/bash
# Production Health Check Script
# Monitors application health and dependencies

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PORT="${POSTGRES_PORT:-5432}"

# Initialize results
PASSED=0
FAILED=0

# Helper functions
print_check() {
    echo -e "\n${YELLOW}Checking: $1${NC}"
}

print_pass() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
}

# Health checks
echo "========================================="
echo "  Production Health Check"
echo "========================================="

# 1. API Health
print_check "API Health Endpoint"
if curl -sf "$API_URL/api/health" > /dev/null; then
    print_pass "API is responding"
else
    print_fail "API is not responding"
fi

# 2. Backend Service Status
print_check "Backend Service"
if curl -sf "$API_URL/api/health" | grep -q "ok"; then
    print_pass "Backend service is healthy"
else
    print_fail "Backend service is not healthy"
fi

# 3. Frontend Service
print_check "Frontend Service"
if curl -sf "$API_URL/" > /dev/null; then
    print_pass "Frontend is accessible"
else
    print_fail "Frontend is not accessible"
fi

# 4. Database Connection (if local)
if [ "$DB_HOST" == "localhost" ] || [ "$DB_HOST" == "127.0.0.1" ]; then
    print_check "Database Connection"
    if pg_isready -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" > /dev/null 2>&1; then
        print_pass "Database is accessible"
    else
        print_fail "Database is not accessible"
    fi
fi

# 5. Container Status
print_check "Docker Containers"
if command -v docker &> /dev/null; then
    RUNNING=$(docker-compose ps --services --filter "status=running" | wc -l)
    TOTAL=$(docker-compose ps --services | wc -l)
    if [ "$RUNNING" -eq "$TOTAL" ]; then
        print_pass "All containers are running ($RUNNING/$TOTAL)"
    else
        print_fail "Some containers are not running ($RUNNING/$TOTAL)"
    fi
fi

# 6. Disk Space
print_check "Disk Space"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
if [ "$DISK_USAGE" -lt 80 ]; then
    print_pass "Disk usage is acceptable ($DISK_USAGE%)"
else
    print_fail "Disk usage is high ($DISK_USAGE%)"
fi

# 7. Memory Usage
print_check "Memory Usage"
if command -v free &> /dev/null; then
    MEM_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
    if [ "$MEM_USAGE" -lt 80 ]; then
        print_pass "Memory usage is acceptable ($MEM_USAGE%)"
    else
        print_fail "Memory usage is high ($MEM_USAGE%)"
    fi
fi

# 8. CPU Load
print_check "CPU Load"
if command -v uptime &> /dev/null; then
    LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')
    print_pass "CPU load average: $LOAD"
fi

# Summary
echo ""
echo "========================================="
echo -e "  Summary: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "========================================="

# Exit with error if any checks failed
if [ $FAILED -gt 0 ]; then
    exit 1
fi

exit 0
