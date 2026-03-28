# 🚀 EZTest Automated Test Generation Guide

**Master Guide for Complete Automated Playwright Test Generation**

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Complete Workflow](#complete-workflow)
3. [System Architecture](#system-architecture)
4. [Setup & Configuration](#setup--configuration)
5. [Step-by-Step Testing](#step-by-step-testing)
6. [Troubleshooting](#troubleshooting)
7. [Commands Reference](#commands-reference)

---

## Quick Start

### In 30 Seconds

```bash
# 1. Make a commit with code changes
git add .
git commit -m "feat: Add new feature"

# 2. Watch git hook fire in terminal
# → Shows: "🧪 Post-Commit Analysis Complete"

# 3. See Claude Code ask for permission
# → Says: "Generate tests for these changes?"

# 4. Approve
# → You type: "Yes"

# 5. Tests auto-generate and auto-run
# → Automatically creates tests and executes npm test

# 6. See results
# → Shows: ✅ Tests passed or ❌ Tests failed

# 7. Commit tests (if passed)
git add automation/tests/
git commit -m "test: Add automated tests"
```

**Result: Tests created and verified in ~70 seconds** ⚡

---

## Complete Workflow

### The Full Flow

```
┌─────────────────────────────────────────────────────────────┐
│ YOU COMMIT CODE (you do this)                               │
│ $ git commit -m "feat: Add new feature"                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ GIT HOOK ANALYZES (~1 second)                               │
│ ├─ Detects what changed (API/Component/Backend/Database)    │
│ ├─ Categorizes changes                                       │
│ └─ Creates .claude/commit_analysis.json                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ CLAUDE CODE ASKS FOR PERMISSION (~5 seconds)                │
│ Message: "Generate tests for these changes?"                │
│ Shows what changed (API routes, components, etc.)           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ YOU APPROVE (<1 second)                                     │
│ You type: "Yes" or "Generate tests"                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ TESTS GENERATED AUTOMATICALLY (~30 seconds)                 │
│ ├─ Reads code diff                                          │
│ ├─ Analyzes changes                                         │
│ └─ Creates automation/tests/[feature].spec.ts              │
│    With coverage for:                                       │
│    • Happy path scenarios                                   │
│    • Error cases                                            │
│    • Edge cases                                             │
│    • User interactions                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ TESTS RUN AUTOMATICALLY (~30 seconds)                       │
│ ├─ Executes: npm test                                       │
│ ├─ Waits for completion                                     │
│ ├─ Captures results                                         │
│ └─ Shows: ✅ PASS or ❌ FAIL                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ RESULTS DISPLAYED                                           │
│                                                             │
│ If ✅ PASS:                                                 │
│   "All tests passed! Ready to commit"                       │
│   $ git add automation/tests/                               │
│   $ git commit -m "test: Add tests"                         │
│                                                             │
│ If ❌ FAIL:                                                 │
│   "Tests failed. Debug with:"                               │
│   $ npm test -- --debug                                     │
│   $ npm test -- --ui                                        │
└─────────────────────────────────────────────────────────────┘
```

### Timeline

| Step | Duration | Who |
|------|----------|-----|
| Commit code | <1s | You |
| Hook analysis | ~1s | Automatic |
| Claude asks | ~5s | Automatic |
| You approve | <1s | You |
| Generate tests | ~30s | Automatic |
| Run tests | ~30s | Automatic |
| Show results | <1s | Automatic |
| **TOTAL** | **~70s** | **~98% automatic** |

---

## System Architecture

### Components

#### 1. Git Hook (`.git/hooks/post-commit`)
**Runs:** After every commit
**Does:**
- Analyzes changed files
- Categorizes changes (API, components, backend, database)
- Creates `commit_analysis.json` with metadata
- Stores full diff in `last_commit_diff.txt`
- Prints analysis to terminal

#### 2. Claude Code Agent Hook (`.claude/settings.json`)
**Runs:** When git commit is detected
**Does:**
- Reads commit analysis
- Determines if tests are needed
- **Asks for permission** (intelligent)
- On approval:
  - Generates comprehensive E2E tests
  - Creates files in `automation/tests/`
  - Automatically runs `npm test`
  - Displays results

#### 3. Test Files (Auto-Generated)
**Location:** `automation/tests/`
**Created:** After approval and test generation
**Contains:**
- Playwright E2E test suites
- Happy path tests
- Error case tests
- Edge case tests
- User interaction tests

---

## Setup & Configuration

### System Files

| File | Purpose | Status |
|------|---------|--------|
| `.git/hooks/post-commit` | Git hook for analysis | ✅ Installed |
| `.claude/settings.json` | Claude Code configuration | ✅ Configured |
| `.claude/commit_analysis.json` | Generated after each commit | Auto-created |
| `.claude/last_commit_diff.txt` | Full diff storage | Auto-created |
| `automation/tests/*.spec.ts` | Generated test files | Auto-created |

### Prerequisites

- ✅ Git installed and initialized
- ✅ Node.js and npm available
- ✅ Claude Code configured
- ✅ Playwright installed

### Verify Installation

```bash
# 1. Check git hook exists and is executable
ls -la .git/hooks/post-commit
# Expected: -rwxr-xr-x

# 2. Check hook has content
head -5 .git/hooks/post-commit

# 3. Check Claude settings
cat .claude/settings.json | jq .

# 4. Verify Playwright is installed
npm list @playwright/test
```

---

## Step-by-Step Testing

### Test 1: Verify Git Hook Works

```bash
# Run hook manually
.git/hooks/post-commit

# Expected output:
# 🧪 Post-Commit Analysis Complete
```

### Test 2: Make a Test Commit

```bash
# Create a test component
cat > frontend/components/TestComponent.tsx << 'EOF'
'use client';

export function TestComponent() {
  return <div>Test</div>;
}
EOF

# Stage and commit
git add frontend/components/TestComponent.tsx
git commit -m "test: Add TestComponent"

# Expected output:
# 🧪 Post-Commit Analysis Complete
# 📝 Test Opportunities Detected:
#    • Components: 1 file(s)
# ✨ Claude Code will now ask for permission
```

### Test 3: Check Claude Code UI

**Within 5-10 seconds, Claude should ask:**
```
I detected code changes that may need test coverage:
  • Components: 1 file(s)

Would you like me to generate comprehensive Playwright E2E tests
for these changes? Tests will be created in automation/tests/ and
automatically run with npm test to verify they pass.
```

### Test 4: Approve Generation

**In Claude Code, type:**
```
Yes
```

### Test 5: Watch Automatic Execution

Claude will:
1. Generate tests (~30 seconds)
2. Run tests with `npm test` (~30 seconds)
3. Show results

**Expected:**
```
✅ ALL TESTS PASSED!
3 tests passed (2.5s)

Ready to commit:
  $ git add automation/tests/
  $ git commit -m "test: Add TestComponent tests"
```

### Test 6: Verify Test Files

```bash
# Check tests were created
ls -la automation/tests/

# Expected:
# test-component.spec.ts
```

### Test 7: Run Tests Manually

```bash
# Run all tests
npm test

# Or run specific test
npm test -- test-component.spec.ts

# Or run in UI mode
npm test -- --ui
```

---

## Troubleshooting

### Issue: Nothing Happens After Commit

**Diagnosis:**
```bash
# Check hook is executable
ls -la .git/hooks/post-commit

# Should show: -rwxr-xr-x
```

**Fix if not executable:**
```bash
chmod +x .git/hooks/post-commit
```

**Test the hook:**
```bash
.git/hooks/post-commit

# Should output:
# 🧪 Post-Commit Analysis Complete
```

---

### Issue: Hook Shows Error

**Check bash is available:**
```bash
which bash
# Should show: /bin/bash
```

**Check file line endings (Windows issue):**
```bash
file .git/hooks/post-commit
# Should show: POSIX shell script text executable

# If shows CRLF, fix it:
sed -i 's/\r$//' .git/hooks/post-commit
```

---

### Issue: Claude Code Never Asks for Permission

**Restart Claude Code:**
- Close and reopen Claude Code completely
- Make a new commit after restart

**Check settings are valid:**
```bash
jq . .claude/settings.json

# Should output valid JSON without errors
```

**Verify settings have hook configuration:**
```bash
jq .hooks .claude/settings.json

# Should show PostToolUse hook
```

---

### Issue: Tests Generated But Not Run

**Check npm is working:**
```bash
npm --version
npm test --help
```

**Manually run tests:**
```bash
cd automation
npx playwright test

# Or from root:
npm test
```

---

### Issue: Tests Fail After Generation

**Debug with UI mode:**
```bash
npm test -- --ui
```

**Debug with step-through:**
```bash
npm test -- --debug
```

**View detailed report:**
```bash
cd automation
npx playwright show-report
```

**Ask Claude to fix:**
```
The tests are failing. Here's the error: [paste error]
Please fix the tests.
```

---

## Commands Reference

### Git Operations

```bash
# Make a commit (triggers the hook)
git commit -m "feat: Description"

# Skip hook (if needed)
git commit --no-verify -m "message"

# View what changed
git diff HEAD~1 HEAD
```

### Test Operations

```bash
# Run all tests
npm test

# Run specific test file
npm test -- specific-test.spec.ts

# Run with interactive UI
npm test -- --ui

# Debug mode (step through)
npm test -- --debug

# View HTML report
cd automation && npx playwright show-report
```

### Hook Operations

```bash
# Test hook manually
.git/hooks/post-commit

# Make hook executable
chmod +x .git/hooks/post-commit

# View hook content
cat .git/hooks/post-commit

# Check if tests need generation
cat .claude/commit_analysis.json
```

### Verification Commands

```bash
# Verify everything is set up
ls -la .git/hooks/post-commit
cat .claude/settings.json | jq .
npm list @playwright/test

# Check analysis files
ls -la .claude/commit_analysis.json
cat .claude/last_commit_diff.txt | head -20
```

---

## Example: Complete Workflow

### Scenario: Add a New API Endpoint

**Step 1: Create the endpoint**
```typescript
// app/api/users/invite/route.ts
export async function POST(request: Request) {
  // Invite user implementation
}
```

**Step 2: Commit**
```bash
$ git add app/api/users/invite/route.ts
$ git commit -m "feat: Add user invite endpoint"
```

**Step 3: See hook output**
```
🧪 Post-Commit Analysis Complete

📝 Test Opportunities Detected:
   • API Routes: 1 file(s)

✨ Claude Code will now ask for permission
```

**Step 4: Claude Code asks**
```
I detected changes to API Routes (1 file).

Would you like me to generate comprehensive Playwright E2E tests
for the invite endpoint?
```

**Step 5: You approve**
```
Yes
```

**Step 6: Automatic generation and execution**
```
✅ Generated tests for invite endpoint
   • Test successful invite
   • Test validation errors
   • Test auth requirements
   • Test rate limiting

Running tests with: npm test

[Tests execute...]

✅ ALL TESTS PASSED! (2.1s, 4 tests)
```

**Step 7: Commit tests**
```bash
$ git add automation/tests/
$ git commit -m "test: Add invite endpoint tests"
```

**Result:** Feature complete with verified tests! ✅

---

## FAQs

**Q: Do I need to run tests manually?**
A: No! Tests run automatically after generation. You just approve and wait.

**Q: What if tests fail?**
A: Use `npm test -- --ui` or `npm test -- --debug` to investigate and fix.

**Q: Can I skip test generation?**
A: Yes, just decline when Claude asks, or use `git commit --no-verify`.

**Q: How long does it take?**
A: About 70 seconds from commit to verified tests.

**Q: Can I customize the tests?**
A: Yes, edit the generated tests before committing them.

**Q: What if the hook doesn't fire?**
A: Check it's executable: `chmod +x .git/hooks/post-commit`

**Q: Does this work for all code changes?**
A: It detects API routes, components, backend logic, and database changes.

**Q: Can I disable the automation?**
A: Yes, use `git commit --no-verify` to skip the hook.

---

## Key Features

✅ **Automatic Detection** - Analyzes every commit
✅ **Intelligent Asking** - Asks permission before generating
✅ **Comprehensive Tests** - Creates full E2E test coverage
✅ **Auto Execution** - Tests run automatically
✅ **Instant Feedback** - Results shown immediately
✅ **Verified Tests** - Tests proven to work
✅ **Fast Workflow** - 70 seconds total

---

## Next Steps

1. **Verify Setup** - Run verification commands above
2. **Make a Commit** - Create a test commit with code changes
3. **Approve Generation** - Say "Yes" when Claude asks
4. **Review Results** - Check pass/fail status
5. **Commit Tests** - Add test files if tests pass
6. **Use in Production** - Apply to real features

---

## Support

If something doesn't work:

1. **Check troubleshooting section above**
2. **Run verification commands**
3. **Check git hook is executable:** `chmod +x .git/hooks/post-commit`
4. **Restart Claude Code** if settings changed
5. **Make a new commit** after making any fixes

---

**Happy testing!** 🚀

Your automated Playwright test generation system is ready to use.

From commit to verified tests in ~70 seconds. Fully automatic. ✨

