# EZTest Teams Bot - Complete Documentation Index

## 📚 Documentation Files

| Document | Purpose | Read First? |
|----------|---------|-------------|
| **QUICK_START.md** | Step-by-step to get started | ✅ YES - Start here! |
| **PHASE_1A_COMPLETE.md** | What was built in Phase 1A | ✅ YES - Overview |
| **BACKEND_SETUP.md** | Detailed architecture & file explanations | Read after setup |
| **ENV_VARIABLES.md** | How to get Azure credentials | Read for setup |

---

## 🚀 Quick Navigation

### I'm New - Where Do I Start?
1. Read **QUICK_START.md** (5 min)
2. Read **PHASE_1A_COMPLETE.md** (10 min)
3. Ask team lead for credentials (see **ENV_VARIABLES.md**)
4. Add credentials to `.env`
5. Run: `npx prisma migrate dev`
6. ✅ You're ready!

### I Need to Understand the Architecture
1. Read **BACKEND_SETUP.md** - Architecture diagram section
2. Look at file structure in **BACKEND_SETUP.md**
3. Check inline comments in each file (all well-documented)

### I Need to Add Features
1. Read **BACKEND_SETUP.md** - File structure section
2. Look at the handler.ts file - All commands are there
3. See Phase 2 section in **BACKEND_SETUP.md**

### I'm Deploying to Production
1. See **QUICK_START.md** - Environment variables section
2. Check **BACKEND_SETUP.md** - Deployment notes

---

## 📂 Code Files Created

### Core Bot Files (6 files in `lib/teams/`)

```typescript
// lib/teams/adapter.ts
export const teamsAdapter = new BotFrameworkAdapter({...})
// Bot Framework initialization & error handling

// lib/teams/message-cache.ts
export const messageCache = new MessageCache(10)
// In-memory cache for recent messages (10-min TTL)

// lib/teams/parser.ts
export function parseTestCase(text: string): ParsedTestCase
export function parseDefect(text: string): ParsedDefect
// Parse human-readable formats from messages

// lib/teams/handler.ts
export async function handleTeamsMessage(context: TurnContext)
// Route commands to appropriate handlers

// lib/teams/channel-mapper.ts
export async function getProjectIdForChannel(channelId: string)
export async function configureChannel(...)
// Map Teams channels to EZTest projects

// lib/teams/user-mapper.ts
export async function mapTeamsUserToEZTestUser(teamsUser)
export async function hasProjectAccess(userId, projectId)
// Map Teams users to EZTest users & check permissions
```

### API Endpoint (1 file)

```typescript
// app/api/teams/messages/route.ts
export async function POST(req: NextRequest)
export async function GET(req: NextRequest)
// Next.js webhook endpoint for Teams events
```

### Database Migration (1)

```
prisma/migrations/[timestamp]_add_teams_channel_config/
├── migration.sql
└── migration_lock.toml
```

---

## 🎯 What Each File Does (Simple Version)

### adapter.ts
**What:** Connects to Microsoft Teams  
**Does:** Validates requests from Teams, handles errors  
**Uses:** `MICROSOFT_APP_ID` and `MICROSOFT_APP_PASSWORD` from Azure

### message-cache.ts
**What:** Temporary storage for recent messages  
**Does:** Stores "Login page is broken" so bot can use it later  
**Auto:** Cleans up old messages after 10 minutes

### parser.ts
**What:** Converts text to structured data  
**Does:** Reads "TC: Login" and extracts title, steps, etc.  
**Returns:** `{title: "Login", steps: [...], expectedResult: [...]}`

### handler.ts
**What:** Main command processor  
**Does:** Figures out what user wants and calls right function  
**Commands:** add testcase, list testcases, add defect, comment, help, configure

### channel-mapper.ts
**What:** Links Teams channels to EZTest projects  
**Does:** "This channel uses Project XYZ"  
**Queries:** `TeamsChannelConfig` table in database

### user-mapper.ts
**What:** Links Teams users to EZTest users  
**Does:** "john@company.com in Teams = john@company.com in EZTest"  
**Checks:** User has permission to use the project

### route.ts (API endpoint)
**What:** Where Teams sends webhook events  
**URL:** `POST /api/teams/messages`  
**Does:** Receives message → processes with adapter → calls handler

---

## 💾 Database Table Created

### TeamsChannelConfig
Stores which Teams channel is connected to which EZTest project.

```sql
CREATE TABLE "TeamsChannelConfig" (
  id           TEXT PRIMARY KEY,
  teamId       TEXT NOT NULL,
  channelId    TEXT UNIQUE NOT NULL,
  projectId    TEXT NOT NULL REFERENCES "Project"(id),
  configuredBy TEXT NOT NULL,
  createdAt    TIMESTAMP DEFAULT now(),
  updatedAt    TIMESTAMP
)
```

**Relationships:**
- Each channel has ONE project
- Each project can have MANY channels
- Soft delete not needed (just delete the config row)

---

## 🔄 Message Flow

```
1. User types in Teams channel:
   "Login fails with special chars"

2. User types command:
   "@EZTest add testcase"

3. Teams sends webhook to:
   POST /api/teams/messages

4. route.ts receives request

5. teamsAdapter validates credentials

6. handleTeamsMessage() processes:
   - Extract channel ID & user ID
   - NOT @EZTest mention? → Cache message → Done
   - IS @EZTest mention? → Continue...

7. mapTeamsUserToEZTestUser() finds EZTest user

8. getProjectIdForChannel() finds project

9. hasProjectAccess() checks permissions

10. Command handler processes:
    - For "add testcase" command:
      - Get cached message
      - Parse test case format
      - Show preview (Phase 2)
      - Save to EZTest API (Phase 2)
```

---

## 🛠️ Commands Available

All commands start with `@EZTest`:

| Command | What It Does | Phase |
|---------|-------------|-------|
| `@EZTest help` | Show all commands | ✅ 1A |
| `@EZTest configure` | Bind channel to project | 2B |
| `@EZTest add testcase` | Create test case from message | 2B |
| `@EZTest list testcases` | Show recent test cases | 2B |
| `@EZTest show testcase TC-123` | Show test case details | 2B |
| `@EZTest add defect` | Create defect from message | 2B |
| `@EZTest comment TC-123` | Add comment to test case | 2B |

**Phase 1A:** Skeleton is built, placeholder responses  
**Phase 2B:** Real implementation with full features

---

## ✅ What's Working Now

- ✅ Message caching (10-min TTL)
- ✅ Message parsing (test cases & defects)
- ✅ User mapping (Teams → EZTest)
- ✅ Project access checks (RBAC)
- ✅ Command routing
- ✅ Error handling
- ✅ Logging

## ⏳ What's Placeholder (Phase 2+)

- ⏳ Adaptive Cards (UI)
- ⏳ Full API integration
- ⏳ Test case creation
- ⏳ Defect creation with linking
- ⏳ Comments
- ⏳ Pagination
- ⏳ Rate limiting

---

## 🔐 Security Features

### Currently Implemented
- Project membership validation (RBAC)
- Email-based user mapping
- No sensitive data in cache
- TTL-based cache auto-cleanup
- Error messages without exposing secrets
- Type-safe TypeScript

### Coming in Phase 2
- Rate limiting
- Channel admin detection
- Audit logging
- Comprehensive permission checks

---

## 🧪 Testing

### Local Testing (Phase 3)
```bash
# Install ngrok
npm install -g ngrok

# Run EZTest
npm run dev

# In another terminal, expose it
ngrok http 3000

# Get URL like: https://abc-123.ngrok.io
# Add to Teams Developer Portal
```

### Verification Checklist
```bash
# Check dependencies
npm list botbuilder

# Check files
ls lib/teams/ app/api/teams/messages/

# Check database
npx prisma migrate status

# Type check
npx tsc --noEmit
```

---

## 📖 Reading Order

1. **QUICK_START.md** - Get started quickly (5 min)
2. **This file** - Understand structure (10 min)
3. **PHASE_1A_COMPLETE.md** - See what was built (10 min)
4. **BACKEND_SETUP.md** - Deep dive into architecture (20 min)
5. **Individual files** - Read code with comments

---

## 🎓 Key Concepts

### Message Cache
- Stores most recent message from each user per channel
- TTL of 10 minutes (auto-cleanup)
- In-memory only (no database)
- Key: `channelId:userId`
- Value: `{text, timestamp, messageId}`

### User Mapping
- Teams email must match EZTest email
- Looks up user by email (primary) or UPN (fallback)
- Returns both userId and email
- Falls back to NULL if not found

### Channel Mapping
- One channel = one project
- Stored in `TeamsChannelConfig` table
- Can be reconfigured anytime
- Checked before every command

### RBAC Validation
- Checks `ProjectMember` table
- Validates user is member of project
- Can check specific permissions if needed
- Falls back to NULL if not found

### Command Routing
- All commands start with `@EZTest`
- Text is searched for keywords (case-insensitive)
- Routes to appropriate handler
- `help` command always available

---

## 🆘 Common Questions

**Q: Do I need to implement all files?**  
A: No! Phase 1A is done. Move to Phase 2 for features.

**Q: Where do I add new commands?**  
A: In `handler.ts`, add new `if` statement and create new handler function.

**Q: How do I test locally?**  
A: Use ngrok (see Phase 3 testing guide).

**Q: What if user is not in EZTest?**  
A: Bot shows error: "Could not map your Teams account to EZTest."

**Q: What if channel is not configured?**  
A: Bot shows error: "This channel is not configured with an EZTest project."

**Q: How long are messages cached?**  
A: 10 minutes by default (configurable in message-cache.ts).

---

## 📞 Support Resources

- **Azure Setup:** `ENV_VARIABLES.md`
- **Architecture:** `BACKEND_SETUP.md`
- **Code Docs:** Inline comments in each file
- **Quick Help:** This file!

---

## 🎯 Next Phase

After Phase 1A complete:
1. Get credentials from team lead
2. Add to `.env`
3. Run migrations
4. Move to Phase 1B (Database) or Phase 2 (Features)

**Ready to proceed?** Check `QUICK_START.md`! 🚀

