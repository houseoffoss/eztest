#!/bin/bash

# Smart test runner script
# Supports: npm run test --playwright

# Check if playwright flag is passed
if [[ "$@" == *"--playwright"* ]]; then
  # Run Playwright tests
  cd automation
  playwright test
  exit $?
fi

# If no arguments or other flags, run playwright by default
if [ $# -eq 0 ]; then
  cd automation
  playwright test
  exit $?
fi

# Pass through other arguments
cd automation
playwright test "$@"
