# 🚀 Automatic Test Execution Setup

## ✅ What's Now Automatic

Your tests now run **automatically** with:
- ✅ Browser opens automatically (UI mode)
- ✅ Tests start running immediately
- ✅ Interactive test explorer
- ✅ No manual configuration needed

## 🎯 Just Run This:

```powershell
npm run test
```

**That's it!** Browser will open automatically with interactive test UI.

---

## 📋 Available Commands

### Default (Opens Browser Automatically)
```bash
npm run test                    # Opens UI mode automatically
```

### From Automation Folder
```bash
cd automation
npm test                        # Opens UI mode
npm run test:headless          # Run without browser (fast)
```

### From Root Directory
```bash
npm run test                    # UI mode (browser opens)
npm run test -- --headless     # Run without browser
npm run test -- --debug        # Step through with debugger
```

---

## 🤖 Setup Automatic Daily Tests

### Option 1: Windows Task Scheduler

Create a batch file `run-tests.bat`:

```batch
@echo off
cd C:\Users\Admin\Documents\Belsterns\applications\eztest\eztest
npm run test
pause
```

Then schedule with Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to daily at desired time
4. Set action to run `run-tests.bat`

### Option 2: GitHub Actions (Recommended)

Create `.github/workflows/tests.yml`:

```yaml
name: Automated Tests

on:
  schedule:
    # Run tests daily at 9 AM
    - cron: '0 9 * * *'
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test -- --workers=1
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: automation/html/
```

### Option 3: NPM Schedule Command

```bash
npm run schedule -- --cron "0 9 * * *" "npm run test"
```

### Option 4: Pre-commit Hook

Tests run before every commit:

```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run test -- --headless"
```

---

## 📊 What Happens When You Run Tests

1. **Development server starts** automatically
2. **Browser opens** showing test explorer
3. **Tests run** in interactive UI
4. **Results show** in real-time
5. **Report generated** automatically

### Visual Flow:

```
npm run test
    ↓
Dev server starts (http://localhost:3000)
    ↓
Browser opens with test UI
    ↓
Tests run automatically
    ↓
See results in browser
    ↓
HTML report generated
```

---

## 🔧 Customization

### Change Default Behavior

Edit `scripts/test.js` to change default:

```javascript
// Default to headless (no browser)
if (args.length === 0) {
  cmd += ' --headless';  // Change this line
}
```

Or edit `automation/package.json`:

```json
"scripts": {
  "test": "playwright test --headless",  // Change mode
}
```

### Run Tests on File Changes

Install nodemon:

```bash
npm install --save-dev nodemon
```

Create `watch-tests.sh`:

```bash
nodemon --watch . --ext ts,tsx,js --exec "npm run test -- --headless"
```

Run with:

```bash
npm run watch-tests
```

---

## ⏱️ Schedule Variations

### Run Every Hour
```bash
npm run schedule -- --cron "0 * * * *" "npm run test"
```

### Run Every 30 Minutes
```bash
npm run schedule -- --cron "*/30 * * * *" "npm run test"
```

### Run Every Monday at 9 AM
```bash
npm run schedule -- --cron "0 9 * * 1" "npm run test"
```

### Run When Files Change
```bash
npm install --save-dev nodemon
nodemon --watch "src/**" --exec "npm run test -- --headless"
```

---

## 📧 Get Notifications

### Email on Test Failure

Add to `.github/workflows/tests.yml`:

```yaml
- name: Email on Failure
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: ${{ secrets.SMTP_SERVER }}
    username: ${{ secrets.SMTP_USER }}
    password: ${{ secrets.SMTP_PASS }}
    subject: "❌ Tests Failed"
    to: your-email@example.com
    body: "Tests failed. Check GitHub Actions for details."
```

### Slack Notifications

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Tests Failed ❌"
      }
```

---

## 🐛 Troubleshooting

### Browser doesn't open
- Check if port 3000 is free
- Make sure `headless: false` in `playwright.config.ts`
- Try: `npm run test -- --headed`

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Try: `npm run test -- --headed --slow-mo=500`

### Permission denied running batch file
- Right-click `.bat` file → Properties → Unblock
- Or run PowerShell as Administrator

---

## 💡 Pro Tips

1. **For Development**: Use `npm run test` (UI mode opens automatically)
2. **For CI/CD**: Use `npm run test -- --headless --workers=1`
3. **For Debugging**: Use `npm run test -- --debug --headed`
4. **For Monitoring**: Use GitHub Actions for daily automated runs

---

## ✨ Summary

| Need | Command |
|------|---------|
| Run tests with browser | `npm run test` |
| Run tests (no browser) | `npm run test -- --headless` |
| Debug mode | `npm run test -- --debug` |
| Daily automation | GitHub Actions (see above) |
| Pre-commit tests | Husky hook (see above) |
| Watch files | Nodemon (see above) |

---

## 🎉 You're All Set!

Just run:

```powershell
npm run test
```

Tests will automatically start in the browser UI! 🚀
