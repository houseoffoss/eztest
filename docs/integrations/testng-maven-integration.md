# TestNG XML Results Integration for EZTest

This utility automates the process of uploading TestNG XML results to the EZTest API. By integrating it into the Maven lifecycle, test results are automatically synchronized with your dashboard every time you run your CI/CD pipeline or local tests.

## Features

- ✅ **Automatic Upload** - Upload happens automatically after tests complete
- ✅ **Works on Failure** - Upload works even if tests fail
- ✅ **No TestNG Listeners Required** - No manual configuration needed
- ✅ **No Manual Steps** - Fully automated integration
- ✅ **Secure Configuration** - Environment-based authentication via `.env`
- ✅ **Binary Upload** - Efficient binary file streaming to API

---

## What This Integration Does

When you run:

```bash
mvn clean verify
```

Maven will:

1. Run TestNG tests
2. Generate TestNG XML result files (e.g., `testng-results.xml`)
3. **Automatically upload results to EZTest** (verify phase triggers upload)
4. Create a Test Run in EZTest
5. Update test case results (PASS / FAIL / SKIPPED)

---

## Prerequisites

Before starting, make sure you have:

- ✅ **Java 8 or higher**
- ✅ **Maven 3.6+**
- ✅ **TestNG-based automation project** (Maven-based)
- ✅ **An EZTest project** (created in EZTest UI)
- ✅ **EZTest API Token** (generate from EZTest settings → API Keys)
- ✅ **Project ID** from your EZTest project
- ✅ **Environment name** (e.g., QA_Staging, Production, Development)

---

## Setup Instructions

### Step 1: Add Required Java Files

You must add exactly **2 Java files** to your project.

#### 📁 Folder Location (IMPORTANT)

All files must be placed under:

```
src/test/java/utils/
```

> **Note:** You may change the package name (e.g., `com.example.utils`, `qa.automation.utils`), but it must match in both Java files and in the `pom.xml` configuration.

---

#### ✅ File 1: `EZTestCreateTestRunUploader.java`

**Purpose:** Handles API connection, authentication via `.env`, and binary upload of the XML file.

**Location:** `src/test/java/utils/EZTestCreateTestRunUploader.java`

```java
package utils;

import io.github.cdimascio.dotenv.Dotenv;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Utility class to upload TestNG XML result files to the EZTest reporting API.
 * This class handles environment configuration, URL construction, and 
 * authenticated multipart-style binary uploads.
 */
public class EZTestCreateTestRunUploader {
    private final String baseUrl;
    private final String token;
    private final String projectId;
    private final String environment;

    /**
     * Initializes the uploader by loading required credentials and 
     * configurations from the project's .env file.
     * 
     * @throws IllegalStateException if any required environment variable is missing.
     */
    public EZTestCreateTestRunUploader() {
        // Load .env file from the project root
        Dotenv dotenv = Dotenv.load();
        this.baseUrl = normalizeBaseUrl(
                getRequiredEnv(dotenv, "EZTEST_BASE_URL")
        );
        this.token = getRequiredEnv(dotenv, "EZTEST_API_TOKEN");
        this.projectId = getRequiredEnv(dotenv, "EZTEST_PROJECT_ID");
        this.environment = getRequiredEnv(dotenv, "EZTEST_ENVIRONMENT");
    }

    /**
     * Reads a TestNG XML file from the local disk and uploads it to the EZTest API.
     * 
     * @param xmlPath The relative or absolute path to the XML results file 
     *                (e.g., "target/surefire-reports/testng-results.xml").
     * @throws FileNotFoundException If the file at xmlPath does not exist.
     * @throws Exception For networking errors or non-2xx API responses.
     */
    public void upload(String xmlPath) throws Exception {
        Path path = Path.of(xmlPath);
        
        // Validate file existence before starting connection
        if (!Files.exists(path)) {
            throw new FileNotFoundException(
                    "TestNG results file not found at: " + xmlPath
            );
        }

        byte[] xmlBytes = Files.readAllBytes(path);
        String filename = path.getFileName().toString();

        // Construct the API endpoint with encoded query parameters
        String urlStr = baseUrl
                + "/api/projects/"
                + URLEncoder.encode(projectId, StandardCharsets.UTF_8)
                + "/testruns/import-xml"
                + "?environment=" + URLEncoder.encode(environment, StandardCharsets.UTF_8)
                + "&filename=" + URLEncoder.encode(filename, StandardCharsets.UTF_8);

        HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();

        // Configure Request Headers
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/xml");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setDoOutput(true);

        // Stream the XML file content to the request body
        try (OutputStream os = conn.getOutputStream()) {
            os.write(xmlBytes);
        }

        int status = conn.getResponseCode();
        System.out.println("EZTest upload status: " + status);

        // Handle Success
        if (status >= 200 && status < 300) {
            System.out.println("✅ EZTest results uploaded successfully");
            return;
        }

        // Handle Failure: Attempt to read the error message from the server
        String errorBody = "";
        try (InputStream err = conn.getErrorStream()) {
            if (err != null) {
                errorBody = new String(err.readAllBytes(), StandardCharsets.UTF_8);
            }
        }

        System.err.println("❌ EZTest upload failed");
        if (!errorBody.isBlank()) {
            System.err.println("Response body from server: " + errorBody);
        }

        throw new RuntimeException(
                "EZTest upload failed with HTTP status " + status
        );
    }

    // ----------------- Private Helpers -----------------

    /**
     * Validates and retrieves a variable from the .env file.
     */
    private static String getRequiredEnv(Dotenv dotenv, String key) {
        String value = dotenv.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    "Configuration Error: Missing required environment variable '" + key 
                    + "' in .env file."
            );
        }
        return value;
    }

    /**
     * Removes trailing slashes from the base URL to prevent double-slash errors 
     * in path construction.
     */
    private static String normalizeBaseUrl(String url) {
        return url.endsWith("/")
                ? url.substring(0, url.length() - 1)
                : url;
    }
}
```

---

#### ✅ File 2: `EZTestCreateTestRunUploaderMain.java`

**Purpose:** Main class used by Maven exec-plugin to trigger the upload process.

**Location:** `src/test/java/utils/EZTestCreateTestRunUploaderMain.java`

```java
package utils;

/**
 * Main class used by Maven exec-plugin to trigger the upload process.
 */
public class EZTestCreateTestRunUploaderMain {
    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("Usage: java EZTestCreateTestRunUploaderMain <path_to_xml>");
            System.exit(1);
        }

        try {
            new EZTestCreateTestRunUploader().upload(args[0]);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1); // Ensure Maven build fails if upload fails
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
EZTEST_BASE_URL=https://api.eztest.io
EZTEST_API_TOKEN=your_secret_api_token
EZTEST_PROJECT_ID=your_project_unique_id
EZTEST_ENVIRONMENT=QA_Staging
```

#### ⚠️ Important Rules

- ❌ **Do NOT add `/api` to the base URL** - The uploader adds it automatically
- ❌ **Do NOT use quotes** around values
- ❌ **No trailing spaces** in values
- ✅ **Use HTTPS** for production environments
- ✅ **Keep `.env` in `.gitignore`** - Do not commit secrets to version control

**Example:**

```env
# ✅ Correct
EZTEST_BASE_URL=https://eztest.example.com
EZTEST_API_TOKEN=abc123token456
EZTEST_PROJECT_ID=proj_12345

# ❌ Incorrect
EZTEST_BASE_URL=https://eztest.example.com/api
EZTEST_BASE_URL="https://eztest.example.com"
EZTEST_API_TOKEN = "abc123token456"
```

---

### Step 4: Update `pom.xml`

Add or update the following plugins in your `pom.xml`.

#### ✅ Maven Surefire Plugin

**Purpose:** Runs TestNG and generates XML reports.

```xml
<build>
  <plugins>
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
  </plugins>
</build>
```

#### ✅ Exec Maven Plugin

**Purpose:** Automatically uploads results after tests complete via the verify phase.

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.codehaus.mojo</groupId>
      <artifactId>exec-maven-plugin</artifactId>
      <version>3.1.0</version>
      <executions>
        <execution>
          <id>upload-eztest-results</id>
          <phase>verify</phase>
          <goals>
            <goal>java</goal>
          </goals>
          <configuration>
            <classpathScope>test</classpathScope>
            <mainClass>utils.EZTestCreateTestRunUploaderMain</mainClass>
            <arguments>
              <argument>target/failsafe-reports/testng-results.xml</argument>
            </arguments>
          </configuration>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

> **Note:** 
> - If you changed the package name, update `<mainClass>` accordingly (e.g., `com.example.utils.EZTestCreateTestRunUploaderMain`)
> - The `<phase>verify</phase>` ensures upload happens after all tests complete (even if some fail)
> - Update the XML path in `<argument>` if your TestNG reports are in a different location

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
|---|---|
| `TC_1()` | `TC-1` |
| `TC_LOGIN_001()` | `TC-LOGIN-001` |
| `TC_USER_REGISTRATION()` | `TC-USER-REGISTRATION` |

---

## How to Run Tests

### Using Maven Verify (RECOMMENDED)

```bash
mvn clean verify
```

This command will:

1. ✅ Clean previous builds
2. ✅ Run all tests
3. ✅ Generate TestNG XML reports
4. ✅ **Automatically upload results to EZTest** (verify phase)
5. ✅ Complete the build

### Using Maven Test (ALSO UPLOADS)

```bash
mvn test
```

This also triggers the upload after tests complete.

### What Happens Automatically

1. ✅ Tests execute using TestNG
2. ✅ TestNG generates XML reports (e.g., `testng-results.xml`)
3. ✅ Results are automatically uploaded to EZTest
4. ✅ Test Run is created in EZTest with execution details
5. ✅ Test case results are updated (PASS/FAIL/SKIPPED)
6. ✅ Build completes (upload happens even if tests fail)

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
|---|---|---|---|
| `name` | ✅ Yes | Test case ID (must match test case `tcId` in EZTest) | `"TC001"` |
| `status` | ✅ Yes | Test result: `PASS`, `FAIL`, or `SKIP` | `"PASS"` |

### Optional Attributes

| Attribute | Required | Description | Example |
|---|---|---|---|
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
|---|---|---|
| `PASS` | `PASSED` | Test executed successfully |
| `FAIL` | `FAILED` | Test failed |
| `SKIP` | `SKIPPED` | Test was skipped |
| Any other value | `FAILED` | Unknown status defaults to failed |

---

## Final Checklist

Before running tests, verify:

- ✅ Added 2 Java files (`EZTestCreateTestRunUploader.java`, `EZTestCreateTestRunUploaderMain.java`)
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

Test that environment variables are loaded by adding debug output:

```bash
# Verify .env file is in the project root
cat .env
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

**Last Updated:** 2026-01-23
