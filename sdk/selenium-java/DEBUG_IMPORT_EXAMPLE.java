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

        System.out.println("=== EZTest JSON Import Debug ===");
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
        System.out.println("   File size: " + file.length() + " bytes");

        // Try to read and display JSON content
        try {
            String content = new String(java.nio.file.Files.readAllBytes(file.toPath()));
            System.out.println("\n📄 JSON Content Preview:");
            System.out.println(content.substring(0, Math.min(500, content.length())));
            if (content.length() > 500) {
                System.out.println("... (truncated)");
            }
        } catch (Exception e) {
            System.err.println("⚠️  Could not read JSON file: " + e.getMessage());
        }

        // Create config and client
        EZTestConfig config = new EZTestConfig(serverUrl, apiKey, projectId);
        EZTestClient client = new EZTestClient(config);
        EZTestReportImporter importer = new EZTestReportImporter(client);

        try {
            System.out.println("\n📤 Attempting to import report...");
            String testRunId = importer.importFromFile(jsonFilePath);

            if (testRunId != null) {
                System.out.println("\n✅ Import successful!");
                System.out.println("   Test Run ID: " + testRunId);
                System.out.println("   View at: " + serverUrl + "/projects/" + projectId + "/testruns/" + testRunId);
            } else {
                System.err.println("\n❌ Import failed - returned null");
                System.err.println("\nTroubleshooting:");
                System.err.println("1. Check that test case IDs in JSON exist in your project");
                System.err.println("2. Verify API key has correct permissions");
                System.err.println("3. Check server logs for detailed API errors");
                System.err.println("4. Make sure backend server is running and updated");
                System.err.println("\nExpected JSON format:");
                System.err.println("{");
                System.err.println("  \"testRunName\": \"...\",");
                System.err.println("  \"environment\": \"...\",");
                System.err.println("  \"results\": [{");
                System.err.println("    \"testCaseId\": \"TC-1\",  // or database UUID");
                System.err.println("    \"status\": \"PASSED\"");
                System.err.println("  }]");
                System.err.println("}");
            }

        } catch (Exception e) {
            System.err.println("\n❌ Exception occurred:");
            System.err.println("   Message: " + e.getMessage());
            System.err.println("   Type: " + e.getClass().getName());
            System.err.println("\nFull stack trace:");
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}

