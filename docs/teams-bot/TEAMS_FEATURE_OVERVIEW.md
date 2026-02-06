## EZTest Teams Integration – Feature Overview

This document summarizes the **Teams bot feature** we designed and implemented today: how it works, what phases it has, and how all pieces (bot, auth, Teams channel mapping, admin UI) fit together.

---

### 1. What This Feature Does

- **One Teams bot** (`@EZTest`) that works inside existing Teams channels.
- Each **channel is linked to one EZTest project** (channel → project mapping).
- Users can, from that channel:
  - Add test cases based on channel messages.
  - Add defects based on channel messages.
  - Comment on test cases.
  - List and inspect test cases.
- All operations respect **EZTest permissions (RBAC)** and **project membership**.

---

### 2. High-Level Architecture

- **Teams → Bot**
  - Teams sends messages and button actions to `POST /api/teams/messages`.
  - `lib/teams/adapter.ts` (BotFrameworkAdapter) validates and routes requests.
  - `lib/teams/handler.ts` inspects the text (e.g. `@EZTest add testcase`) and decides which command to run.

- **Context & Caching**
  - All non-command messages are cached in memory by `lib/teams/message-cache.ts` (per channel + user, 10-minute TTL).
  - When user later runs `@EZTest add testcase`, the bot uses the last cached message as the test case content.

- **Channel Mapping**
  - `TeamsChannelConfig` table in the database stores `teamId`, `channelId`, `projectId`.
  - `lib/teams/channel-mapper.ts` turns a Teams channel into a project ID.

- **User & Permissions**
  - `lib/teams/user-mapper.ts` maps Teams user (email/AAD) → EZTest `User`.
  - It verifies the user is a member of the mapped project and has the right permissions.

---

### 3. Phases of the Feature

#### Phase 1A – Backend Infrastructure (✅ done)

Files created:
- `lib/teams/adapter.ts` – Teams/Bot Framework integration.
+- `lib/teams/message-cache.ts` – in-memory cache of recent messages.
 - `lib/teams/parser.ts` – parses test case / defect text formats.
 - `lib/teams/handler.ts` – command routing and orchestration.
 - `lib/teams/channel-mapper.ts` – channel → project mapping.
 - `lib/teams/user-mapper.ts` – Teams user → EZTest user + RBAC.
 - `app/api/teams/messages/route.ts` – Teams webhook endpoint.
 - Prisma: `TeamsChannelConfig` model + migration.

What works:
- Bot can receive messages from Teams.
- Bot caches recent non-command messages.
- Bot can see `@EZTest …` commands and route them.
- Channel → project mapping is stored and queried.
- User → EZTest user mapping and project access checks.

#### Phase 1C – Authentication & Authorization (✅ designed in code)

- Map Teams identity → EZTest user via email/UPN.
- Check:
  - user exists in EZTest.
  - user is a member of the mapped project.
  - user has required permissions (e.g. can create test cases).
- If any check fails, bot returns clear error messages.

#### Phase 2A – Adaptive Card UI (🕓 to implement)

- Replace plain text replies with **Adaptive Cards** in Teams:
  - Test case preview card: shows parsed title, steps, expected result, priority, etc. with **Create / Edit / Cancel** buttons.
  - Defect preview card: similar structure for defects.
  - Channel configuration card: select EZTest project for channel.
  - Edit forms: allow user to tweak parsed content before saving.
  - Success cards: show created IDs like `TC-145` or `DEF-21`.

No business logic changes – this phase is **UI/UX only**.

#### Phase 2B – Full API Integration (🕓 to implement)

Wire buttons to EZTest backend:
- On “Create Test Case”:
  - Call `POST /api/projects/{projectId}/testcases`.
- On “Create Defect”:
  - Call `POST /api/projects/{projectId}/defects`.
- On “Add Comment”:
  - Call `POST /api/testcases/{testcaseId}/comments`.
- On “Link Defect to Test Case”:
  - Call `POST /api/testcases/{testcaseId}/defects/{defectId}`.

This turns the UI into **fully working workflows**.

---

### 4. How Test Case Creation from Channel Works

**User flow in Teams:**
1. User posts a well-structured message in the channel, e.g.:
   - `TC: …` + `Steps:` + `Expected Result:` (plus optional fields).
2. User then types `@EZTest add testcase` in the same channel.
3. Bot:
   - Retrieves the last cached message from that user in that channel.
   - Parses it into a structured test case via `parser.ts`.
   - Validates required fields exist.
   - Checks which project this channel is bound to.
   - Checks user has access to that project.
4. Phase 2A: Bot shows a **preview card** (with Create/Edit/Cancel).
5. Phase 2B: On Create, bot calls the EZTest API and confirms `TC-###` to the user.

The same pattern is re-used for:
- `@EZTest add defect`
- `@EZTest comment TC-123`

---

### 5. Channel → Project Mapping (including Admin UI concept)

- At runtime, the bot only sees `teamId` + `channelId` from Teams.
- `TeamsChannelConfig` tells it which `projectId` to use for that channel.
- We also designed an **Admin UI concept** (not implemented yet in code) so admins can:
  - List all Teams channel mappings.
  - Add/edit/remove mappings.
  - See which Teams channel is linked to which project.

This keeps user commands **simple** inside Teams:
- Users never select project in the command.
- The channel itself defines the project context.

---

### 6. What Is Already in the Codebase vs. Future Work

**Already implemented (today’s work):**
- New Teams bot backend structure (all `lib/teams/*` files).
- Teams webhook route (`/api/teams/messages`).
- Prisma model + migration for `TeamsChannelConfig`.
- Documentation for:
  - Setup (`QUICK_START.md`, `ENV_VARIABLES.md`).
  - Backend internals (`BACKEND_SETUP.md`).
  - Phase 1A summary (`PHASE_1A_COMPLETE.md`).
  - Index/entry point (`INDEX.md`).

**To be implemented next:**
- Adaptive Card JSON templates (Phase 2A).
- Card action handlers for create/edit/cancel (Phase 2A/2B).
- EZTest API calls to actually create test cases/defects/comments (Phase 2B).
- Optional admin UI for Teams channel mapping management.

---

### 7. Where to Look in the Repo

- **Teams bot core:**
  - `lib/teams/adapter.ts`
  - `lib/teams/message-cache.ts`
  - `lib/teams/parser.ts`
  - `lib/teams/handler.ts`
  - `lib/teams/channel-mapper.ts`
  - `lib/teams/user-mapper.ts`
  - `app/api/teams/messages/route.ts`
- **Database:**
  - `prisma/schema.prisma` (`TeamsChannelConfig`, relation on `Project`)
  - `prisma/migrations/[timestamp]_add_teams_channel_config/`
- **Docs to read with this file:**
  - `docs/teams-bot/QUICK_START.md` – how to run it.
  - `docs/teams-bot/BACKEND_SETUP.md` – deep technical setup.
  - `docs/teams-bot/PHASE_1A_COMPLETE.md` – detailed change log.

This single document is your **feature-level overview** of the Teams integration we designed and implemented today.


