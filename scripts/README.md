# Utility Scripts

This directory contains utility scripts for database management and system checks.

## Scripts

### `add-modules.ts`

**Purpose:** Database migration utility to add module associations to existing test cases

**Usage:**
```bash
npx tsx scripts/add-modules.ts
```

**What it does:**
- Creates modules for the demo project
- Associates existing test cases with their appropriate modules based on test suite
- Useful for migrating existing data when the module feature was added

### `check-permissions.ts`

**Purpose:** Display all role permissions in the database

**Usage:**
```bash
npx tsx scripts/check-permissions.ts
```

**What it does:**
- Queries the database for all roles and their permissions
- Displays a summary grouped by permission category
- Useful for verifying RBAC configuration

## Requirements

- Node.js 18+
- `tsx` package (included in dev dependencies)
- Database must be running and accessible via `DATABASE_URL` environment variable

## Notes

These are utility scripts meant to be run manually or during database migrations. They are not imported or used in the application code.
