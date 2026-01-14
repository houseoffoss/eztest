package com.eztest.demo;

import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestReportImporter;
import java.io.File;

public class ImportJson {

    public static void main(String[] args) {
        // Configuration
        String serverUrl = "http://localhost:3000";
        String apiKey = "ez_a069aa5ecca944ca5d9fb3a9a50a1344";
        String projectId = "cmk7yjgvz0001wk530v7u5f79";
        String jsonFilePath = "report.json";

        System.out.println("=== EZTest JSON Import Test ===");
        System.out.println("Server URL: " + serverUrl);
        System.out.println("Project ID: " + projectId);
        System.out.println("JSON File: " + jsonFilePath);
        System.out.println("Current Directory: " + System.getProperty("user.dir"));

        // Check if file exists
        File file = new File(jsonFilePath);
        if (!file.exists()) {
            System.err.println("\n❌ ERROR: JSON file not found!");
            System.err.println("   Looking for: " + jsonFilePath);
            System.err.println("   Absolute path: " + file.getAbsolutePath());
            System.err.println("   Make sure 'report.json' exists in the current directory");
            return;
        }
        System.out.println("✅ File exists: " + file.getAbsolutePath());

        // Create config and client
        EZTestConfig config = new EZTestConfig(serverUrl, apiKey, projectId);
        EZTestClient client = new EZTestClient(config);
        EZTestReportImporter importer = new EZTestReportImporter(client);

        try {
            System.out.println("\n📤 Importing report...");
            String testRunId = importer.importFromFile(jsonFilePath);

            if (testRunId != null) {
                System.out.println("\n✅ Import successful!");
                System.out.println("   Test Run ID: " + testRunId);
                System.out.println("   View at: " + serverUrl + "/projects/" + projectId + "/testruns/" + testRunId);
            } else {
                System.err.println("\n❌ Import failed - returned null");
                System.err.println("\nCommon issues:");
                System.err.println("1. Check that test case IDs in JSON exist in your project");
                System.err.println("2. Verify API key has correct permissions");
                System.err.println("3. Check JSON format matches automation report format:");
                System.err.println("   {");
                System.err.println("     \"testRunName\": \"...\",");
                System.err.println("     \"environment\": \"...\",");
                System.err.println("     \"results\": [{");
                System.err.println("       \"testCaseId\": \"<real-test-case-id>\",");
                System.err.println("       \"status\": \"PASSED\",");
                System.err.println("       \"duration\": 120");
                System.err.println("     }]");
                System.err.println("   }");
                System.err.println("4. Check server logs for detailed API errors");
            }

        } catch (Exception e) {
            System.err.println("\n❌ Exception occurred:");
            System.err.println("   " + e.getMessage());
            System.err.println("   Type: " + e.getClass().getName());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}

