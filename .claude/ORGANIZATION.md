# Claude Code Organization Guide

## Overview

Your Claude Code configuration is now organized into clean, separate folders instead of one large file.

## Old Structure ❌
```
.claude/
└── settings.json          (everything in one file)
```

## New Structure ✅
```
.claude/
├── README.md              # Overview & documentation
├── ORGANIZATION.md        # This file
├── settings.json          # Main config (clean & simple)
├── hooks/                 # Hook definitions
│   └── post-commit-test-generation.json
└── skills/                # Skill definitions
    ├── test-generator.md
    ├── code-reviewer.md
    └── [future skills]
```

## What Changed

### `settings.json` - Now Cleaner ✅

**Before (Everything):**
```json
{
  "hooks": { ... large hook config ... },
  "permissions": { ... permissions ... }
}
```

**After (Just essentials):**
```json
{
  "comment": "See .claude/README.md for details",
  "permissions": { ... },
  "hooks": { ... actual hooks only ... }
}
```

### `hooks/` - Individual Hook Files

**New approach:**
```
hooks/
└── post-commit-test-generation.json   (one hook = one file)
```

**Benefits:**
- ✅ Easy to find and edit hooks
- ✅ Clear responsibility per file
- ✅ Can add more hooks without clutter
- ✅ Team can work on different hooks

### `skills/` - Skill Definitions

**New approach:**
```
skills/
├── test-generator.md      (test generation skill)
├── code-reviewer.md       (code review skill)
└── [future skills]        (new skills here)
```

**Benefits:**
- ✅ Clear documentation per skill
- ✅ Easy to understand what each does
- ✅ Skills can be shared/published
- ✅ Better for team onboarding

## Benefits of New Organization

| Aspect | Before | After |
|--------|--------|-------|
| **File Size** | Large monolithic file | Small focused files |
| **Finding Things** | Search through one file | One file per function |
| **Adding Hooks** | Edit settings.json | Add hooks/my-hook.json |
| **Adding Skills** | No clear structure | Create skills/my-skill.md |
| **Documentation** | Mixed with config | In dedicated README.md |
| **Team Onboarding** | Confusing | Clear structure |
| **Version Control** | See entire config change | See targeted changes |

## File Purposes

### `settings.json`
**What:** Main Claude Code configuration
**Edit for:**
- Changing permissions
- Adjusting existing hooks
- Environment variables

**Keep minimal - just essential config**

### `hooks/post-commit-test-generation.json`
**What:** Hook that runs after git commits
**Does:**
- Analyzes code changes
- Suggests test generation
- Provides feedback

**Edit for:**
- Changing when hook runs
- Modifying hook behavior
- Adjusting timeouts

### `skills/test-generator.md`
**What:** Documentation for test generation skill
**Contains:**
- What the skill does
- How to use it
- Examples
- Tips

**Edit for:**
- Updating documentation
- Adding examples
- Clarifying usage

### `README.md`
**What:** Overview of the .claude directory
**Contains:**
- Structure explanation
- How files work together
- Quick start guide
- Troubleshooting

**Read for:**
- Understanding the setup
- Learning how to add new things
- Getting help

### `ORGANIZATION.md`
**What:** This file - explains the organization
**Helps you:**
- Understand the structure
- Know where to make changes
- Learn benefits of the new setup

## How to Add New Things

### Add a New Hook

1. Create file: `.claude/hooks/my-new-hook.json`
2. Define the hook:
   ```json
   {
     "name": "My Hook",
     "event": "PostToolUse",
     "matcher": "Bash",
     "hooks": [{ "type": "command", "command": "..." }]
   }
   ```
3. Reference in `settings.json` hooks section
4. Restart Claude Code

### Add a New Skill

1. Create file: `.claude/skills/my-skill.md`
2. Write documentation:
   ```markdown
   # My Skill Name

   ## Description
   What it does.

   ## How to Use
   How to trigger it.
   ```
3. Restart Claude Code or open `/hooks` menu
4. Use with: `/my-skill`

### Update Existing Hook

1. Edit the file: `.claude/hooks/post-commit-test-generation.json`
2. Change the configuration
3. Restart Claude Code

### Update Existing Skill

1. Edit the file: `.claude/skills/test-generator.md`
2. Update documentation
3. Restart Claude Code

## File Editing Quick Reference

| Want to change... | Edit file... |
|---|---|
| Permissions | `settings.json` |
| Hook behavior | `hooks/*.json` |
| Skill docs | `skills/*.md` |
| Overall structure | `README.md` |

## Team Workflow

### Committed to Git ✅
```
.claude/
├── settings.json
├── hooks/
└── skills/
```
Everyone on the team gets the same setup!

### Personal Overrides (in .gitignore)
```
.claude/settings.local.json    # Your personal tweaks
```
Your personal customizations don't affect the team.

### Global Settings (on your machine)
```
~/.claude/settings.json        # All your projects
```
Settings for all your Claude Code projects.

## Examples

### Example 1: Edit Hook Behavior
```bash
# Want to change how post-commit hook works?
nano .claude/hooks/post-commit-test-generation.json
# Edit the "command" field
# Restart Claude Code
```

### Example 2: Add New Skill
```bash
# Want to add a new skill?
cat > .claude/skills/my-automation.md << 'EOF'
# My Automation Skill

## Description
This does something useful.

## How to Use
Ask Claude Code or type: /my-automation
EOF

# Restart Claude Code and use it!
```

### Example 3: Change Permissions
```bash
# Want to allow more commands?
# Edit .claude/settings.json
# Add to "permissions.allow" array:
"Bash(docker:*)",
"Bash(npm run:*)"
```

## Navigation Tips

### Understanding the Setup
1. Read `.claude/README.md` first
2. Then read this file (ORGANIZATION.md)
3. Check individual files as needed

### Finding Where to Make Changes
- **Want to modify hook?** → Check `.claude/hooks/`
- **Want to add skill?** → Create in `.claude/skills/`
- **Want to adjust settings?** → Edit `.claude/settings.json`
- **Need documentation?** → Read `.claude/README.md`

### Learning by Example
- Look at `hooks/post-commit-test-generation.json` for hook structure
- Look at `skills/test-generator.md` for skill documentation
- Check `settings.json` for main configuration

## Backwards Compatibility

### Migration from Old Structure
If you had everything in `settings.json` before:
1. ✅ Hooks have been moved to `hooks/` folder
2. ✅ Skills have been moved to `skills/` folder
3. ✅ `settings.json` still works the same way
4. ✅ Existing hooks still function
5. ✅ No changes needed - it just works!

### Can I go back?
Yes! You can always put everything back in `settings.json` if you prefer. The new structure is optional but recommended.

## Troubleshooting

### "Hook not running"
Check: `.claude/hooks/post-commit-test-generation.json`
- Is it valid JSON? (`jq . hooks/*.json`)
- Is it referenced in `settings.json`?
- Restart Claude Code

### "Skill not appearing"
Check: `.claude/skills/my-skill.md`
- Does file exist?
- Is it properly named?
- Restart Claude Code or open `/hooks` menu

### "Settings not applying"
1. Check JSON syntax: `jq . .claude/settings.json`
2. Restart Claude Code
3. Check `.claude/settings.local.json` (might override)
4. Check `~/.claude/settings.json` (global might override)

## Summary

- ✅ **Cleaner:** Each file has one clear purpose
- ✅ **Organized:** Hooks, skills, and config in folders
- ✅ **Maintainable:** Easy to find and edit things
- ✅ **Scalable:** Simple to add new hooks/skills
- ✅ **Team-friendly:** Clear structure for collaboration
- ✅ **Documented:** README for each part

**Your Claude Code setup is now organized for success!** 🚀

---

**Questions?** Check:
- `.claude/README.md` - Overview
- `SETUP_CHECKLIST.md` - Verification
- `AUTOMATION_QUICK_START.md` - Quick start
