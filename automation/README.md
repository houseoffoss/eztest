# EZTest Automation Testing

This folder contains Playwright automation tests for the EZTest application, focusing on authentication flows (signup and signin).

## Setup

### Install Playwright

```bash
npm install
```

The Playwright dependencies are already configured in the root `package.json`.

### Configure Base URL

Update `playwright.config.ts` if your application runs on a different URL:

```typescript
use: {
  baseURL: 'http://localhost:3000', // Change this if needed
}
```

## Running Tests

### Run All Tests

```bash
npm run test:playwright
```

### Run Specific Test File

```bash
npx playwright test tests/auth.signup.spec.ts
npx playwright test tests/auth.signin.spec.ts
```

### Run Tests in Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests with UI Mode (recommended for development)

```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (see browser)

```bash
npx playwright test --headed
```

## Test Structure

### Signup Tests (`tests/auth.signup.spec.ts`)

- Form rendering validation
- Empty field validation
- Invalid email format
- Weak password detection
- Valid signup submission
- Navigation to login page
- Password visibility toggle

### Signin Tests (`tests/auth.signin.spec.ts`)

- Form rendering validation
- Empty field validation
- Invalid email format
- Invalid credentials handling
- Navigation to signup page
- Forgot password link
- Password visibility toggle
- Remember me functionality
- Form labels verification
- Valid signin submission

## Viewing Test Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Test results are saved in:
- `html/` - Interactive HTML report
- `test-results.json` - Machine-readable test results
- Screenshots and traces for failed tests

## Writing New Tests

1. Create a new `.spec.ts` file in the `tests/` folder
2. Use the provided test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path');
  });

  test('should do something', async ({ page }) => {
    // Your test code
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## Best Practices

1. **Use Data Attributes**: Add `data-testid` attributes to elements for reliable test selectors
2. **Wait for Elements**: Use explicit waits instead of fixed delays when possible
3. **Isolate Tests**: Each test should be independent
4. **Use Meaningful Names**: Test names should clearly describe what is being tested
5. **Avoid Hard-coded Values**: Use dynamic data (like timestamps) for signup tests

## Environment Setup

### Database Seeding for Tests

For authenticated tests to work, ensure you have test accounts in your database:

```bash
npx prisma db seed
```

Or create test accounts manually in your database.

### Running with Development Server

The tests automatically start the development server if it's not running. Ensure:

1. `.env` is configured with `DATABASE_URL` and other required variables
2. Database is initialized and migrated
3. Port 3000 is available

## CI/CD Integration

The configuration includes CI/CD optimizations:

- Tests run serially in CI (single worker)
- Screenshots captured on failure
- HTML reports generated
- Retries enabled for flaky tests

## Troubleshooting

### Tests Timeout

- Ensure the development server is running on `http://localhost:3000`
- Check if the app is responding: `curl http://localhost:3000`

### Element Not Found

- Verify the selector using browser DevTools
- Add `data-testid` attributes to elements
- Use more specific selectors

### Authentication Issues

- Ensure test accounts exist in the database
- Check credentials in test files
- Verify NextAuth is properly configured

### Port Already in Use

```bash
# Kill the process using port 3000
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -i :3000
kill -9 <PID>
```

## Further Documentation

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
