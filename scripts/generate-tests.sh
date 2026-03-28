#!/bin/bash

# Generate Playwright tests from recent code changes
# Usage: scripts/generate-tests.sh

set -e

DIFF_FILE=".claude/last_commit_diff.txt"

if [ ! -f "$DIFF_FILE" ]; then
  echo "❌ No commit diff found. Run this after making a commit."
  exit 1
fi

echo "📖 Analyzing code changes to generate tests..."
echo ""

# Read the diff
DIFF=$(cat "$DIFF_FILE")

# Extract changed files
CHANGED_FILES=$(echo "$DIFF" | grep '^diff --git' | sed 's/.*b\///' | sort -u)

echo "🔍 Detected changes in:"
echo "$CHANGED_FILES" | sed 's/^/   /'
echo ""

# Check for API route changes
API_ROUTES=$(echo "$CHANGED_FILES" | grep '^app/api/' || true)
if [ -n "$API_ROUTES" ]; then
  echo "🛠️  API Routes Modified - May need integration tests"
  echo "   Files: $(echo "$API_ROUTES" | tr '\n' ', ')"
  echo ""
fi

# Check for component changes
COMPONENTS=$(echo "$CHANGED_FILES" | grep -E '^(frontend|app)/.*\.(tsx|jsx)$' | grep -v 'layout\|page\|error' || true)
if [ -n "$COMPONENTS" ]; then
  echo "🎨 Components Updated - May need E2E tests"
  echo "   Files: $(echo "$COMPONENTS" | tr '\n' ', ')"
  echo ""
fi

echo "✨ To generate tests for these changes:"
echo "   Use: /test-generator"
echo "   Or manually create tests in: automation/tests/"
echo ""
echo "📚 Test Template:"
echo "   automation/tests/your-feature.spec.ts"
echo ""

# Clean up
rm -f "$DIFF_FILE"

exit 0
