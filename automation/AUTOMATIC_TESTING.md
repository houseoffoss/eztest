# Automatic Testing Setup Guide

Your Playwright tests are now fully configured and passing. Here's how to set them up to run automatically.

## ✅ Tests Status

**All 17 tests passing successfully!**

### Signup Tests (7 tests) ✓
- Form rendering validation
- Empty field validation
- Invalid email format
- Weak password detection
- Valid signup submission
- Login page link
- Password visibility toggle

### Signin Tests (10 tests) ✓
- Form rendering validation
- Empty field validation
- Invalid email format
- Invalid credentials handling
- Signup page link
- Forgot password link
- Password visibility toggle
- Remember me checkbox
- Form labels
- Valid signin submission

---

## 🚀 Run Tests Manually

### Quick Command
```bash
npm run test:playwright
```

### With Options
```bash
# UI Mode (interactive - best for development)
npm run test:playwright -- --ui

# Debug Mode (step through tests)
npm run test:playwright -- --debug

# Headed Mode (see browser)
npm run test:playwright -- --headed

# View results
npx playwright show-report
```

---

## 🤖 Setup Automatic Testing

### Option 1: GitHub Actions (CI/CD) - Recommended

Create `.github/workflows/playwright-tests.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    # Run tests daily at 2 AM UTC
    - cron: '0 2 * * *'

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: eztest_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Setup database
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/eztest_test

      - name: Run Playwright tests
        run: npm run test:playwright

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: automation/html/
          retention-days: 30
```

### Option 2: Pre-commit Hook

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running Playwright tests..."
npm run test:playwright

if [ $? -ne 0 ]; then
  echo "Tests failed! Commit blocked."
  exit 1
fi

echo "All tests passed! ✓"
```

Install husky:
```bash
npm install husky --save-dev
npx husky install
chmod +x .husky/pre-commit
```

### Option 3: Scheduled Tests (Daily)

Using the `schedule` skill:

```bash
/schedule --cron "0 2 * * *" "npm run test:playwright"
```

Or use CronCreate in Claude Code:
```typescript
CronCreate({
  cron: "0 2 * * *",  // Daily at 2 AM
  prompt: "npm run test:playwright",
  recurring: true
})
```

### Option 4: Post-Deploy Tests

Add to your deployment script:

```bash
#!/bin/bash

# Deploy your application
npm run build
npm start &

# Wait for server to be ready
sleep 5

# Run tests
npm run test:playwright

# Check results
if [ $? -eq 0 ]; then
  echo "✓ All tests passed! Deployment successful."
else
  echo "✗ Tests failed! Rolling back..."
  # Add rollback logic here
  exit 1
fi
```

---

## 📊 Continuous Monitoring

### View Test Results

```bash
# Generate and open report
npx playwright show-report

# JSON results (for parsing)
cat automation/test-results.json
```

### Test Result Files
- `automation/html/` - Interactive HTML report
- `automation/test-results.json` - Machine-readable results
- Screenshots & traces for failed tests in `test-results/`

---

## 🔧 Configuration

### Modify Test Behavior

Edit `automation/playwright.config.ts`:

```typescript
// Change base URL
use: {
  baseURL: 'https://your-production-url.com'
}

// Change timeout
actionTimeout: 10000,  // 10 seconds

// Change workers (parallel tests)
workers: 4,  // Run 4 tests in parallel

// Change retries on failure
retries: 2
```

### Add More Browsers

Uncomment in `playwright.config.ts`:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
]
```

---

## 📧 Test Notifications

### Email on Test Failure

Add to GitHub Actions workflow:

```yaml
- name: Send Email on Failure
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: ${{ secrets.EMAIL_SERVER }}
    server_port: ${{ secrets.EMAIL_PORT }}
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: ❌ Playwright Tests Failed
    to: team@example.com
    body: |
      Tests failed on ${{ github.ref }}
      View report: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

### Slack Notifications

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Playwright Tests Failed ❌",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Tests failed on ${{ github.ref }}\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Details>"
            }
          }
        ]
      }
```

---

## 🐛 Troubleshooting

### Tests fail sporadically (flaky)

Increase timeouts:
```typescript
// playwright.config.ts
navigationTimeout: 30000,
actionTimeout: 15000
```

### Tests timeout on CI but work locally

- Increase `webServer.timeout` in `playwright.config.ts`
- Ensure CI has enough resources (2+ cores, 4GB RAM)
- Check database is properly migrated

### Tests can't find elements

- Enable debug mode: `npm run test:playwright -- --debug`
- Take screenshots: `--headed` mode
- Check selectors in browser DevTools

---

## 📈 Best Practices

1. **Run tests in CI/CD** - Catch bugs before production
2. **Schedule daily runs** - Catch environment issues early
3. **Run before deployment** - Verify changes work
4. **Monitor results** - Set up email/Slack alerts
5. **Keep tests updated** - Update selectors when UI changes
6. **Use unique test data** - Each test uses `Date.now()` for unique emails

---

## Next Steps

1. Choose automatic testing option (GitHub Actions recommended)
2. Set up notifications (email/Slack)
3. Configure test schedule
4. Monitor test reports
5. Add more tests as needed

Your automated testing is ready! 🎉
