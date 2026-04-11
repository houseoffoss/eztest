# Automated Test Generation Guide

This guide explains how EZTest automatically suggests and helps generate Playwright tests when you create or update features.

## Overview

When you commit code changes:
1. **Post-commit hook** analyzes what changed
2. **Detects** new API routes, components, or features
3. **Suggests** test coverage needed
4. **Stores** the diff for Claude Code to analyze
5. **Generates** Playwright tests automatically (with your guidance)

## How It Works

### Step 1: Make a Commit with Feature Changes

```bash
git add .
git commit -m "feat: Add new signin page feature"
```

The post-commit hook automatically runs and:
- ✅ Detects changes to components, pages, and API routes
- ✅ Stores the diff for analysis
- ✅ Prints suggestions for test coverage
- ✅ Doesn't block your workflow (runs after commit succeeds)

### Step 2: Hook Output Shows Test Opportunities

You'll see output like:

```
🧪 Analyzing commit for test opportunities...
📝 Code changes detected that may need test coverage
   Tip: Run 'npm test' to verify existing tests still pass
   Changed files:
     frontend/components/SignIn/index.tsx
     app/api/auth/signin/route.ts

✨ To auto-generate tests for these changes:
   claude-code --generate-tests
```

### Step 3: Ask Claude Code to Generate Tests

When you see the suggestion, you can:

#### Option A: Use Claude Code with this prompt
```
I just committed changes to my EZTest application. Please analyze the commit and generate appropriate Playwright E2E tests for:
- New API endpoints
- Modified components
- New pages or features

Look at the diff in .claude/last_commit_diff.txt and create tests that cover the happy path and error cases.
```

#### Option B: In Claude Code sidebar, search for test generation
The generated tests will be created in `automation/tests/` following your existing patterns.

#### Option C: Manual approach (traditional)
```bash
# Create test file manually
touch automation/tests/my-feature.spec.ts
```

## Supported Test Scenarios

The automation generates tests for:

### API Routes
```typescript
// When you add: app/api/resource/route.ts
// Claude generates tests for GET, POST, PUT, DELETE, error cases
test('GET /api/resource should return items', async ({ request }) => {
  const response = await request.get('/api/resource');
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(Array.isArray(data)).toBe(true);
});
```

### Components & Pages
```typescript
// When you add: frontend/components/MyComponent.tsx
// Claude generates interaction tests
test('component should handle user interaction', async ({ page }) => {
  await page.goto('/page-using-component');
  await page.click('[data-testid="button"]');
  await expect(page).toHaveTitle(/expected/);
});
```

### Auth Flows
```typescript
// When you modify: lib/auth.ts
// Claude generates login/logout test sequences
test('user login flow should succeed', async ({ page }) => {
  // Handles full auth flow with credentials
});
```

## Running Generated Tests

```bash
# Run all tests
npm test

# Run specific generated test
npm test -- my-feature.spec.ts

# Run with UI explorer
npm test -- --ui
```

## Best Practices

1. **Commit atomic changes** - One feature per commit helps Claude understand what to test
2. **Use descriptive commit messages** - Claude analyzes the message to understand intent
3. **Review generated tests** - Always review Claude-generated tests before running
4. **Update as features change** - Regenerate tests when you update features
5. **Keep tests focused** - One test per behavior/scenario

## Test File Organization

```
automation/tests/
├── helpers.ts              # Shared utilities (auth flows, etc)
├── auth.signin.spec.ts     # Sign-in authentication tests
├── dashboard.spec.ts       # Dashboard feature tests
├── testcase.spec.ts        # Test case management tests
└── [feature].spec.ts       # Auto-generated tests per feature
```

## Troubleshooting

### Hook doesn't run
```bash
# Check hook is executable
ls -la .git/hooks/post-commit
# Should show: -rwxr-xr-x

# Make it executable if needed
chmod +x .git/hooks/post-commit
```

### Diff file missing
```bash
# Regenerate from last commit
git diff HEAD~1 HEAD > .claude/last_commit_diff.txt
```

### Tests fail to generate
- Ensure commit has meaningful code changes (not just docs)
- Verify file paths are correct in the diff
- Check that test follows EZTest patterns

## Examples

### Example 1: Add New API Endpoint

**You commit:**
```typescript
// app/api/projects/[id]/archive/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Archive project logic
}
```

**Claude generates:**
```typescript
// automation/tests/project-archive.spec.ts
test('POST /api/projects/:id/archive should archive project', async ({ request }) => {
  // Test with valid project ID
  // Test with invalid project ID
  // Test auth requirements
});
```

### Example 2: Add Sign-Out Button

**You commit:**
```typescript
// frontend/components/Header/SignOutButton.tsx
export function SignOutButton() {
  // Button that calls /api/auth/signout
}
```

**Claude generates:**
```typescript
// automation/tests/header-signout.spec.ts
test('sign out button should log out user', async ({ page }) => {
  // Login first
  // Click sign out
  // Verify redirect to signin page
});
```

## Integration with CI/CD

Tests generated by this system:
- Follow your existing Playwright patterns
- Are automatically run in CI via `npm test`
- Generate HTML reports on failure
- Capture screenshots and traces

## Disabling Auto-Generation

If you want to disable the post-commit hook:

```bash
# Temporarily disable
chmod -x .git/hooks/post-commit

# Remove completely
rm .git/hooks/post-commit
```

## Advanced: Custom Prompt

To customize how tests are generated, create `.claude/test-generation-prompt.md`:

```markdown
# Test Generation Instructions

When generating tests, please:
1. Always test error cases
2. Include auth validation
3. Test field validation
4. Test pagination for lists
5. Include cleanup (logout, delete test data)
```

Claude Code will use this when generating tests.

---

**Questions?** Check [CLAUDE.md](../CLAUDE.md) for general development guidance.
