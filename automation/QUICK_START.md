# Quick Start Guide - Playwright Automation

## Installation

```bash
# From the root directory, install dependencies
npm install
```

## Running Tests

### Option 1: From Root Directory

```bash
# Run all tests
npm run test:playwright

# Run all tests (alternative)
npm run test
```

### Option 2: From automation folder

```bash
cd automation
npm test
```

## Running Tests with Different Options

```bash
# UI Mode (Recommended for development - interactive test explorer)
npm run test:playwright -- --ui

# Debug Mode (step through tests)
npm run test:playwright -- --debug

# Headed Mode (see browser window)
npm run test:playwright -- --headed

# Specific browser
npm run test:playwright -- --project=chromium

# Specific test file
npm run test:playwright -- tests/auth.signup.spec.ts

# With specific test name
npm run test:playwright -- -g "should render signin form"
```

## Folder Structure

```
automation/
├── playwright.config.ts          # Main Playwright configuration
├── package.json                  # Automation dependencies & scripts
├── .gitignore                    # Git ignore for test artifacts
├── README.md                     # Detailed documentation
├── QUICK_START.md               # This file
├── tests/
│   ├── auth.signup.spec.ts      # Signup page tests
│   ├── auth.signin.spec.ts      # Signin page tests
│   └── helpers.ts                # Test utilities & helpers
└── test-results/                # Generated test reports (not in git)
    ├── html/                    # HTML test report
    └── test-results.json        # Machine-readable results
```

## Test Files Overview

### `auth.signup.spec.ts`
Tests for the signup page including:
- Form rendering
- Validation errors
- Invalid email/password
- Valid signup submission
- Navigation links
- Password visibility toggle

### `auth.signin.spec.ts`
Tests for the signin page including:
- Form rendering
- Validation errors
- Invalid credentials
- Remember me checkbox
- Forgot password link
- Password visibility toggle
- Valid signin submission

### `helpers.ts`
Reusable test functions:
- `login()` - Helper to login
- `signup()` - Helper to signup
- `generateTestEmail()` - Create unique test emails
- `isAuthenticated()` - Check if user is logged in
- `logout()` - Helper to logout
- `getErrorMessage()` - Extract error messages
- `fillAndSubmit()` - Fill form and submit

## Viewing Test Results

```bash
# After tests run, view the HTML report
npm run test:playwright
npx playwright show-report

# Or from automation folder
cd automation
npm run report
```

## Common Issues

### Tests timeout or can't connect to localhost:3000

```bash
# Make sure the dev server is running in another terminal
npm run dev
```

### Port 3000 already in use

```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Tests fail with "element not found"

- Check if the signup/signin pages use expected HTML structure
- Update selectors in test files if needed
- Use `--debug` mode to investigate

### Authentication tests fail

- Ensure test database is set up: `npx prisma migrate deploy`
- Check if test accounts exist in database
- Update credentials in test files

## Next Steps

1. **Run the tests**: `npm run test:playwright`
2. **View results**: `npx playwright show-report`
3. **Debug failures**: `npm run test:playwright -- --debug`
4. **Customize**: Edit test files for your auth page structure
5. **Extend**: Add more tests in `tests/` folder

## Adding New Tests

Create a new file in `tests/` directory:

```typescript
import { test, expect } from '@playwright/test';
import { login, generateTestEmail } from './helpers';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    // Your test code
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

Then run: `npm run test:playwright`

## Documentation

- Full documentation: [README.md](./README.md)
- Playwright docs: https://playwright.dev
- Playwright best practices: https://playwright.dev/docs/best-practices
