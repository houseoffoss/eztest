#!/bin/bash

# Auto-run tests after Playwright test generation
# This script automatically runs tests that were just generated

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🧪 Auto-Running Generated Playwright Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Check if tests were generated
TESTS_DIR="automation/tests"
if [ ! -d "$TESTS_DIR" ]; then
  echo -e "${RED}❌ Tests directory not found: $TESTS_DIR${NC}"
  exit 1
fi

# Count test files
TEST_COUNT=$(find $TESTS_DIR -name "*.spec.ts" | wc -l)
if [ $TEST_COUNT -eq 0 ]; then
  echo -e "${RED}❌ No test files found in $TESTS_DIR${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Found $TEST_COUNT test file(s)${NC}"
echo ""

# Run tests
echo -e "${YELLOW}📋 Running tests with Playwright...${NC}"
echo -e "${YELLOW}   Command: npm test${NC}"
echo ""

if npm test; then
  echo ""
  echo -e "${GREEN}╔═════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║ ✅ ALL TESTS PASSED!                              ║${NC}"
  echo -e "${GREEN}╚═════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${GREEN}Tests are ready to commit:${NC}"
  echo -e "${GREEN}  git add automation/tests/${NC}"
  echo -e "${GREEN}  git commit -m 'test: Add auto-generated tests'${NC}"
  echo ""
  exit 0
else
  echo ""
  echo -e "${RED}╔═════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║ ❌ TESTS FAILED                                    ║${NC}"
  echo -e "${RED}╚═════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${YELLOW}Debug options:${NC}"
  echo -e "${YELLOW}  • Run in UI mode: npm test -- --ui${NC}"
  echo -e "${YELLOW}  • Debug mode: npm test -- --debug${NC}"
  echo -e "${YELLOW}  • View report: cd automation && npx playwright show-report${NC}"
  echo ""
  exit 1
fi
