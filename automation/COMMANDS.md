# Quick Commands Reference

## 🚀 Run Tests

```bash
# From root directory
npm run test:playwright          # Run all tests
npm run test                     # Alternative (same as above)

# From automation folder
cd automation && npm test
```

## 📋 Test Modes

```bash
# Interactive UI (best for development)
npm run test:playwright -- --ui

# Step through with debugger
npm run test:playwright -- --debug

# See browser window
npm run test:playwright -- --headed

# Run single test file
npm run test:playwright -- tests/auth.signin.spec.ts

# Run tests matching pattern
npm run test:playwright -- -g "password"

# Run on specific browser
npm run test:playwright -- --project=chromium
```

## 📊 Reports

```bash
# View HTML report
npx playwright show-report

# View from automation folder
cd automation && npm run report

# Show test results JSON
cat automation/test-results.json
```

## 🔍 Debugging

```bash
# Debug mode (step through, breakpoints)
npm run test:playwright -- --debug

# Headed mode (see browser actions)
npm run test:playwright -- --headed

# Combine both
npm run test:playwright -- --debug --headed

# Trace on failure (generates trace files)
npm run test:playwright -- --trace on
```

## 🛠️ Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Update Playwright
npm update @playwright/test
```

## 📱 Multiple Browsers

```bash
# Run on all browsers (edit config first)
npm run test:playwright

# Chromium only
npm run test:playwright -- --project=chromium

# Firefox only
npm run test:playwright -- --project=firefox

# WebKit only
npm run test:playwright -- --project=webkit
```

## 🎯 Specific Test Examples

```bash
# Signup tests only
npm run test:playwright -- tests/auth.signup.spec.ts

# Signin tests only
npm run test:playwright -- tests/auth.signin.spec.ts

# Test password validation
npm run test:playwright -- -g "password"

# Test form rendering
npm run test:playwright -- -g "render"

# Test validation
npm run test:playwright -- -g "validation"
```

## 🚀 CI/CD Integration

```bash
# Run tests like CI does (single worker)
npm run test:playwright -- --workers=1

# Run with retries (for flaky tests)
npm run test:playwright -- --retries=2

# Generate JSON report (for parsing)
npm run test:playwright -- --reporter=json

# Generate HTML + JSON reports
npm run test:playwright -- --reporter=html --reporter=json
```

## 📈 Performance

```bash
# Run with max parallelization
npm run test:playwright -- --workers=8

# Slow down actions (debugging UI)
PWDEBUG=1 npm run test:playwright

# Take screenshots on failure
npm run test:playwright -- --screenshot=only-on-failure

# Record video
npm run test:playwright -- --video=retain-on-failure
```

## 🧹 Cleanup

```bash
# Remove test artifacts
rm -rf automation/test-results
rm -rf automation/html
rm -rf automation/blob-report

# From automation folder
cd automation && npm run clean 2>/dev/null || echo "No cleanup script"
```

## 📝 Writing Tests

Create a new test file: `automation/tests/feature.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { login, generateTestEmail } from './helpers';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');

    // Interact with page
    await page.locator('selector').click();

    // Assert
    await expect(page.locator('result')).toBeVisible();
  });
});
```

Run new tests:
```bash
npm run test:playwright
```

## 💡 Pro Tips

```bash
# Watch mode (re-run on file change) - requires watchdog setup
npm run test:playwright -- --watch

# Update snapshots
npm run test:playwright -- --update-snapshots

# Use browser DevTools during test
npm run test:playwright -- --headed --debug

# Show all available options
npx playwright test --help

# Check test status in real-time
npm run test:playwright 2>&1 | grep -E "(passed|failed|✓|×)"
```

## 🌐 Environment Variables

```bash
# Custom base URL
BASE_URL=https://staging.example.com npm run test:playwright

# Slow down (milliseconds)
PWSLOW=100 npm run test:playwright

# Debug mode
PWDEBUG=1 npm run test:playwright

# Verbose logging
DEBUG=pw:api npm run test:playwright
```

## ✨ Useful Combinations

```bash
# Run single test with debugging
npm run test:playwright -- tests/auth.signin.spec.ts --debug --headed

# Run tests and show report
npm run test:playwright && npx playwright show-report

# Run tests on CI (no browser UI)
CI=true npm run test:playwright -- --workers=1

# Run with custom timeout
TIMEOUT=60000 npm run test:playwright

# Check if tests pass and notify
npm run test:playwright && echo "✓ All tests passed!" || echo "✗ Tests failed"
```

---

**For detailed information, see:**
- [README.md](./README.md) - Full documentation
- [QUICK_START.md](./QUICK_START.md) - Getting started guide
- [AUTOMATIC_TESTING.md](./AUTOMATIC_TESTING.md) - CI/CD setup guide
