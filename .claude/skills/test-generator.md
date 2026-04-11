# Test Generator Skill

## Description
Automatically generates Playwright E2E tests from code changes in your recent commits.

## Trigger
When you commit code changes to your EZTest project, this skill is automatically suggested.

## What It Does
1. ✅ Reads the diff from your last commit
2. ✅ Analyzes API routes, components, pages, and features
3. ✅ Generates appropriate Playwright tests
4. ✅ Creates tests in `automation/tests/`
5. ✅ Tests follow your existing patterns

## How to Use

### Automatic (After Commit)
```bash
git commit -m "feat: Add new feature"
# Hook fires automatically and suggests test generation
```

Then ask in Claude Code:
```
Generate tests for the changes I just committed
```

### Manual
```
/test-generator --analyze-commit
```

Or just ask:
```
Generate Playwright tests for [component/feature]
```

## Generated Tests Include
- ✅ Happy path scenarios
- ✅ Error cases
- ✅ User interactions
- ✅ Form submissions
- ✅ Authentication flows
- ✅ Data validation

## Examples

### API Route Tests
```typescript
// Automatically generates CRUD operation tests
test('GET /api/resource should return items', async ({ request }) => {
  const response = await request.get('/api/resource');
  expect(response.status()).toBe(200);
});
```

### Component Tests
```typescript
// Tests user interactions
test('button click should trigger action', async ({ page }) => {
  await page.click('[data-testid="action-button"]');
  await expect(page).toHaveTitle(/expected/);
});
```

### Form Tests
```typescript
// Tests form submissions and validation
test('form submission should succeed', async ({ page }) => {
  await page.fill('[name="email"]', 'user@example.com');
  await page.click('[type="submit"]');
  await page.waitForURL('/success');
});
```

## Running Generated Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- feature.spec.ts

# Run in UI mode
npm test -- --ui

# Run with debug
npm test -- --debug
```

## View Test Results
```bash
# After tests run, view HTML report
cd automation
npx playwright show-report
```

## Customization

### Customize Test Templates
Edit `.claude/test-templates/` to change test generation patterns.

### Skip Test Generation
```bash
git commit --no-verify -m "quick fix"
```

### Disable Hook
```bash
chmod -x .git/hooks/post-commit
```

## Documentation
- Full guide: `docs/TESTING_AUTOMATION.md`
- Quick start: `AUTOMATION_QUICK_START.md`
- Setup: `SETUP_CHECKLIST.md`

## Tips
- 💡 Use atomic commits (one feature per commit) for better test generation
- 💡 Write descriptive commit messages - Claude uses them to understand intent
- 💡 Review generated tests before running them
- 💡 Run tests in UI mode with `npm test -- --ui` to debug

---

**Ready to generate tests?** Commit your changes and ask Claude Code!
