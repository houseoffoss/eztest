package com.eztest.demo;

import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestReportImporter;
import java.io.File;
import java.nio.file.Files;

/**
 * FINAL TEST CODE - Shows all errors clearly
 * 
 * This version will print:
 * - File existence check
 * - JSON content
 * - API URL being called
 * - Request body
 * - All API errors
 * - All exceptions
 */
public class ImportJson {
    public static void main(String[] args) {
        // ⚠️ UPDATE THESE VALUES:
        String serverUrl = "http://localhost:3000";
        String apiKey = "ez_a069aa5ecca944ca5d9fb3a9a50a1344";
        String projectId = "cmk7yjgvz0001wk530v7u5f79";
        String jsonFilePath = "report.json";

        System.out.println("========================================");
        System.out.println("EZTest JSON Import - Debug Mode");
        System.out.println("========================================");
        System.out.println("Server URL: " + serverUrl);
        System.out.println("Project ID: " + projectId);
        System.out.println("JSON File: " + jsonFilePath);
        System.out.println("Current Directory: " + System.getProperty("user.dir"));
        System.out.println();

        // Step 1: Check file exists
        File file = new File(jsonFilePath);
        if (!file.exists()) {
            System.err.println("❌ ERROR: JSON file not found!");
            System.err.println("   Looking for: " + jsonFilePath);
            System.err.println("   Absolute path: " + file.getAbsolutePath());
            System.err.println("   Solution: Create report.json in the current directory");
            return;
        }
        System.out.println("✅ Step 1: File exists");
        System.out.println("   Path: " + file.getAbsolutePath());
        System.out.println("   Size: " + file.length() + " bytes");
        System.out.println();

        // Step 2: Read and display JSON
        String jsonContent = null;
        try {
            jsonContent = new String(Files.readAllBytes(file.toPath()));
            System.out.println("✅ Step 2: JSON file read successfully");
            System.out.println("   Content preview:");
            System.out.println("   " + jsonContent.substring(0, Math.min(300, jsonContent.length())).replace("\n", "\n   "));
            if (jsonContent.length() > 300) {
                System.out.println("   ... (truncated)");
            }
            System.out.println();
        } catch (Exception e) {
            System.err.println("❌ ERROR: Could not read JSON file");
            System.err.println("   " + e.getMessage());
            e.printStackTrace();
            return;
        }

        // Step 3: Create client
        System.out.println("✅ Step 3: Creating EZTest client...");
        EZTestConfig config = new EZTestConfig(serverUrl, apiKey, projectId);
        EZTestClient client = new EZTestClient(config);
        EZTestReportImporter importer = new EZTestReportImporter(client);
        System.out.println();

        // Step 4: Import
        System.out.println("✅ Step 4: Starting import...");
        System.out.println("   (Watch for errors below)");
        System.out.println();
        System.out.println("--- IMPORT PROCESS ---");
        
        try {
            String testRunId = importer.importFromFile(jsonFilePath);

            System.out.println("--- END IMPORT ---");
            System.out.println();

            if (testRunId != null) {
                System.out.println("========================================");
                System.out.println("✅ SUCCESS!");
                System.out.println("========================================");
                System.out.println("Test Run ID: " + testRunId);
                System.out.println("View at: " + serverUrl + "/projects/" + projectId + "/testruns/" + testRunId);
                System.out.println();
                System.out.println("Next steps:");
                System.out.println("1. Go to EZTest UI");
                System.out.println("2. Navigate to your project");
                System.out.println("3. Go to Test Runs");
                System.out.println("4. You should see the new test run!");
            } else {
                System.err.println("========================================");
                System.err.println("❌ FAILED - Import returned null");
                System.err.println("========================================");
                System.err.println();
                System.err.println("Possible causes:");
                System.err.println("1. JSON format is incorrect (check errors above)");
                System.err.println("2. Test case IDs don't exist in your project");
                System.err.println("3. API key doesn't have permissions");
                System.err.println("4. Backend server error (check server logs)");
                System.err.println();
                System.err.println("Check the error messages above for details!");
            }
        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("❌ EXCEPTION OCCURRED");
            System.err.println("========================================");
            System.err.println("Message: " + e.getMessage());
            System.err.println("Type: " + e.getClass().getName());
            System.err.println();
            System.err.println("Full stack trace:");
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}

