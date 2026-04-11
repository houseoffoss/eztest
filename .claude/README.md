# .claude Directory - Claude Code Configuration

This directory contains project-specific Claude Code configurations for the EZTest application.

## Directory Structure

```
.claude/
├── README.md                          # This file
├── settings.json                      # Main Claude Code settings
├── hooks/                             # Hook definitions
│   ├── post-commit-test-generation.json
│   └── [other hooks]
└── skills/                            # Skill definitions
    ├── test-generator.md
    ├── code-reviewer.md
    └── [other skills]
```

## What's Here

### `settings.json`
Main configuration file for Claude Code in this project.

**Contains:**
- Project-level permissions
- Environment variables (if needed)
- References to hooks and skills
- Custom configurations

**Edit when:**
- Changing permissions
- Adding environment variables
- Modifying global behaviors

### `hooks/` Directory
Contains individual hook definitions that auto-run at specific events.

**Current Hooks:**
- `post-commit-test-generation.json` - Triggers test generation after commits

**Hook Events:**
- `PostToolUse` - After tool execution
- `PreToolUse` - Before tool execution
- `Stop` - When stopping/finishing
- `SessionStart` - When starting session

**Edit when:**
- Changing hook behavior
- Adding new automation
- Adjusting timing/conditions

### `skills/` Directory
Contains skill definitions (user-invocable commands and features).

**Current Skills:**
- `test-generator.md` - Generate Playwright tests
- `code-reviewer.md` - Review code quality

**Skill Purposes:**
- `/test-generator` - Auto-generate tests
- `/code-reviewer` - Review code
- Custom automation workflows

**Edit when:**
- Changing skill descriptions
- Adding new commands
- Updating documentation

## How It All Works

### Flow Diagram

```
USER ACTION
    ↓
HOOK TRIGGERS (if applicable)
    ├─ Analyzes action
    ├─ Runs automation
    └─ Provides feedback
    ↓
SKILL BECOMES AVAILABLE
    ├─ User can invoke with /skill-name
    ├─ Or ask Claude Code directly
    └─ Executes automated task
```

### Example: Post-Commit Test Generation

1. **You commit code**
   ```bash
   git commit -m "feat: Add feature"
   ```

2. **Post-commit hook triggers** (`hooks/post-commit-test-generation.json`)
   - Analyzes changed files
   - Stores diff for analysis
   - Suggests test generation

3. **Test generator skill available**
   - You ask: "Generate tests"
   - Claude uses the skill
   - Tests are created

4. **Tests ready to run**
   ```bash
   npm test
   ```

## Configuration Files Explained

### `settings.json`
```json
{
  "permissions": {
    "allow": ["Bash(npm:*)", "Bash(git:*)", "Read", "Edit", "Write"]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [...]
      }
    ]
  }
}
```

### Hook Definition
```json
{
  "name": "Hook Name",
  "description": "What it does",
  "event": "PostToolUse",
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "shell command",
      "statusMessage": "Message shown to user"
    }
  ]
}
```

### Skill Definition
```markdown
# Skill Name

## Description
What this skill does.

## How to Use
How to trigger and use it.

## What It Does
Detailed functionality.
```

## Quick Start

### Use Existing Skills
```bash
# In Claude Code, type:
/test-generator

# Or ask naturally:
Generate tests for my changes
```

### Create New Skill
1. Create file: `skills/my-skill.md`
2. Write skill documentation
3. Restart Claude Code
4. Use with: `/my-skill`

### Create New Hook
1. Create file: `hooks/my-hook.json`
2. Define hook configuration
3. Reference in `settings.json`
4. Restart Claude Code

### Edit Existing Configuration
1. Edit `settings.json` directly
2. Or edit specific files in `hooks/` or `skills/`
3. Restart Claude Code to apply changes

## Best Practices

### ✅ DO
- Keep hooks focused on one task
- Document skills clearly in markdown
- Use descriptive file names
- Add comments to complex configurations
- Test changes before committing

### ❌ DON'T
- Put everything in one file
- Forget to document new skills
- Create hooks that block commits
- Ignore error messages from hooks
- Commit sensitive data (API keys, tokens)

## Team Collaboration

These files are **committed to Git**, so all team members get:
- ✅ Same hooks and automations
- ✅ Same skill definitions
- ✅ Same permissions setup
- ✅ Consistent experience

**Shared configurations:**
- ✅ `.claude/hooks/` - Team hooks
- ✅ `.claude/skills/` - Team skills
- ✅ `.claude/settings.json` - Team settings

**Personal overrides:**
- 📝 `.claude/settings.local.json` - In .gitignore
- 📝 `~/.claude/settings.json` - Global personal settings

## Troubleshooting

### Hooks not triggering
```bash
# Check hook syntax
cat hooks/my-hook.json | jq '.'

# Verify in settings.json
grep -A5 "hooks" settings.json
```

### Skills not appearing
```bash
# Restart Claude Code
# Or open /hooks menu to reload config
```

### Permissions issues
```bash
# Check permissions in settings.json
cat settings.json | jq '.permissions'

# Add missing permission:
# Edit settings.json and add to "allow" array
```

## Documentation

- **Setup Guide:** `SETUP_CHECKLIST.md`
- **Quick Start:** `AUTOMATION_QUICK_START.md`
- **Full Guide:** `docs/TESTING_AUTOMATION.md`
- **Hooks Summary:** `HOOKS_AND_SKILLS_SUMMARY.md`

## File Locations

| Type | Location | Purpose |
|------|----------|---------|
| **Project Settings** | `.claude/settings.json` | This project's config |
| **Project Hooks** | `.claude/hooks/` | Automated tasks |
| **Project Skills** | `.claude/skills/` | Custom commands |
| **Global Settings** | `~/.claude/settings.json` | All your projects |
| **Global Hooks** | `~/.claude/hooks/` | Your personal automation |

## Version Control

```bash
# What's committed (shared with team):
.claude/
├── settings.json          # ✅ Commit
├── hooks/                 # ✅ Commit
└── skills/                # ✅ Commit

# What's NOT committed (personal):
.claude/settings.local.json # 📝 .gitignore
```

## Getting Help

1. **Check existing skills:** `ls skills/`
2. **Read documentation:** `cat README.md`
3. **Review examples:** `cat skills/test-generator.md`
4. **Ask Claude Code:** "How do I use skills?"

---

**This directory keeps your Claude Code experience organized, consistent, and shareable with your team!** 🚀

Last Updated: 2026-03-28
