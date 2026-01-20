# EZTest – Automatic TestNG Result Upload (Maven)

This guide explains how to automatically upload TestNG results to EZTest when running:

```bash
mvn test
```

## Features

- ✅ **Automatic Upload** - Upload happens automatically after tests complete
- ✅ **Works on Failure** - Upload works even if tests fail
- ✅ **No TestNG Listeners Required** - No manual configuration needed
- ✅ **No Manual Steps** - Fully automated integration

---

## What This Integration Does

When you run:

```bash
mvn test
```

Maven will:

1. Run TestNG tests
2. Generate `testng-results.xml`
3. Automatically upload results to EZTest
4. Create a Test Run in EZTest
5. Update test case results (PASS / FAIL / SKIPPED)

---

## Prerequisites

Before starting, make sure you have:

- ✅ **Java 8 or higher**
- ✅ **Maven 3.6+**
- ✅ **TestNG-based automation project**
- ✅ **An EZTest project** (created in EZTest UI)
- ✅ **EZTest API Token** (generate from EZTest settings)

---

## Setup Instructions

### Step 1: Add Required Java Files

You must add exactly **3 Java files** to your project.

#### 📁 Folder Location (IMPORTANT)

All files must be placed under:

```
src/test/java/com/example/utils/
```

> **Note:** You may change the package name (`com.example.utils`), but it must match everywhere in all three files.

---

#### ✅ File 1: `EnvConfig.java`

**Purpose:** Reads environment variables or `.env` file.

**Location:** `src/test/java/com/example/utils/EnvConfig.java`

```java
package com.example.utils;

import io.github.cdimascio.dotenv.Dotenv;

public final class EnvConfig {

    private static final Dotenv dotenv = Dotenv.configure()
            .ignoreIfMissing()
            .load();

    private EnvConfig() {}

    public static String get(String key) {
        String value = System.getenv(key);
        if (value != null && !value.isBlank()) {
            return value;
        }
        return dotenv.get(key);
    }

    public static String require(String key) {
        String value = get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                "Missing required environment variable: " + key
            );
        }
        return value;
    }
}
```

---

#### ✅ File 2: `EZTestCreateTestRunUploader.java`

**Purpose:** Sends TestNG XML results to EZTest API.

**Location:** `src/test/java/com/example/utils/EZTestCreateTestRunUploader.java`

```java
package com.example.utils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class EZTestCreateTestRunUploader {

    private final String baseUrl;
    private final String token;

    public EZTestCreateTestRunUploader(String baseUrl, String token) {
        this.baseUrl = baseUrl.endsWith("/")
                ? baseUrl.substring(0, baseUrl.length() - 1)
                : baseUrl;
        this.token = token;
    }

    public void upload(String projectId, String environment, String xmlPath)
            throws Exception {

        Path path = Path.of(xmlPath);

        if (!Files.exists(path)) {
            throw new FileNotFoundException(
                "TestNG results file not found: " + xmlPath
            );
        }

        byte[] xmlBytes = Files.readAllBytes(path);
        String filename = path.getFileName().toString();

        String urlStr = baseUrl
                + "/api/projects/"
                + URLEncoder.encode(projectId, StandardCharsets.UTF_8)
                + "/testruns/import-xml"
                + "?environment=" + URLEncoder.encode(environment, StandardCharsets.UTF_8)
                + "&filename=" + URLEncoder.encode(filename, StandardCharsets.UTF_8);

        HttpURLConnection conn =
                (HttpURLConnection) new URL(urlStr).openConnection();

        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/xml");

        if (token != null && !token.isBlank()) {
            conn.setRequestProperty("Authorization", "Bearer " + token);
        }

        conn.setDoOutput(true);
        // Send XML

        try (OutputStream os = conn.getOutputStream()) {
            os.write(xmlBytes);
        }

        int status = conn.getResponseCode();
        System.out.println("EZTest upload status: " + status);
        // SUCCESS
        if (status >= 200 && status < 300) {
            System.out.println("✅ EZTest results uploaded successfully");
            return;
        }
        // FAILURE — read error body

        String errorBody = "";
        try (InputStream err = conn.getErrorStream()) {
            if (err != null) {
                errorBody = new String(err.readAllBytes(), StandardCharsets.UTF_8);
            }
        }

        System.err.println("❌ EZTest upload failed");
        if (!errorBody.isBlank()) {
            System.err.println(errorBody);
        }

        throw new RuntimeException(
            "EZTest upload failed with HTTP status " + status
        );
    }
}
```

---

#### ✅ File 3: `EZTestUploadMain.java`

**Purpose:** Entry point Maven runs after tests finish.

**Location:** `src/test/java/com/example/utils/EZTestUploadMain.java`

```java
package com.example.utils;

public class EZTestUploadMain {

    public static void main(String[] args) {
        try {
            EZTestCreateTestRunUploader uploader =
                new EZTestCreateTestRunUploader(
                    EnvConfig.require("EZTEST_BASE_URL"),
                    EnvConfig.require("EZTEST_API_TOKEN")
                );

            uploader.upload(
                EnvConfig.require("EZTEST_PROJECT_ID"),
                EnvConfig.require("EZTEST_ENVIRONMENT"),
                "target/surefire-reports/testng-results.xml"
            );

        } catch (Exception e) {
            System.err.println("❌ Failed to upload results to EZTest");
            e.printStackTrace();
            System.exit(1);
        }
    }
}
```

---

### Step 2: Add Required Dependencies

Add the following dependency to your `pom.xml`:

```xml
<dependencies>
    <!-- Other dependencies -->
    
    <!-- Dotenv for .env file support -->
    <dependency>
        <groupId>io.github.cdimascio</groupId>
        <artifactId>dotenv-java</artifactId>
        <version>3.0.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

### Step 3: Configure Environment Variables

Create a file named `.env` in your project root (or set OS/CI environment variables).

**`.env` file:**

```env
EZTEST_BASE_URL=https://your-eztest-domain.com
EZTEST_API_TOKEN=your_api_token_here
EZTEST_PROJECT_ID=your_project_id
EZTEST_ENVIRONMENT=STAGING
```

#### ⚠️ Important Rules

- ❌ **Do NOT add `/api` to the base URL** - The uploader adds it automatically
- ❌ **Do NOT use quotes** around values
- ❌ **No trailing spaces** in values
- ✅ **Use HTTPS** for production environments

**Example:**

```env
# ✅ Correct
EZTEST_BASE_URL=https://eztest.example.com

# ❌ Incorrect
EZTEST_BASE_URL=https://eztest.example.com/api
EZTEST_BASE_URL="https://eztest.example.com"
```

---

### Step 4: Update `pom.xml`

Add or update the following plugins in your `pom.xml`.

#### ✅ Maven Surefire Plugin

**Purpose:** Runs TestNG and generates XML reports.

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-surefire-plugin</artifactId>
  <version>3.2.5</version>
  <configuration>
    <suiteXmlFiles>
      <suiteXmlFile>testng.xml</suiteXmlFile>
    </suiteXmlFiles>

    <!-- Allow upload even if tests fail -->
    <testFailureIgnore>true</testFailureIgnore>
  </configuration>
</plugin>
```

#### ✅ Exec Maven Plugin

**Purpose:** Automatically uploads results after tests complete.

```xml
<plugin>
  <groupId>org.codehaus.mojo</groupId>
  <artifactId>exec-maven-plugin</artifactId>
  <version>3.1.0</version>
  <executions>
    <execution>
      <id>upload-eztest-results</id>
      <phase>test</phase>
      <goals>
        <goal>java</goal>
      </goals>
      <configuration>
        <classpathScope>test</classpathScope>
        <mainClass>com.example.utils.EZTestUploadMain</mainClass>
      </configuration>
    </execution>
  </executions>
</plugin>
```

> **Note:** If you changed the package name, update `<mainClass>` accordingly (e.g., `com.yourcompany.utils.EZTestUploadMain`).

---

### Step 5: Test Case Naming Rule (VERY IMPORTANT)

EZTest matches test cases using method names.

#### ✅ Correct Format

```java
@Test
public void TC_1() { 
    // Your test code
}

@Test
public void TC_2() { 
    // Your test code
}
```

#### ❌ Incorrect Format

```java
// ❌ This will NOT work
@Test(testName = "TC-1")
public void loginTest() { 
    // Your test code
}
```

**Key Points:**

- 👉 Use `TC_1` format in code (with underscore)
- 👉 EZTest maps it to `TC-1` (with hyphen) automatically
- 👉 Method name must match test case `tcId` in EZTest
- 👉 Case-sensitive matching

**Example Mapping:**

| TestNG Method Name | EZTest Test Case ID |
|-------------------|---------------------|
| `TC_1()` | `TC-1` |
| `TC_LOGIN_001()` | `TC-LOGIN-001` |
| `TC_USER_REGISTRATION()` | `TC-USER-REGISTRATION` |

---

## How to Run Tests

Simply run:

```bash
mvn test
```

### What Happens Automatically

1. ✅ Tests execute
2. ✅ TestNG generates `testng-results.xml`
3. ✅ Results are uploaded to EZTest
4. ✅ Test Run is created in EZTest
5. ✅ Test case results are updated
6. ✅ Build completes

---

## Common Errors & Fixes

### ❌ 401 Unauthorized

**Reason:**
- Invalid API token
- Wrong project ID
- User has no access to project

**Fix:**
1. Regenerate API token in EZTest
2. Check project permissions
3. Verify `.env` values are correct
4. Ensure token has `testruns:create` permission

---

### ❌ XML File Not Found

**Error:**
```
TestNG results file not found: target/surefire-reports/testng-results.xml
```

**Reason:**
- Tests didn't run
- Wrong XML path
- TestNG not configured properly

**Fix:**
1. Ensure `mvn test` ran successfully
2. Check `target/surefire-reports/testng-results.xml` exists
3. Verify TestNG is configured in `pom.xml`
4. Check `testng.xml` file exists and is valid

---

### ❌ No Matching Items Found

**Error:**
```
No matching items found. The file contains X item(s), but none match existing records.
```

**Reason:**
- Test method names don't match test case IDs in EZTest
- Test cases don't exist in the project

**Fix:**
1. Check test case IDs in EZTest match TestNG method names
2. Verify you're uploading to the correct project
3. Ensure test cases exist before importing
4. Review the [Test Case Naming Rule](#step-5-test-case-naming-rule-very-important) section

---

### ❌ Connection Refused / Network Error

**Reason:**
- EZTest server is not accessible
- Wrong base URL
- Firewall blocking connection

**Fix:**
1. Verify `EZTEST_BASE_URL` is correct
2. Test connectivity: `curl https://your-eztest-domain.com/api/health`
3. Check firewall rules
4. Ensure server is running

---

### ❌ Missing Environment Variable

**Error:**
```
Missing required environment variable: EZTEST_BASE_URL
```

**Fix:**
1. Create `.env` file in project root
2. Add all required variables
3. Or set environment variables in your OS/CI system
4. Verify `.env` file is in `.gitignore` (don't commit secrets!)

---

## Files You Do NOT Need

- ❌ TestNG listeners
- ❌ `@Listeners` annotation
- ❌ Custom XML parsers
- ❌ Manual upload scripts

The integration handles everything automatically!

---

## API Endpoint Details

The integration uses the following EZTest API endpoint:

**Endpoint:** `POST /api/projects/:id/testruns/import-xml`

**Request:**
- **Method:** POST
- **Content-Type:** `application/xml`
- **Headers:**
  - `Authorization: Bearer {token}`
- **Query Parameters:**
  - `environment` (required): Execution environment name
  - `filename` (optional): XML filename for test run naming

**Response:**
- **200 OK:** Upload successful
- **400 Bad Request:** No matching test cases found or invalid XML
- **401 Unauthorized:** Invalid or missing API token
- **403 Forbidden:** Insufficient permissions
- **500 Internal Server Error:** Server error

For more details, see the [Test Runs API Documentation](../api/test-runs.md).

---

## TestNG XML Format Requirements

EZTest expects TestNG XML format with the following structure:

### Required Attributes

Each `<test-method>` element **must** have:

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `name` | ✅ Yes | Test case ID (must match test case `tcId` in EZTest) | `"TC001"` |
| `status` | ✅ Yes | Test result: `PASS`, `FAIL`, or `SKIP` | `"PASS"` |

### Optional Attributes

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `is-config` | No | Whether this is a configuration method. Default: `"false"` | `"false"` |
| `started-at` | No | Test start timestamp | `"2026-01-13T21:38:37 IST"` |
| `finished-at` | No | Test end timestamp | `"2026-01-13T21:38:40 IST"` |
| `duration-ms` | No | Test duration in milliseconds | `"3000"` |

### Example XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testng-results>
  <suite name="LoginTestSuite">
    <test name="LoginTests">
      <class name="com.example.LoginTest">
        <test-method 
          name="TC_1" 
          status="PASS" 
          is-config="false"
          started-at="2026-01-13T21:38:37 IST"
          finished-at="2026-01-13T21:38:40 IST"
          duration-ms="3000" 
        />
        <test-method 
          name="TC_2" 
          status="FAIL" 
          is-config="false"
          duration-ms="4000" 
        />
      </class>
    </test>
  </suite>
</testng-results>
```

For complete XML format documentation, see [Test Runs - XML Upload](../features/test-runs/README.md#xml-upload).

---

## Status Mapping

TestNG status values are mapped to EZTest statuses:

| TestNG Status | EZTest Status | Description |
|---------------|---------------|-------------|
| `PASS` | `PASSED` | Test executed successfully |
| `FAIL` | `FAILED` | Test failed |
| `SKIP` | `SKIPPED` | Test was skipped |
| Any other value | `FAILED` | Unknown status defaults to failed |

---

## Final Checklist

Before running tests, verify:

- ✅ Added 3 Java files (`EnvConfig.java`, `EZTestCreateTestRunUploader.java`, `EZTestUploadMain.java`)
- ✅ Updated `pom.xml` with required plugins
- ✅ Added `dotenv-java` dependency
- ✅ Created `.env` file with all required variables
- ✅ Verified test case IDs in EZTest match TestNG method names
- ✅ Used `TC_1` naming format (with underscore)
- ✅ TestNG is configured properly
- ✅ `.env` file is in `.gitignore`

---

## Troubleshooting

### Check XML File Location

Verify the XML file is generated at the expected location:

```bash
# After running mvn test, check:
ls -la target/surefire-reports/testng-results.xml
```

### Verify Environment Variables

Test that environment variables are loaded:

```bash
# Add this to EZTestUploadMain.java temporarily
System.out.println("Base URL: " + EnvConfig.get("EZTEST_BASE_URL"));
System.out.println("Project ID: " + EnvConfig.get("EZTEST_PROJECT_ID"));
```

### Test API Connection

Manually test the API endpoint:

```bash
curl -X POST \
  "https://your-eztest-domain.com/api/projects/YOUR_PROJECT_ID/testruns/import-xml?environment=STAGING&filename=test.xml" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/xml" \
  --data-binary "@target/surefire-reports/testng-results.xml"
```

---

## Related Documentation

- [Test Runs Feature Guide](../features/test-runs/README.md)
- [Test Runs API Reference](../api/test-runs.md)
- [Test Cases Feature Guide](../features/test-cases/README.md)

---

## Support

If you encounter issues:

1. Check the [Common Errors & Fixes](#common-errors--fixes) section
2. Review the [Troubleshooting](#troubleshooting) section
3. Verify your setup matches the [Final Checklist](#final-checklist)
4. Check EZTest server logs for detailed error messages

---

**Last Updated:** 2026-01-13

