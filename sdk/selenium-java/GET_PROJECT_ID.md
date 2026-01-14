# How to Get Your Project ID

This guide explains how to find your Project ID in EZTest. The Project ID is required for the SDK to know which project to sync your test results to.

---

## What is Project ID?

**Project ID** is the **unique database identifier** for your project in EZTest. It's a CUID (Collision-resistant Unique Identifier) that looks like: `clxyz123abc456def789...`

### Important Distinctions

| Field | Example | What It Is |
|-------|---------|------------|
| **Project ID** (what you need) | `clxyz123abc456def789` | Database ID (CUID) - appears in URLs |
| **Project Name** | `My Test Project` | Human-readable name |
| **Project Key** | `MTP` or `PROJ` | Short unique identifier (2-10 chars) |

**You need the Project ID (the CUID), NOT the name or key!**

---

## Method 1: From the URL (Easiest)

This is the quickest way to get your Project ID.

### Steps:

1. **Log in to EZTest**
   - Go to your EZTest URL (e.g., `https://your-eztest-server.com`)
   - Log in with your credentials

2. **Navigate to Projects**
   - Click on "Projects" in the sidebar or navigation
   - Or go directly to `/projects`

3. **Open Your Project**
   - Click on the project you want to use
   - This will open the project detail page

4. **Copy the Project ID from URL**
   - Look at your browser's address bar
   - The URL will look like: `http://localhost:3000/projects/clxyz123abc456def789`
   - The Project ID is the part **after** `/projects/`
   - In this example: `clxyz123abc456def789`

### Visual Example:

```
Browser URL Bar:
┌─────────────────────────────────────────────────────────────┐
│ http://localhost:3000/projects/clxyz123abc456def789        │
│                              ↑                               │
│                    This is your Project ID                   │
└─────────────────────────────────────────────────────────────┘
```

**Copy everything after `/projects/`** - that's your Project ID!

---

## Method 2: From Project Settings

If you prefer, you can also find the Project ID in the project settings.

### Steps:

1. **Log in to EZTest** and navigate to your project

2. **Open Project Settings**
   - Click the **Settings** icon (gear ⚙️) in the project header
   - Or go to: Project Settings → General tab

3. **Find Project ID Field**
   - Look for a field labeled "Project ID" or "ID"
   - It will show a long string starting with `cl...`
   - Example: `clxyz123abc456def789ghi012jkl345`

4. **Copy the Project ID**
   - Select and copy the entire ID string
   - This is your Project ID

### Visual Example:

```
Project Settings Page:
┌─────────────────────────────────────────┐
│ Project Settings                        │
├─────────────────────────────────────────┤
│ Project Name: My Test Project           │
│ Project Key: MTP                        │
│ Project ID: clxyz123abc456def789        │ ← Copy this!
│ Description: ...                        │
└─────────────────────────────────────────┘
```

---

## How to Verify You Have the Correct ID

### ✅ Correct Project ID Format:

- Starts with `cl` (CUID format)
- Long string (usually 20-30+ characters)
- Example: `clxyz123abc456def789ghi012jkl345`
- Example: `clabc123def456ghi789`
- Appears in the URL: `/projects/clxyz123abc456def789`

### ❌ Incorrect (These Won't Work):

| What You Might See | Why It's Wrong |
|-------------------|----------------|
| `My Test Project` | This is the project **name**, not the ID |
| `MTP` or `PROJ` | This is the project **key**, not the ID |
| `proj_1` | This is not the correct format |
| `1` or `123` | This is not the database ID |

---

## Setting Project ID as Environment Variable

Once you have your Project ID, set it as an environment variable:

### Windows (PowerShell):
```powershell
$env:EZTEST_PROJECT_ID = "clxyz123abc456def789"
```

### Windows (Command Prompt):
```cmd
set EZTEST_PROJECT_ID=clxyz123abc456def789
```

### Linux/Mac:
```bash
export EZTEST_PROJECT_ID=clxyz123abc456def789
```

### Verify It's Set:

**Windows (PowerShell):**
```powershell
echo $env:EZTEST_PROJECT_ID
```

**Linux/Mac:**
```bash
echo $EZTEST_PROJECT_ID
```

You should see your Project ID printed (e.g., `clxyz123abc456def789`).

---

## Troubleshooting

### Problem: "I can't find the Project ID in the URL"

**Solution:**
- Make sure you're viewing a specific project (not the projects list page)
- The URL should contain `/projects/` followed by a long string
- If you see `/projects` without an ID, click on a project first

### Problem: "The Project ID doesn't start with 'cl'"

**Solution:**
- Double-check you're copying from the correct location
- Make sure you're not copying the project name or key
- Try Method 2 (Project Settings) to verify

### Problem: "I get 'Project not found' error"

**Solution:**
- Verify the Project ID is correct (copy it again from the URL)
- Make sure you have access to the project
- Check that the project hasn't been deleted
- Ensure there are no extra spaces in the environment variable

### Problem: "Multiple projects - which ID do I use?"

**Solution:**
- Each project has its own unique Project ID
- Use the Project ID of the project where you want test results to appear
- You can use different Project IDs for different test classes (see [USAGE_GUIDE.md](USAGE_GUIDE.md) for multiple projects support)

---

## Quick Checklist

- [ ] Logged in to EZTest
- [ ] Navigated to a specific project (not just the projects list)
- [ ] Found the Project ID in the URL (after `/projects/`)
- [ ] Verified it starts with `cl` and is a long string
- [ ] Copied the entire ID (no extra spaces)
- [ ] Set it as `EZTEST_PROJECT_ID` environment variable
- [ ] Verified the variable is set correctly

---

## Next Steps

Once you have your Project ID:

1. ✅ Set it as `EZTEST_PROJECT_ID` environment variable
2. ✅ Continue with the [USAGE_GUIDE.md](USAGE_GUIDE.md) to complete setup
3. ✅ Run your tests and verify results appear in the correct project

---

**Need More Help?**

- See [USAGE_GUIDE.md](USAGE_GUIDE.md) for complete setup instructions
- Check [API_KEY_SETUP.md](API_KEY_SETUP.md) for authentication setup
