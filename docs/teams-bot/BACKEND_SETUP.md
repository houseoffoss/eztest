# EZTest Teams Bot - Backend Setup Guide

This guide walks you through setting up the Teams bot backend infrastructure for EZTest.

## Phase 1A Completion Checklist ✅

- [x] Install dependencies (`botbuilder`)
- [x] Create `lib/teams/adapter.ts` - Bot Framework adapter
- [x] Create `lib/teams/message-cache.ts` - Message caching with TTL
- [x] Create `lib/teams/parser.ts` - Parse testcase & defect formats
- [x] Create `lib/teams/handler.ts` - Command routing
- [x] Create `lib/teams/channel-mapper.ts` - Channel → Project mapping
- [x] Create `lib/teams/user-mapper.ts` - Teams user → EZTest user mapping
- [x] Create `app/api/teams/messages/route.ts` - Next.js webhook endpoint
- [x] Update Prisma schema with `TeamsChannelConfig` model
- [x] Create Prisma migration

## File Structure Created

```
lib/teams/
├── adapter.ts              # Bot Framework setup & error handling
├── message-cache.ts        # In-memory message cache (TTL: 10min)
├── parser.ts               # Parse test case & defect formats
├── handler.ts              # Command routing & processing
├── channel-mapper.ts       # Map channel → project
└── user-mapper.ts          # Map Teams user → EZTest user

app/api/teams/
└── messages/
    └── route.ts            # Next.js webhook endpoint for Teams

prisma/
└── migrations/
    └── [timestamp]_add_teams_channel_config/
        └── migration.sql   # Database migration
```

## What Each File Does

### `lib/teams/adapter.ts`
- Initializes the Bot Framework adapter with Azure credentials
- Handles errors and sends friendly messages to Teams
- **Depends on:** `MICROSOFT_APP_ID` and `MICROSOFT_APP_PASSWORD` env vars

### `lib/teams/message-cache.ts`
- Stores recent channel messages with 10-minute TTL
- Automatically cleans up expired messages
- Used to convert recent messages into test cases/defects
- Format: `channelId:userId` → message content

### `lib/teams/parser.ts`
- Parses human-readable test case format from messages
- Parses human-readable defect format from messages
- Validates parsed data has required fields
- **Formats supported:**
  - Test Case: `TC: Title`, `Steps:`, `Expected Result:`
  - Defect: `BUG: Title`, `Steps to Reproduce:`, `Actual Result:`, `Expected Result:`

### `lib/teams/handler.ts`
- Routes @EZTest commands to appropriate handlers
- Commands implemented (with placeholders):
  - `@EZTest configure` - Setup channel
  - `@EZTest add testcase` - Create testcase
  - `@EZTest list testcases` - Show testcases
  - `@EZTest show testcase TC-XXX` - Show details
  - `@EZTest add defect` - Create defect
  - `@EZTest comment TC-XXX` - Add comment
  - `@EZTest help` - Show commands

### `lib/teams/channel-mapper.ts`
- Queries `TeamsChannelConfig` table
- Methods:
  - `getProjectIdForChannel()` - Get project from channel
  - `isChannelConfigured()` - Check if configured
  - `configureChannel()` - Save configuration
  - `getChannelConfig()` - Get full config details

### `lib/teams/user-mapper.ts`
- Maps Teams user (AAD Object ID / email) to EZTest user
- Checks project access via RBAC
- Methods:
  - `mapTeamsUserToEZTestUser()` - Find EZTest user
  - `hasProjectAccess()` - Check permissions
  - `getUserProjectRole()` - Get role in project
  - `isChannelAdmin()` - Check channel admin status

### `app/api/teams/messages/route.ts`
- Next.js API route that receives Teams webhook events
- Converts Next.js request/response to BotBuilder format
- Processes messages through the adapter and handler
- **Endpoint:** `POST /api/teams/messages`

### `prisma/schema.prisma`
- Added `TeamsChannelConfig` model
  - `teamId` - Microsoft Teams Team ID
  - `channelId` - Microsoft Teams Channel ID (unique)
  - `projectId` - EZTest Project ID (FK to Project)
  - `configuredBy` - User who configured it
- Added relationship to `Project` model

## Next Steps

### Step 1: Apply Database Migration
```bash
npx prisma migrate dev
```

### Step 2: Get Azure Credentials
Send your team lead this request:
```
I need Azure credentials for the Teams bot:
- Microsoft App ID (from Azure Bot registration)
- Client Secret (from App Registration)
- (Optional) Azure Tenant ID
```

See `docs/teams-bot/ENV_VARIABLES.md` for detailed instructions.

### Step 3: Add Environment Variables
Update your `.env` or `.env.local`:
```bash
MICROSOFT_APP_ID=your-app-id
MICROSOFT_APP_PASSWORD=your-client-secret
AZURE_TENANT_ID=your-tenant-id (optional)
```

### Step 4: Test Locally
1. Start your EZTest server: `npm run dev`
2. Install ngrok: `npm install -g ngrok`
3. Expose your server: `ngrok http 3000`
4. Copy the ngrok URL and add to Teams Developer Portal

See Phase 3 testing guide for detailed instructions.

## Architecture Diagram

```
Microsoft Teams
       ↓
Bot Framework
       ↓
MICROSOFT_APP_ID + MICROSOFT_APP_PASSWORD
       ↓
teamsAdapter (adapter.ts)
       ↓
POST /api/teams/messages (route.ts)
       ↓
handleTeamsMessage() (handler.ts)
       ↓
├─ mapTeamsUserToEZTestUser() (user-mapper.ts)
├─ getProjectIdForChannel() (channel-mapper.ts)
├─ messageCache (message-cache.ts)
├─ parseTestCase() (parser.ts)
└─ parseDefect() (parser.ts)
       ↓
EZTest Database + APIs
```

## Current Limitations (Placeholders)

These features are implemented as placeholders and need full implementation:

1. **Adaptive Cards** - Currently sending plain text messages
2. **Full Command Handlers** - Need to call EZTest APIs
3. **Database Persistence** - Currently using in-memory cache only
4. **Rate Limiting** - Not yet implemented
5. **Teams Admin Detection** - Placeholder implementation
6. **Preview Cards** - Need Adaptive Card JSON templates

## Key Design Decisions

1. **Message Caching** - In-memory with TTL to avoid storing sensitive data
2. **Channel Binding** - One project per channel (simplicity)
3. **User Mapping** - Email-based (Teams email must match EZTest email)
4. **Error Handling** - Friendly messages to users, logging to console
5. **API Routes** - Using Next.js App Router for webhook endpoint

## Troubleshooting

### Bot not receiving messages?
1. Check `MICROSOFT_APP_ID` and `MICROSOFT_APP_PASSWORD` are correct
2. Verify ngrok URL is in Teams Developer Portal
3. Check bot was added to the Teams channel

### User mapping not working?
1. Ensure Teams user email matches EZTest user email
2. Check user is a member of the project in EZTest

### Channel not configured?
1. Run `@EZTest configure` in the channel
2. Check `TeamsChannelConfig` table was created via migration

## Testing Locally

See `docs/teams-bot/LOCAL_TESTING.md` for detailed testing instructions.

## What's Next?

- Phase 1B: Database & Persistence
- Phase 2A: Adaptive Card UI
- Phase 2B: Core Features (Add Test Case, List Test Cases, Add Defect)
- Phase 3: Local Testing with ngrok
- Phase 5: Production Deployment

