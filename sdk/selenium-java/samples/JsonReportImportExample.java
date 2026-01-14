package com.eztest.sdk.samples;

import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestReportImporter;

/**
 * Example demonstrating how to import automation test reports into EZTest.
 * 
 * This example shows how to use the EZTestReportImporter to sync test results
 * from an automation report JSON format with EZTest.
 * 
 * Prerequisites:
 * - Set environment variables: EZTEST_SERVER_URL, EZTEST_API_KEY, EZTEST_PROJECT_ID
 * - Or provide configuration programmatically (see example below)
 * 
 * Usage:
 * 1. Generate your test report in the automation report JSON format
 * 2. Run this example with the path to your JSON report file
 * 3. Check EZTest to see the imported test run and results
 * 
 * JSON Format:
 * {
 *   "testRunName": "CI/CD Pipeline - Build #123",
 *   "environment": "Staging",
 *   "results": [
 *     {
 *       "testCaseId": "tc_abc123",
 *       "status": "PASSED",
 *       "duration": 120
 *     }
 *   ]
 * }
 */
public class JsonReportImportExample {
    
    public static void main(String[] args) {
        // Path to your automation report JSON file
        String jsonReportPath = "samples/automation-report-example.json";
        
        // If you want to use a different path, pass it as command line argument
        if (args.length > 0) {
            jsonReportPath = args[0];
        }
        
        // Method 1: Use environment variables (recommended)
        // Make sure EZTEST_SERVER_URL, EZTEST_API_KEY, EZTEST_PROJECT_ID are set
        importReportUsingEnvVars(jsonReportPath);
        
        // Method 2: Use programmatic configuration
        // Uncomment to use this method instead:
        // importReportUsingConfig(jsonReportPath);
    }
    
    /**
     * Example: Import report using environment variables.
     * 
     * This method reads configuration from environment variables:
     * - EZTEST_SERVER_URL
     * - EZTEST_API_KEY (your API key)
     * - EZTEST_PROJECT_ID (your project CUID)
     */
    private static void importReportUsingEnvVars(String jsonReportPath) {
        System.out.println("=== Importing Report Using Environment Variables ===");
        
        // Check environment variables first
        String serverUrl = System.getenv("EZTEST_SERVER_URL");
        String apiKey = System.getenv("EZTEST_API_KEY");
        String projectId = System.getenv("EZTEST_PROJECT_ID");
        
        System.out.println("\nConfiguration Check:");
        System.out.println("  Server URL: " + (serverUrl != null ? serverUrl : "❌ NOT SET"));
        System.out.println("  API Key: " + (apiKey != null ? (apiKey.substring(0, Math.min(10, apiKey.length())) + "...") : "❌ NOT SET"));
        System.out.println("  Project ID: " + (projectId != null ? projectId : "❌ NOT SET"));
        System.out.println("  JSON File: " + jsonReportPath);
        System.out.println("  Current Dir: " + System.getProperty("user.dir"));
        
        if (serverUrl == null || apiKey == null || projectId == null) {
            System.err.println("\n❌ Missing required environment variables!");
            System.err.println("   Set them with:");
            System.err.println("   $env:EZTEST_SERVER_URL = 'http://localhost:3000'");
            System.err.println("   $env:EZTEST_API_KEY = 'your-api-key'");
            System.err.println("   $env:EZTEST_PROJECT_ID = 'your-project-id'");
            return;
        }
        
        // Check if file exists
        java.io.File file = new java.io.File(jsonReportPath);
        if (!file.exists()) {
            System.err.println("\n❌ JSON file not found!");
            System.err.println("   Looking for: " + jsonReportPath);
            System.err.println("   Absolute path: " + file.getAbsolutePath());
            System.err.println("   Make sure the file exists or provide full path");
            return;
        }
        System.out.println("  File exists: ✅");
        
        // Create client from environment variables
        EZTestClient client = new EZTestClient();
        EZTestReportImporter importer = new EZTestReportImporter(client);
        
        try {
            System.out.println("\nReading report from: " + jsonReportPath);
            
            // Import the report
            String testRunId = importer.importFromFile(jsonReportPath);
            
            if (testRunId != null) {
                System.out.println("\n✅ Report imported successfully!");
                System.out.println("   Test Run ID: " + testRunId);
                System.out.println("   View it in EZTest at: " + 
                    serverUrl + "/projects/" + projectId + "/testruns/" + testRunId);
            } else {
                System.err.println("\n❌ Failed to import report");
                System.err.println("   Check the error messages above for details.");
                System.err.println("   Common issues:");
                System.err.println("   1. Test case IDs in JSON don't exist in your project");
                System.err.println("   2. API key doesn't have required permissions");
                System.err.println("   3. Server URL is not accessible");
                System.err.println("   4. JSON format is invalid");
            }
        } catch (Exception e) {
            System.err.println("\n❌ Exception occurred: " + e.getMessage());
            System.err.println("Error type: " + e.getClass().getName());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
    
    /**
     * Example: Import report using programmatic configuration.
     * 
     * This method creates configuration programmatically instead of using
     * environment variables.
     */
    private static void importReportUsingConfig(String jsonReportPath) {
        System.out.println("=== Importing Report Using Programmatic Config ===");
        
        // Create configuration programmatically
        EZTestConfig config = new EZTestConfig(
            "https://your-eztest-server.com",  // Your EZTest server URL
            "your-api-key-here",                // Your API key
            "clxyz123abc456def789"              // Your project ID (CUID from URL)
        );
        
        EZTestClient client = new EZTestClient(config);
        EZTestReportImporter importer = new EZTestReportImporter(client);
        
        try {
            System.out.println("Reading report from: " + jsonReportPath);
            
            // Import the report
            String testRunId = importer.importFromFile(jsonReportPath);
            
            if (testRunId != null) {
                System.out.println("✅ Report imported successfully!");
                System.out.println("   Test Run ID: " + testRunId);
            } else {
                System.err.println("❌ Failed to import report");
            }
        } catch (Exception e) {
            System.err.println("❌ Error importing report: " + e.getMessage());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
    
    /**
     * Example: Import report from JSON string (instead of file).
     * 
     * Useful when you have the JSON content in memory or from an API.
     */
    private static void importReportFromJsonString() {
        System.out.println("=== Importing Report From JSON String ===");
        
        // Automation report JSON format
        String jsonReport = """
            {
              "testRunName": "CI/CD Pipeline - Build #123",
              "environment": "Staging",
              "description": "Automated regression tests from Jenkins",
              "results": [
                {
                  "testCaseId": "tc_abc123",
                  "status": "PASSED",
                  "duration": 120,
                  "comment": "Test executed successfully"
                },
                {
                  "testCaseId": "tc_def456",
                  "status": "FAILED",
                  "duration": 95,
                  "comment": "Test failed due to timeout",
                  "errorMessage": "Timeout waiting for login button",
                  "stackTrace": "java.lang.TimeoutException: Element not found"
                }
              ]
            }
            """;
        
        EZTestClient client = new EZTestClient();
        EZTestReportImporter importer = new EZTestReportImporter(client);
        
        try {
            // Import from JSON string
            String testRunId = importer.importFromJson(jsonReport);
            
            if (testRunId != null) {
                System.out.println("✅ Report imported successfully!");
                System.out.println("   Test Run ID: " + testRunId);
            } else {
                System.err.println("❌ Failed to import report");
            }
        } catch (Exception e) {
            System.err.println("❌ Error importing report: " + e.getMessage());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}

