package com.eztest.sdk.samples;

import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestReportImporter;

/**
 * Example demonstrating how to import JSON test reports into EZTest.
 * 
 * This example shows how to use the EZTestReportImporter to sync test results
 * from a JSON report (e.g., ExtentSparkReporter format) with EZTest.
 * 
 * Prerequisites:
 * - Set environment variables: EZTEST_SERVER_URL, EZTEST_API_KEY, EZTEST_PROJECT_ID
 * - Or provide configuration programmatically (see example below)
 * 
 * Usage:
 * 1. Generate your test report in the supported JSON format
 * 2. Run this example with the path to your JSON report file
 * 3. Check EZTest to see the imported test run and results
 */
public class JsonReportImportExample {
    
    public static void main(String[] args) {
        // Path to your JSON report file
        String jsonReportPath = "samples/sample-report.json";
        
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
     * - EZTEST_API_KEY (your JWT token)
     * - EZTEST_PROJECT_ID (your project CUID)
     */
    private static void importReportUsingEnvVars(String jsonReportPath) {
        System.out.println("=== Importing Report Using Environment Variables ===");
        
        // Create client from environment variables
        EZTestClient client = new EZTestClient();
        EZTestReportImporter importer = new EZTestReportImporter(client);
        
        try {
            System.out.println("Reading report from: " + jsonReportPath);
            
            // Import the report
            String testRunId = importer.importFromFile(jsonReportPath);
            
            if (testRunId != null) {
                System.out.println("✅ Report imported successfully!");
                System.out.println("   Test Run ID: " + testRunId);
                System.out.println("   View it in EZTest at: " + 
                    System.getenv("EZTEST_SERVER_URL") + "/projects/" + 
                    System.getenv("EZTEST_PROJECT_ID") + "/testruns/" + testRunId);
            } else {
                System.err.println("❌ Failed to import report");
                System.err.println("   Check your configuration and JSON format");
            }
        } catch (Exception e) {
            System.err.println("❌ Error importing report: " + e.getMessage());
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
            "your-jwt-token-here",              // Your JWT token from login
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
        
        // Your JSON report as a string
        String jsonReport = """
            {
              "report_meta": {
                "project_name": "Web Application Automation",
                "generated_at": "2026-01-12T21:36:55 IST",
                "report_source": "ExtentSparkReporter",
                "environment": {
                  "os": "Windows 11",
                  "java_version": "21",
                  "browser": "Chrome",
                  "environment_url": "https://staging.houseoffoss.com"
                },
                "user_config": {
                  "triggered_by": "Jenkins_User",
                  "build_id": "v1.0.234",
                  "execution_profile": "Regression"
                }
              },
              "summary": {
                "total_tests": 1,
                "passed": 1,
                "failed": 0,
                "skipped": 0,
                "total_duration_ms": 71924,
                "start_time": "2026-01-12T21:35:43 IST",
                "end_time": "2026-01-12T21:36:55 IST"
              },
              "results": [
                {
                  "test_id": "TC09",
                  "test_name": "TC09_NavigationCheck",
                  "class_name": "testcases.TC09_HouseofFoss_Nav_Check",
                  "status": "PASS",
                  "start_time": "2026-01-12T21:35:54 IST",
                  "end_time": "2026-01-12T21:36:54 IST",
                  "duration_ms": 60645,
                  "tags": ["Smoke", "Navigation"]
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

