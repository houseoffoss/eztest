# EZTest Teams Bot - Environment Variables Guide

Add these variables to your `.env` or `.env.local` file:

## Required Variables

```bash
# Microsoft Bot Framework credentials
# Get these from Azure Portal after creating the Azure Bot (AI Bot Service)
MICROSOFT_APP_ID=<your-app-id>
MICROSOFT_APP_PASSWORD=<your-client-secret>
```

## Optional but Recommended Variables

```bash
# Azure Tenant ID (needed for multi-tenant deployments and SSO)
AZURE_TENANT_ID=<your-tenant-id>

# Bot cache settings
BOT_MESSAGE_CACHE_TTL_MINUTES=10      # How long to keep messages in cache (default: 10)
BOT_RATE_LIMIT_PER_MINUTE=10          # Commands per minute per user (prevent spam)
```

## Getting Your Credentials

### Step 1: Create Azure Bot Registration
1. Go to Azure Portal: https://portal.azure.com
2. Search for "Azure AI Bot"
3. Click "Create"
4. Fill in:
   - Bot handle: `eztest-bot`
   - Subscription: Select your subscription
   - Resource group: Create new or select existing
   - Pricing tier: F0 (Free)
5. Under "App Registration", create a new app
6. Copy the **Microsoft App ID**
7. Go to App Registration → Certificates & Secrets → Create Client Secret
8. Copy the **Client Secret value** (shown only once!)

### Step 2: Create Teams Developer Portal App
1. Go to https://dev.teams.microsoft.com
2. Click "Apps" → "New app"
3. Name: `EZTest`
4. Go to "App features" → "Bot"
5. Click "Existing bot" and paste your Microsoft App ID
6. Enable scopes:
   - ✅ Team
   - ✅ Group chat
7. Copy the messaging endpoint URL (you'll set this after deploying)

### Step 3: Get Azure Tenant ID
1. Go to Azure Portal
2. Search for "Azure Active Directory"
3. Click "Manage" → "Properties"
4. Copy the **Tenant ID**

## Security Best Practices

⚠️ **IMPORTANT:**
- Never commit credentials to git
- Use `.env.local` for local development
- Use environment variables in production (CI/CD secrets, etc.)
- Rotate Client Secret regularly
- Use `.gitignore` to exclude `.env` files

