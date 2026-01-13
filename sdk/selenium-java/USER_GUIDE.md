# User Guide: Connecting Your Tests to EZTest

This guide will walk you through connecting your Selenium tests to EZTest step by step.

## Prerequisites

- Java 11 or higher installed
- Maven 3.6+ installed (or use IDE with Maven support)
- Selenium WebDriver setup in your project
- TestNG framework in your project
- Access to EZTest application (login credentials)

---

## Step 1: Get Your EZTest JWT Token

You need a JWT token from EZTest to authenticate with the SDK.

### Method 1: Extract from Browser (Recommended)

1. **Open EZTest in your browser**
   - Go to: `https://your-eztest-server.com` (or your EZTest URL)
   - Log in with your email and password

2. **Open Developer Tools**
   - Press `F12` (or `Ctrl+Shift+I` on Windows, `Cmd+Option+I` on Mac)
   - Or right-click → "Inspect"

3. **Find Your JWT Token**
   - Click the **Application** tab (Chrome) or **Storage** tab (Firefox)
   - In the left sidebar, expand **Cookies**
   - Click on your EZTest domain (e.g., `your-eztest-server.com` or `localhost`)
   - You'll see multiple cookies. Look for the one named: **`next-auth.session-token`**
   - **IMPORTANT:** This is the one you need! (Not `next-auth.csrf-token` or `next-auth.callback-url`)
   - **Copy the entire Value** from the `next-auth.session-token` row
   - It's a long string starting with `eyJ...` (this is your JWT token)

4. **Save Your Token**
   - This is your JWT token (from `next-auth.session-token` cookie)
   - Save it securely - you'll need it for the SDK
   - Example: `eyJhbGciOiJka...` (long string, usually 200+ characters)
   
**Which Cookie to Use:**
- ✅ **USE:** `next-auth.session-token` - This is your JWT token
- ❌ **DON'T USE:** `next-auth.csrf-token` - This is for CSRF protection
- ❌ **DON'T USE:** `next-auth.callback-url` - This is just a callback URL
- ❌ **DON'T USE:** `_ga` or `_ga_*` - These are Google Analytics cookies

**Note:** This token expires after 30 days. You'll need to get a new one after expiration.

### Method 2: Get Project ID

> 📋 **For detailed guide with visual examples, see [GET_PROJECT_ID.md](GET_PROJECT_ID.md)**

**Important:** Project ID is the **database ID** (a CUID string like `clxyz123abc...`), NOT the project name or project key. This is the ID you see in the URL when viewing a project.

1. **Log in to EZTest**
2. **Go to Projects** page (`/projects`)
3. **Click on your project** to open it
4. **Copy the Project ID** from one of these places:

   **Option A: From the URL (Easiest)**
   - Look at the browser URL bar
   - Example: If URL is `http://localhost:3000/projects/clxyz123abc456def789`
   - Your Project ID is: `clxyz123abc456def789` (the part after `/projects/`)
   - This is a long string starting with `cl` (CUID format)

   **Option B: From Project Settings**
   - Go to: Project Settings (gear icon) → General tab
   - Look for "Project ID" field
   - Copy the long string shown there (starts with `cl...`)

**What Project ID Looks Like:**
- ✅ **Correct:** `clxyz123abc456def789ghi012jkl345` (long CUID string, usually starts with `cl`)
- ✅ **Correct:** `clabc123def456ghi789` (shorter CUID, also valid)
- ❌ **Wrong:** `My Project Name` (this is the project name, not the ID)
- ❌ **Wrong:** `PROJ` or `MTP` (this is the project key, not the ID)
- ❌ **Wrong:** `proj_1` (this is not the correct format)

---

## Step 2: Add SDK to Your Project

### Option A: Using Maven (Recommended)

1. **Add dependency to your `pom.xml`:**

```xml
<dependency>
    <groupId>com.eztest</groupId>
    <artifactId>eztest-selenium-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

2. **If SDK is not in Maven Central, install locally:**

```bash
# Download or build the SDK JAR
cd path/to/sdk/selenium-java
mvn clean install

# This installs it to your local Maven repository
```

### Option B: Manual JAR Installation

1. **Build the SDK:**
```bash
cd path/to/sdk/selenium-java
mvn clean package
```

2. **Copy the JAR to your project:**
   - Copy `target/eztest-selenium-java-sdk-1.0.0.jar` to your project's `lib/` folder

3. **Add to classpath** (if not using Maven)

---

## Step 3: Configure Environment Variables

Set these environment variables before running your tests.

### Windows (PowerShell)

```powershell
# Open PowerShell and run:
$env:EZTEST_SERVER_URL = "https://your-eztest-server.com"
$env:EZTEST_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Your JWT token from Step 1
$env:EZTEST_PROJECT_ID = "clxyz123abc456def789"  # Your project ID (CUID from URL) from Step 2
```

### Windows (Command Prompt)

```cmd
set EZTEST_SERVER_URL=https://your-eztest-server.com
set EZTEST_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
set EZTEST_PROJECT_ID=clxyz123abc456def789
```

### Linux/Mac (Bash)

```bash
export EZTEST_SERVER_URL=https://your-eztest-server.com
export EZTEST_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
export EZTEST_PROJECT_ID=clxyz123abc456def789
```

### Verify Variables Are Set

**Windows (PowerShell):**
```powershell
echo $env:EZTEST_SERVER_URL
echo $env:EZTEST_API_KEY
echo $env:EZTEST_PROJECT_ID
```

**Linux/Mac:**
```bash
echo $EZTEST_SERVER_URL
echo $EZTEST_API_KEY
echo $EZTEST_PROJECT_ID
```

---

## Step 4: Update Your Test Code

### Basic Setup

1. **Add imports to your test class:**

```java
import com.eztest.sdk.annotations.EZTestCase;
import com.eztest.sdk.listeners.EZTestTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;
```

2. **Add listener annotation to your test class:**

```java
@Listeners(EZTestTestNGListener.class)  // ← Add this line
public class MyTests {
    // Your tests here
}
```

3. **Add annotation to your test methods:**

```java
@EZTestCase(
    title = "Your Test Name",
    description = "What this test does"
)
@Test
public void yourTestMethod() {
    // Your test code
}
```

### Complete Example

```java
package com.example.tests;

import com.eztest.sdk.annotations.EZTestCase;
import com.eztest.sdk.listeners.EZTestTestNGListener;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

@Listeners(EZTestTestNGListener.class)
public class LoginTests {
    
    @EZTestCase(
        title = "Verify user can login with valid credentials",
        description = "Tests successful login with correct email and password",
        priority = "HIGH"
    )
    @Test
    public void testValidLogin() {
        WebDriver driver = new ChromeDriver();
        try {
            driver.get("https://example.com/login");
            // Your Selenium test steps here
            // ...
        } finally {
            driver.quit();
        }
        // Test result will automatically sync to EZTest! ✅
    }
    
    @EZTestCase(
        title = "Verify login fails with invalid password",
        priority = "MEDIUM"
    )
    @Test
    public void testInvalidPassword() {
        WebDriver driver = new ChromeDriver();
        try {
            driver.get("https://example.com/login");
            // Your test steps
        } finally {
            driver.quit();
        }
    }
}
```

---

## Step 5: Run Your Tests

### Using Maven

```bash
mvn test
```

### Using IDE (IntelliJ IDEA / Eclipse)

1. Right-click on your test class
2. Select "Run" or "Debug"
3. Tests will execute and sync to EZTest automatically

### Using TestNG XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="MyTestSuite">
    <listeners>
        <listener class-name="com.eztest.sdk.listeners.EZTestTestNGListener"/>
    </listeners>
    <test name="MyTests">
        <classes>
            <class name="com.example.tests.LoginTests"/>
        </classes>
    </test>
</suite>
```

---

## Step 6: Verify Results in EZTest

1. **Log in to EZTest**
2. **Go to your project** (the one you set in `EZTEST_PROJECT_ID`)
3. **Go to Test Runs** section
4. **Look for a new test run** with name like:
   - "Automated Test Run - MyTestSuite - 2026-01-13 12:30:45"
5. **Click on the test run** to see:
   - Test cases that were executed
   - Pass/Fail status
   - Duration
   - Error messages (if any failed)

---

## Troubleshooting

### Problem: "EZTest configuration not found"

**Solution:**
- Check environment variables are set correctly
- Restart your IDE/terminal after setting variables
- Verify variable names: `EZTEST_SERVER_URL`, `EZTEST_API_KEY`, `EZTEST_PROJECT_ID`

### Problem: "401 Unauthorized" errors

**Solution:**
- Your JWT token might be expired (login again to get new token)
- Check JWT token is correct (no extra spaces)
- Verify server URL is correct

### Problem: Tests not appearing in EZTest

**Solution:**
- Check `@Listeners(EZTestTestNGListener.class)` is on your test class
- Check `@EZTestCase` annotation is on your test methods
- Verify project ID is correct
- Check console logs for errors

### Problem: "Project not found" errors

**Solution:**
- Verify project ID exists in EZTest (check the URL when viewing the project)
- Check you have access to the project
- Verify project ID format (should be a CUID starting with `cl`, like `clxyz123abc...`)
- Make sure you're using the database ID from the URL, NOT the project name or key

---

## Quick Reference

### Required Environment Variables

| Variable | What It Is | Example |
|----------|------------|---------|
| `EZTEST_SERVER_URL` | Your EZTest server URL | `https://eztest.example.com` |
| `EZTEST_API_KEY` | JWT token from login | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `EZTEST_PROJECT_ID` | Project ID (CUID from URL) | `clxyz123abc456def789` |

### Required Annotations

```java
@Listeners(EZTestTestNGListener.class)  // On test class
@EZTestCase(title = "...")              // On test methods
@Test                                    // TestNG annotation
```

---

## Next Steps

Once connected:
- ✅ Test results sync automatically
- ✅ Test cases are created/mapped automatically
- ✅ Execution history builds over time
- ✅ View results in EZTest dashboard

**Need Help?**
- Check logs for detailed error messages
- Verify all environment variables are set
- Ensure JWT token is not expired
- Contact your EZTest administrator for support

