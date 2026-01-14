package com.eztest.demo;

import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestReportImporter;
import java.io.File;
import java.nio.file.Files;

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
        System.out.println();

        // Check if file exists
        File file = new File(jsonFilePath);
        if (!file.exists()) {
            System.err.println("❌ ERROR: JSON file not found!");
            System.err.println("   Looking for: " + jsonFilePath);
            System.err.println("   Absolute path: " + file.getAbsolutePath());
            System.err.println("   Make sure 'report.json' exists in the current directory");
            return;
        }
        System.out.println("✅ File exists: " + file.getAbsolutePath());
        System.out.println("   File size: " + file.length() + " bytes");
        System.out.println();

        // Try to read and display JSON content
        try {
            String content = new String(Files.readAllBytes(file.toPath()));
            System.out.println("📄 JSON Content:");
            System.out.println(content);
            System.out.println();
        } catch (Exception e) {
            System.err.println("⚠️  Could not read JSON file: " + e.getMessage());
            e.printStackTrace();
            return;
        }

        // Create config and client
        System.out.println("🔧 Creating EZTest client...");
        EZTestConfig config = new EZTestConfig(serverUrl, apiKey, projectId);
        EZTestClient client = new EZTestClient(config);
        EZTestReportImporter importer = new EZTestReportImporter(client);

        try {
            System.out.println("📤 Attempting to import report...");
            System.out.println("   (Check console for API errors below)");
            System.out.println();
            
            String testRunId = importer.importFromFile(jsonFilePath);

            System.out.println();
            if (testRunId != null) {
                System.out.println("✅ Import successful!");
                System.out.println("   Test Run ID: " + testRunId);
                System.out.println("   View at: " + serverUrl + "/projects/" + projectId + "/testruns/" + testRunId);
            } else {
                System.err.println("❌ Import failed - returned null");
                System.err.println();
                System.err.println("Troubleshooting steps:");
                System.err.println("1. Check the API error messages above (if any)");
                System.err.println("2. Verify test case IDs in JSON exist in your project");
                System.err.println("   - Use 'TC-1', 'TC-2' format (recommended)");
                System.err.println("   - Or use database UUID");
                System.err.println("3. Make sure backend server is running and restarted");
                System.err.println("4. Verify API key has correct permissions");
                System.err.println("5. Check server logs for detailed errors");
                System.err.println();
                System.err.println("Expected JSON format:");
                System.err.println("{");
                System.err.println("  \"testRunName\": \"SDK Test Run\",");
                System.err.println("  \"environment\": \"Testing\",");
                System.err.println("  \"results\": [{");
                System.err.println("    \"testCaseId\": \"TC-1\",  // Must exist in project");
                System.err.println("    \"status\": \"PASSED\"");
                System.err.println("  }]");
                System.err.println("}");
            }

        } catch (Exception e) {
            System.err.println();
            System.err.println("❌ Exception occurred:");
            System.err.println("   Message: " + e.getMessage());
            System.err.println("   Type: " + e.getClass().getName());
            System.err.println();
            System.err.println("Full stack trace:");
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}

