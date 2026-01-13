# How to Get Your JWT Token from EZTest

Quick guide to extract your JWT token from EZTest login session.

## Step-by-Step Instructions

### Step 1: Log in to EZTest

1. Open your browser
2. Go to your EZTest URL (e.g., `https://eztest.example.com` or `http://localhost:3000`)
3. Log in with your email and password

### Step 2: Open Developer Tools

- **Windows/Linux:** Press `F12` or `Ctrl + Shift + I`
- **Mac:** Press `Cmd + Option + I`
- Or right-click anywhere on the page → "Inspect" or "Inspect Element"

### Step 3: Go to Cookies

1. Click the **Application** tab (Chrome) or **Storage** tab (Firefox)
2. In the left sidebar, find and expand **Cookies**
3. Click on your EZTest domain:
   - If using localhost: Click `http://localhost:3000` (or your port)
   - If using server: Click your domain (e.g., `eztest.example.com`)

### Step 4: Find the Right Cookie

You'll see a table with multiple cookies. Look for this one:

| Name | Value | Use This? |
|------|-------|-----------|
| `next-auth.session-token` | `eyJhbGciOiJka...` (long string) | ✅ **YES - This is your JWT token!** |
| `next-auth.csrf-token` | `97a6ec3335abf...` | ❌ No - CSRF protection token |
| `next-auth.callback-url` | `http%3A%2F%...` | ❌ No - Just a callback URL |
| `_ga` | `GA1.1.1246732...` | ❌ No - Google Analytics |
| `_ga_*` | `GS2.1.s176829...` | ❌ No - Google Analytics |

### Step 5: Copy the JWT Token

1. Find the row with **Name:** `next-auth.session-token`
2. Look at the **Value** column
3. **Click on the Value** to select it
4. **Copy the entire value** (it's a long string, usually 200+ characters)
5. It will look like: `eyJhbGciOiJkaXIiLCJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 6: Use It as Your API Key

Set it as your `EZTEST_API_KEY` environment variable:

**Windows (PowerShell):**
```powershell
$env:EZTEST_API_KEY = "eyJhbGciOiJkaXIiLCJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Linux/Mac:**
```bash
export EZTEST_API_KEY="eyJhbGciOiJkaXIiLCJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Visual Guide

When you look at the cookies table, you should see:

```
Name                          | Value                    | Use?
------------------------------|--------------------------|-------
next-auth.session-token       | eyJhbGciOiJka...         | ✅ YES
next-auth.csrf-token         | 97a6ec3335abf...         | ❌ No
next-auth.callback-url       | http%3A%2F%...           | ❌ No
_ga                          | GA1.1.1246732...         | ❌ No
```

**Copy the Value from `next-auth.session-token` row!**

## Important Notes

1. **Token Expires:** JWT tokens expire after 30 days. You'll need to get a new one after expiration.

2. **HttpOnly Cookie:** The `next-auth.session-token` is marked as HttpOnly, which means:
   - You can see it in Developer Tools
   - But JavaScript can't access it (for security)
   - This is fine - you're copying it manually

3. **Full Value:** Make sure to copy the **entire value** - it's a long string. Don't truncate it.

4. **No Spaces:** When setting as environment variable, don't add extra spaces around the token.

## Troubleshooting

### Can't Find `next-auth.session-token`?

- Make sure you're **logged in** to EZTest
- Try refreshing the page and checking again
- Check if you're looking at the correct domain in cookies
- Clear browser cache and log in again

### Token Not Working?

- Token might be expired (login again to get new token)
- Check you copied the **entire value** (no truncation)
- Verify no extra spaces were added
- Make sure you're using `next-auth.session-token`, not `next-auth.csrf-token`

## Quick Checklist

- [ ] Logged in to EZTest
- [ ] Developer Tools open (F12)
- [ ] Application/Storage tab selected
- [ ] Cookies → Your domain selected
- [ ] Found `next-auth.session-token` row
- [ ] Copied the **entire Value** (long string starting with `eyJ...`)
- [ ] Set as `EZTEST_API_KEY` environment variable

That's it! You now have your JWT token to use with the SDK.

