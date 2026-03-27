# Test Command Guide

## 🚀 Quick Commands

### Run Tests (from root directory)

```bash
# Basic (no arguments)
npm run test

# With options (use -- separator)
npm run test -- --ui           # Interactive UI
npm run test -- --debug        # Debug mode
npm run test -- --headed       # See browser
```

### Alternative Commands

```bash
# Shorthand (same as npm run test)
npm run test:playwright

# From automation folder
cd automation && npm test
cd automation && npm run test:ui
cd automation && npm run test:debug
```

## 📝 Common Use Cases

### Development & Debugging

```bash
# Interactive UI (recommended for writing tests)
npm run test -- --ui

# Debug mode (breakpoints, step through)
npm run test -- --debug

# See browser actions
npm run test -- --headed

# Combination: see browser AND debug
npm run test -- --debug --headed
```

### Running Specific Tests

```bash
# Single test file
npm run test -- tests/auth.signin.spec.ts
npm run test -- tests/auth.signup.spec.ts

# Tests matching pattern
npm run test -- -g "password"
npm run test -- -g "validation"
npm run test -- -g "signup"

# Multiple patterns
npm run test -- -g "password|email"
```

### CI/CD & Automation

```bash
# Run with retries (for flaky tests)
npm run test -- --retries=2

# Run with single worker (like CI)
npm run test -- --workers=1

# Verbose output
npm run test -- --reporter=list

# Generate JSON report
npm run test -- --reporter=json
```

### Performance & Monitoring

```bash
# Max parallelization
npm run test -- --workers=8

# Slow down actions (100ms delay)
npm run test -- --slow-mo=100

# Record video on failure
npm run test -- --video=retain-on-failure

# Take screenshots
npm run test -- --screenshot=only-on-failure
```

## 📊 Viewing Results

```bash
# Show HTML report
npx playwright show-report

# From automation folder
cd automation && npm run report

# View JSON results
cat automation/test-results.json
```

## 🎯 Advanced Examples

### Run Single Test Suite

```bash
# All signin tests
npm run test -- tests/auth.signin.spec.ts

# All signup tests
npm run test -- tests/auth.signup.spec.ts
```

### Run With Multiple Options

```bash
# Debug + headed + slow motion
npm run test -- --debug --headed --slow-mo=500

# UI + specific file
npm run test -- --ui tests/auth.signin.spec.ts

# CI mode + retries
npm run test -- --workers=1 --retries=2
```

### Monitoring & Reports

```bash
# Generate and open report
npm run test && npx playwright show-report

# Run tests, keep videos, show report
npm run test -- --video=retain-on-failure && npx playwright show-report
```

## 💡 Tips

1. **During Development**: Use `npm run test -- --ui` for interactive testing
2. **Debugging**: Use `npm run test -- --debug --headed` to see what's happening
3. **CI/CD**: Use `npm run test -- --workers=1 --retries=2` for stable runs
4. **Monitoring**: Use `npm run test -- --reporter=json` for parsing results

## 📚 Full Option Reference

```bash
npm run test -- --help          # Show all available options
```

Key options:
- `--ui` - Interactive UI
- `--debug` - Step through with debugger
- `--headed` - Show browser window
- `-g "pattern"` - Run tests matching pattern
- `--workers=N` - Run N tests in parallel
- `--retries=N` - Retry failed tests N times
- `--slow-mo=ms` - Delay actions by ms milliseconds
- `--video=mode` - Record video (off, on, retain-on-failure)
- `--screenshot=mode` - Take screenshots (off, on, only-on-failure)
- `--project=name` - Run specific browser (chromium, firefox, webkit)
- `--reporter=type` - Output format (list, json, html)

## 🔧 Troubleshooting

### Command not found
Make sure you're in the root directory where `package.json` is located.

### Tests timeout
Use `--headed` to see what's happening:
```bash
npm run test -- --headed
```

### Flaky tests
Add retries and slow down actions:
```bash
npm run test -- --retries=2 --slow-mo=100
```

### Need specific browser
```bash
npm run test -- --project=chromium  # Chromium only
npm run test -- --project=firefox   # Firefox (if configured)
npm run test -- --project=webkit    # WebKit (if configured)
```

## 🎉 Quick Reference

| Task | Command |
|------|---------|
| Run all tests | `npm run test` |
| Interactive UI | `npm run test -- --ui` |
| Debug | `npm run test -- --debug` |
| See browser | `npm run test -- --headed` |
| Specific file | `npm run test -- tests/auth.signin.spec.ts` |
| Pattern match | `npm run test -- -g "password"` |
| Show report | `npx playwright show-report` |
| CI/CD mode | `npm run test -- --workers=1` |
