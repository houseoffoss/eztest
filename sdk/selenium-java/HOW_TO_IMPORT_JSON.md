# How to Import JSON Reports Using the SDK

This guide shows you step-by-step how to import your JSON test reports into EZTest using the SDK.

---

## Prerequisites

Before importing, make sure you have:

1. ✅ **SDK installed** in your project (Maven dependency or JAR)
2. ✅ **EZTest API key** - API key created in EZTest (see [API_KEY_SETUP.md](API_KEY_SETUP.md))
3. ✅ **Project ID** - Your EZTest project ID (from URL or settings)
4. ✅ **JSON report file** - In the supported format (see [JSON_FORMAT_SPECIFICATION.md](JSON_FORMAT_SPECIFICATION.md))

---

## Step 1: Set Up Configuration

You need to configure the SDK with your EZTest connection details. Choose one method:

### Method A: Environment Variables (Recommended)

**Windows (PowerShell):**
```powershell
$env:EZTEST_SERVER_URL = "https://your-eztest-server.com"
$env:EZTEST_API_KEY = "ez_abc123..."  # Your API key
$env:EZTEST_PROJECT_ID = "clxyz123abc456def789"  # Your project CUID
```

**Windows (Command Prompt):**
```cmd
set EZTEST_SERVER_URL=https://your-eztest-server.com
set EZTEST_API_KEY=ez_abc123...
set EZTEST_PROJECT_ID=clxyz123abc456def789
```

**Linux/Mac:**
```bash
export EZTEST_SERVER_URL=https://your-eztest-server.com
export EZTEST_API_KEY=ez_abc123...
export EZTEST_PROJECT_ID=clxyz123abc456def789
```

### Method B: Programmatic Configuration

Configure directly in your code (see examples below).

---

## Step 2: Choose Your Import Method

The SDK provides three ways to import JSON reports:

### Option 1: Import from File (Most Common)

Use this when you have a JSON file saved on disk.

```java
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestReportImporter;

// Create client (uses environment variables)
EZTestClient client = new EZTestClient();
EZTestReportImporter importer = new EZTestReportImporter(client);

try {
    // Import from file
    String testRunId = importer.importFromFile("path/to/your/report.json");
    
    if (testRunId != null) {
        System.out.println("✅ Report imported successfully!");
        System.out.println("Test Run ID: " + testRunId);
    } else {
        System.err.println("❌ Failed to import report");
    }
} catch (Exception e) {
    System.err.println("Error: " + e.getMessage());
    e.printStackTrace();
} finally {
    client.close();
}
```

### Option 2: Import from JSON String

Use this when you have the JSON content as a string (e.g., from an API or generated in memory).

```java
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestReportImporter;

EZTestClient client = new EZTestClient();
EZTestReportImporter importer = new EZTestReportImporter(client);

try {
    // Your JSON as a string (automation report format)
    String jsonReport = """
        {
          "testRunName": "CI/CD Pipeline - Build #123",
          "environment": "Staging",
          "results": [
            {
              "testCaseId": "tc_abc123",
              "status": "PASSED",
              "duration": 120
            }
          ]
        }
        """;
    
    // Import from JSON string
    String testRunId = importer.importFromJson(jsonReport);
    
    if (testRunId != null) {
        System.out.println("✅ Report imported successfully!");
        System.out.println("Test Run ID: " + testRunId);
    }
} catch (Exception e) {
    System.err.println("Error: " + e.getMessage());
} finally {
    client.close();
}
```

### Option 3: Import from InputStream

Use this when you have an InputStream (e.g., from a network request or file stream).

```java
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestReportImporter;
import java.io.FileInputStream;
import java.io.InputStream;

EZTestClient client = new EZTestClient();
EZTestReportImporter importer = new EZTestReportImporter(client);

try {
    // Create InputStream (from file, network, etc.)
    InputStream inputStream = new FileInputStream("path/to/report.json");
    
    // Import from InputStream
    String testRunId = importer.importFromStream(inputStream);
    
    if (testRunId != null) {
        System.out.println("✅ Report imported successfully!");
        System.out.println("Test Run ID: " + testRunId);
    }
} catch (Exception e) {
    System.err.println("Error: " + e.getMessage());
} finally {
    client.close();
}
```

---

## Step 3: Complete Working Examples

### Example 1: Simple Import Using Environment Variables

```java
package com.example;

import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestReportImporter;

public class SimpleJsonImport {
    public static void main(String[] args) {
        // Create client (reads from environment variables)
        EZTestClient client = new EZTestClient();
        EZTestReportImporter importer = new EZTestReportImporter(client);
        
        try {
            // Import your JSON report
            String testRunId = importer.importFromFile("samples/automation-report-example.json");
            
            if (testRunId != null) {
                System.out.println("✅ Success! Test Run ID: " + testRunId);
            } else {
                System.err.println("❌ Import failed");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}
```

**To run:**
```bash
# 1. Set environment variables (see Step 1)
# 2. Compile and run
javac -cp "sdk.jar:..." SimpleJsonImport.java
java -cp ".:sdk.jar:..." com.example.SimpleJsonImport
```

### Example 2: Import with Programmatic Configuration

```java
package com.example;

import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestReportImporter;

public class JsonImportWithConfig {
    public static void main(String[] args) {
        // Create configuration programmatically
        EZTestConfig config = new EZTestConfig(
            "https://your-eztest-server.com",  // Server URL
            "your-api-key-here",                 // API key
            "clxyz123abc456def789"               // Project ID (CUID)
        );
        
        EZTestClient client = new EZTestClient(config);
        EZTestReportImporter importer = new EZTestReportImporter(client);
        
        try {
            String testRunId = importer.importFromFile("report.json");
            
            if (testRunId != null) {
                System.out.println("✅ Success! Test Run ID: " + testRunId);
                System.out.println("View at: " + config.getServerUrl() + 
                    "/projects/" + config.getProjectId() + "/testruns/" + testRunId);
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}
```

### Example 3: Import from Command Line Argument

```java
package com.example;

import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestReportImporter;

public class JsonImportCLI {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Usage: java JsonImportCLI <path-to-json-file>");
            System.exit(1);
        }
        
        String jsonFilePath = args[0];
        EZTestClient client = new EZTestClient();
        EZTestReportImporter importer = new EZTestReportImporter(client);
        
        try {
            System.out.println("Importing: " + jsonFilePath);
            String testRunId = importer.importFromFile(jsonFilePath);
            
            if (testRunId != null) {
                System.out.println("✅ Success! Test Run ID: " + testRunId);
            } else {
                System.err.println("❌ Import failed");
                System.exit(1);
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        } finally {
            client.close();
        }
    }
}
```

**To run:**
```bash
java -cp ".:sdk.jar:..." com.example.JsonImportCLI path/to/report.json
```

---

## Step 4: Verify the Import

After importing, check EZTest:

1. **Log in to EZTest**
2. **Navigate to your project** (the one you set in `EZTEST_PROJECT_ID`)
3. **Go to Test Runs** section
4. **Look for a new test run** with:
   - Name like: `v1.0.234 - Regression - 2026-01-12T21:35:43 IST`
   - Or: `Automated Test Run - [timestamp]`
5. **Click on the test run** to see:
   - All test cases that were imported
   - Pass/Fail/Skip status
   - Duration for each test
   - Error messages (if any failed)

---

## What Happens During Import?

When you import a JSON report, the SDK:

1. **Parses the JSON** - Validates and reads your report structure
2. **Creates/Maps Test Cases** - For each test in `results`:
   - Searches for existing test case by `test_id` (if provided)
   - If not found, searches by title
   - If still not found, creates a new test case
3. **Creates Test Run** - Creates a new test run with:
   - Name from `build_id`, `execution_profile`, or timestamp
   - Environment from `browser` and `environment_url`
   - Description from `report_source` and `triggered_by`
4. **Records Results** - Records each test result with:
   - Status (PASS → PASSED, FAIL → FAILED, SKIP → SKIPPED)
   - Duration (converted from milliseconds to seconds)
   - Tags (added to comments)
   - Error messages and stack traces (for failed tests)
5. **Completes Test Run** - Marks the test run as completed

---

## Troubleshooting

### Error: "EZTest configuration not found"

**Solution:**
- Check environment variables are set: `EZTEST_SERVER_URL`, `EZTEST_API_KEY`, `EZTEST_PROJECT_ID`
- Restart your terminal/IDE after setting variables
- Or use programmatic configuration instead

### Error: "Report file does not exist"

**Solution:**
- Check the file path is correct
- Use absolute path if relative path doesn't work
- Verify file permissions

### Error: "Error parsing JSON report"

**Solution:**
- Validate your JSON using a JSON validator
- Check that required fields are present: `report_meta`, `summary`, `results`
- Ensure `results` array has at least one item
- Each result must have `testCaseId` and `status`

### Error: "401 Unauthorized"

**Solution:**
- Your API key might be expired or deleted (create a new one)
- Check API key is correct (no extra spaces)
- Verify API key has required permissions
- Verify server URL is correct

### Error: "Project not found"

**Solution:**
- Verify project ID is correct (should be CUID like `clxyz123...`)
- Check you have access to the project
- Make sure project ID is from the URL, not the project name

### Import returns `null`

**Solution:**
- Check logs for detailed error messages
- Verify JSON format matches specification
- Ensure at least one test result in `results` array
- Check network connectivity to EZTest server

---

## Quick Reference

### Import Methods

```java
// From file
String testRunId = importer.importFromFile("report.json");

// From JSON string
String testRunId = importer.importFromJson(jsonString);

// From InputStream
String testRunId = importer.importFromStream(inputStream);
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EZTEST_SERVER_URL` | EZTest server URL | `https://eztest.example.com` |
| `EZTEST_API_KEY` | API key for authentication | `ez_abc123...` |
| `EZTEST_PROJECT_ID` | Project CUID (from URL) | `clxyz123abc456def789` |

### Required JSON Fields

- `testRunName` (required) - Name of the test run
- `environment` (required) - Environment name
- `results` array with at least one item
- Each result must have: `testCaseId` and `status`

---

## Sample Files

- **Sample JSON**: [samples/automation-report-example.json](samples/automation-report-example.json)
- **Complete Example**: [samples/JsonReportImportExample.java](samples/JsonReportImportExample.java)

---

## Next Steps

- ✅ **JSON Format Details**: See [JSON_FORMAT_SPECIFICATION.md](JSON_FORMAT_SPECIFICATION.md)
- ✅ **Usage Guide**: See [USAGE_GUIDE.md](USAGE_GUIDE.md)
- ✅ **API Key Setup**: See [API_KEY_SETUP.md](API_KEY_SETUP.md)
- ✅ **Get Project ID**: See [GET_PROJECT_ID.md](GET_PROJECT_ID.md)

---

**Need Help?** Check the logs for detailed error messages or refer to the troubleshooting section above.

