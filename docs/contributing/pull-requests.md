# Pull Request Guidelines

How to submit pull requests to EzTest.

## Before You Start

### Check First

1. **Search existing PRs** - Avoid duplicates
2. **Check issues** - Related issue exists?
3. **Discuss major changes** - Open issue first

### Sync Your Fork

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## Creating a Pull Request

### 1. Create Branch

```bash
# Branch from main
git checkout main
git checkout -b feature/your-feature-name
```

**Branch Naming:**

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/add-export` |
| Bug Fix | `fix/description` | `fix/login-error` |
| Docs | `docs/description` | `docs/update-api` |
| Refactor | `refactor/description` | `refactor/auth-flow` |

### 2. Make Changes

- Follow [coding standards](./coding-standards.md)
- Write clear commit messages
- Keep changes focused
- Update docs if needed

### 3. Commit Changes

**Commit Message Format:**

```
type(scope): short description

Longer description if needed.

Fixes #123
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructure
- `test` - Tests
- `chore` - Maintenance

**Examples:**

```bash
git commit -m "feat(testcases): add bulk export to CSV"
git commit -m "fix(auth): resolve session timeout on refresh"
git commit -m "docs(api): add test runs endpoint examples"
```

### 4. Push Branch

```bash
git push origin feature/your-feature-name
```

### 5. Open PR on GitHub

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the template

---

## PR Template

```markdown
## Summary

Brief description of what this PR does.

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI change
- [ ] ♻️ Refactoring (no functional changes)

## Related Issues

Fixes #(issue number)

## Changes Made

- Change 1
- Change 2
- Change 3

## How to Test

1. Step to test
2. Another step
3. Expected result

## Screenshots (if UI change)

| Before | After |
|--------|-------|
| image  | image |

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have run `npm run lint` and it passes
- [ ] I have tested my changes locally
```

---

## PR Best Practices

### Keep PRs Small

- One feature or fix per PR
- Easier to review
- Faster to merge
- Less likely to conflict

### Good PR:
- ~200-400 lines changed
- Single purpose
- Clear description

### Avoid:
- Multiple unrelated changes
- Massive refactors + features
- Formatting changes mixed with logic

### Write Good Descriptions

**Bad:**
> "Fixed stuff"

**Good:**
> "Fix login redirect loop when session expires
>
> Users were experiencing infinite redirects when their session expired
> while on a protected page. This fix checks for valid session before
> redirect and properly handles the expired state.
>
> - Added session validation in middleware
> - Updated redirect logic in auth callback
> - Added test for expired session handling
>
> Fixes #42"

### Include Screenshots

For UI changes, always include before/after screenshots.

### Respond to Feedback

- Be open to suggestions
- Ask questions if unclear
- Make requested changes promptly
- Thank reviewers

---

## Review Process

### What Reviewers Look For

1. **Correctness** - Does it work?
2. **Code Quality** - Is it clean?
3. **Tests** - Is it tested?
4. **Documentation** - Is it documented?
5. **Security** - Any vulnerabilities?
6. **Performance** - Any issues?

### Review Timeline

- **Initial review:** 1-3 business days
- **Follow-up reviews:** 1-2 days

### If Changes Requested

1. Read feedback carefully
2. Ask questions if needed
3. Make changes
4. Push new commits
5. Re-request review

```bash
# Make changes
git add .
git commit -m "address review feedback"
git push origin feature/your-feature
```

### After Approval

Maintainers will merge your PR. Options:

- **Squash and merge** - For small PRs
- **Rebase and merge** - For clean history
- **Merge commit** - For larger PRs

---

## Common Issues

### Merge Conflicts

```bash
# Update your branch
git fetch upstream
git merge upstream/main

# Resolve conflicts manually
# Then commit
git add .
git commit -m "resolve merge conflicts"
git push origin feature/your-feature
```

### CI Failures

- Check the failing check
- Fix the issue locally
- Push fix

```bash
# Run locally first
npm run lint
npm run build

# Fix and push
git add .
git commit -m "fix lint errors"
git push
```

### Stale PR

If your PR is inactive for a while:

```bash
# Rebase on latest main
git fetch upstream
git rebase upstream/main
git push -f origin feature/your-feature
```

---

## After Merge

### Cleanup

```bash
# Delete local branch
git checkout main
git branch -d feature/your-feature

# Delete remote branch
git push origin --delete feature/your-feature

# Sync with upstream
git pull upstream main
git push origin main
```

### Recognition

- Your contribution is recorded
- You may be mentioned in release notes
- Thank you! 🎉

---

## Questions?

- Ask in the PR comments
- Open a discussion
- Check existing PRs for examples
