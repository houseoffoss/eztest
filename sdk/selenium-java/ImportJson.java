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

        System.out.println("=== EZTest Import Debug ===");
        System.out.println("Server: " + serverUrl);
        System.out.println("Project: " + projectId);
        System.out.println("File: " + jsonFilePath);
        System.out.println("Current Dir: " + System.getProperty("user.dir"));
        System.out.println();

        // Check file exists
        File file = new File(jsonFilePath);
        if (!file.exists()) {
            System.err.println("❌ File not found: " + file.getAbsolutePath());
            return;
        }
        System.out.println("✅ File exists: " + file.getAbsolutePath());

        // Show JSON content
        try {
            String json = new String(Files.readAllBytes(file.toPath()));
            System.out.println("📄 JSON Content:");
            System.out.println(json);
            System.out.println();
        } catch (Exception e) {
            System.err.println("❌ Cannot read file: " + e.getMessage());
            return;
        }

        // Create client
        EZTestConfig config = new EZTestConfig(serverUrl, apiKey, projectId);
        EZTestClient client = new EZTestClient(config);
        EZTestReportImporter importer = new EZTestReportImporter(client);

        System.out.println("📤 Starting import...");
        System.out.println("   (Watch for errors below)");
        System.out.println();

        try {
            String testRunId = importer.importFromFile(jsonFilePath);

            System.out.println();
            if (testRunId != null) {
                System.out.println("✅ SUCCESS! Test Run ID: " + testRunId);
                System.out.println("View: " + serverUrl + "/projects/" + projectId + "/testruns/" + testRunId);
            } else {
                System.err.println("❌ FAILED - Returned null");
                System.err.println();
                System.err.println("Common issues:");
                System.err.println("1. Check JSON format (see CORRECT_JSON_FORMAT.md)");
                System.err.println("2. Verify test case IDs exist in project");
                System.err.println("3. Check API key permissions");
                System.err.println("4. Look for error messages above");
            }
        } catch (Exception e) {
            System.err.println("❌ Exception: " + e.getMessage());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}

