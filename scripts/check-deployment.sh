#!/bin/bash

# EzTest Docker Pre-Deployment Check Script
# 
# Purpose: Pre-deployment validation script for Linux servers
# Usage: ./check-deployment.sh
# 
# This script verifies that all prerequisites are met before deploying
# EzTest to a Linux server via Docker.
#
# Run this script before deploying to Linux server

set -e

echo "=================================="
echo "EzTest Pre-Deployment Checker"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Docker installed
echo -n "Checking Docker installation... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | cut -d',' -f1)
    echo -e "${GREEN}✓ Docker $DOCKER_VERSION${NC}"
else
    echo -e "${RED}✗ Docker not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Docker Compose installed
echo -n "Checking Docker Compose... "
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version | awk '{print $4}')
    echo -e "${GREEN}✓ Docker Compose $COMPOSE_VERSION${NC}"
else
    echo -e "${RED}✗ Docker Compose not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Line endings in docker-entrypoint.sh
echo -n "Checking docker-entrypoint.sh line endings... "
if file docker-entrypoint.sh | grep -q "CRLF"; then
    echo -e "${RED}✗ Windows line endings (CRLF) detected${NC}"
    echo "   Run: dos2unix docker-entrypoint.sh"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Unix line endings (LF)${NC}"
fi

# Check 4: docker-entrypoint.sh is executable
echo -n "Checking docker-entrypoint.sh permissions... "
if [ -x docker-entrypoint.sh ]; then
    echo -e "${GREEN}✓ Executable${NC}"
else
    echo -e "${YELLOW}⚠ Not executable${NC}"
    echo "   Run: chmod +x docker-entrypoint.sh"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 5: .env file exists
echo -n "Checking .env file... "
if [ -f .env ]; then
    echo -e "${GREEN}✓ Found${NC}"
    
    # Check for required variables
    REQUIRED_VARS=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL" "POSTGRES_PASSWORD")
    for var in "${REQUIRED_VARS[@]}"; do
        echo -n "  Checking $var... "
        if grep -q "^${var}=" .env; then
            VALUE=$(grep "^${var}=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
            if [[ "$VALUE" == *"CHANGE"* ]] || [[ "$VALUE" == *"changeme"* ]] || [[ "$VALUE" == *"your-"* ]]; then
                echo -e "${RED}✗ Still has default/placeholder value${NC}"
                ERRORS=$((ERRORS + 1))
            else
                echo -e "${GREEN}✓${NC}"
            fi
        else
            echo -e "${RED}✗ Not found${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo -e "${RED}✗ Not found${NC}"
    echo "   Run: cp .env.production.example .env"
    ERRORS=$((ERRORS + 1))
fi

# Check 6: Port 3000 availability
echo -n "Checking if port 3000 is available... "
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 3000 is in use${NC}"
    echo "   Either stop the service or change APP_PORT in .env"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ Available${NC}"
fi

# Check 7: Disk space
echo -n "Checking available disk space... "
AVAILABLE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$AVAILABLE" -lt 10 ]; then
    echo -e "${RED}✗ Only ${AVAILABLE}GB available (need 10GB+)${NC}"
    ERRORS=$((ERRORS + 1))
elif [ "$AVAILABLE" -lt 20 ]; then
    echo -e "${YELLOW}⚠ Only ${AVAILABLE}GB available (20GB+ recommended)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ ${AVAILABLE}GB available${NC}"
fi

# Check 8: Memory
echo -n "Checking available memory... "
TOTAL_MEM=$(free -g | awk 'NR==2 {print $2}')
if [ "$TOTAL_MEM" -lt 2 ]; then
    echo -e "${RED}✗ Only ${TOTAL_MEM}GB RAM (need 2GB+)${NC}"
    ERRORS=$((ERRORS + 1))
elif [ "$TOTAL_MEM" -lt 4 ]; then
    echo -e "${YELLOW}⚠ Only ${TOTAL_MEM}GB RAM (4GB+ recommended)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ ${TOTAL_MEM}GB RAM${NC}"
fi

# Check 9: dos2unix availability
echo -n "Checking dos2unix utility... "
if command -v dos2unix &> /dev/null; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${YELLOW}⚠ Not installed (needed to fix line endings)${NC}"
    echo "   Install: sudo apt-get install dos2unix"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 10: OpenSSL availability
echo -n "Checking OpenSSL... "
if command -v openssl &> /dev/null; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${YELLOW}⚠ Not installed (needed to generate secrets)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "=================================="
echo "Summary"
echo "=================================="
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}✗ Pre-deployment check FAILED${NC}"
    echo "Please fix the errors above before deploying."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Pre-deployment check passed with warnings${NC}"
    echo "You can proceed, but consider fixing the warnings."
    exit 0
else
    echo -e "${GREEN}✓ Pre-deployment check PASSED${NC}"
    echo "You're ready to deploy!"
    echo ""
    echo "Next steps:"
    echo "  1. docker compose build --no-cache"
    echo "  2. docker compose up -d"
    echo "  3. docker compose logs -f"
    exit 0
fi
