package com.eztest.sdk.core;

import com.eztest.sdk.models.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * Utility class for importing automation test reports from JSON format.
 * 
 * Uses the minimal automation report format and the automation-report API endpoint.
 * 
 * SDK Boundary: This class parses external test report JSON and uses EZTestClient
 * (which only communicates via REST APIs) to sync results. NO database access,
 * NO dependencies on EZTest backend code.
 * 
 * This class handles:
 * - Parsing automation report JSON format
 * - Importing via automation-report API (single API call)
 * - Auto-creates test runs and test cases
 * - Records all test results
 */
public class EZTestReportImporter {
    
    private static final Logger logger = LoggerFactory.getLogger(EZTestReportImporter.class);
    
    private final EZTestClient client;
    private final ObjectMapper objectMapper;
    
    /**
     * Creates a new report importer with the given EZTest client.
     * 
     * @param client EZTest client instance (must not be null)
     */
    public EZTestReportImporter(EZTestClient client) {
        if (client == null) {
            throw new IllegalArgumentException("EZTest client cannot be null");
        }
        this.client = client;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Imports a test report from a JSON file and syncs it with EZTest.
     * 
     * @param jsonFilePath Path to the JSON report file
     * @return Test run ID if successful, null otherwise
     * @throws IOException if the file cannot be read
     */
    public String importFromFile(String jsonFilePath) throws IOException {
        File file = new File(jsonFilePath);
        if (!file.exists()) {
            throw new IOException("Report file does not exist: " + jsonFilePath);
        }
        return importFromJson(new String(Files.readAllBytes(Paths.get(jsonFilePath))));
    }

    /**
     * Imports a test report from an InputStream and syncs it with EZTest.
     * 
     * @param inputStream InputStream containing JSON report data
     * @return Test run ID if successful, null otherwise
     * @throws IOException if the stream cannot be read
     */
    public String importFromStream(InputStream inputStream) throws IOException {
        return importFromJson(new String(inputStream.readAllBytes()));
    }

    /**
     * Imports an automation report from a JSON string and syncs it with EZTest.
     * 
     * Uses the automation report format:
     * {
     *   "testRunName": "...",
     *   "environment": "...",
     *   "results": [...]
     * }
     * 
     * @param jsonString JSON string containing the automation report
     * @return Test run ID if successful, null otherwise
     */
    public String importFromJson(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            String error = "JSON string is empty";
            logger.warn(error);
            System.err.println("❌ " + error);
            return null;
        }

        try {
            AutomationReportModel report = objectMapper.readValue(jsonString, AutomationReportModel.class);
            return importAutomationReport(report);
        } catch (Exception e) {
            String error = "Error parsing automation report JSON: " + e.getMessage();
            logger.error(error, e);
            System.err.println("❌ " + error);
            System.err.println("   Make sure JSON matches automation report format:");
            System.err.println("   {");
            System.err.println("     \"testRunName\": \"...\",");
            System.err.println("     \"environment\": \"...\",");
            System.err.println("     \"results\": [...]");
            System.err.println("   }");
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Imports an automation report using the automation-report API endpoint.
     * Single API call that handles everything: creates test run, test cases, and records results.
     * 
     * @param report Automation report model
     * @return Test run ID if successful, null otherwise
     */
    private String importAutomationReport(AutomationReportModel report) {
        if (report == null || report.getResults() == null || report.getResults().isEmpty()) {
            String error = "Automation report is empty or has no results";
            logger.warn(error);
            System.err.println("❌ " + error);
            return null;
        }

        if (report.getTestRunName() == null || report.getTestRunName().trim().isEmpty()) {
            String error = "Test run name is required";
            logger.error(error);
            System.err.println("❌ " + error);
            return null;
        }

        if (report.getEnvironment() == null || report.getEnvironment().trim().isEmpty()) {
            String error = "Environment is required";
            logger.error(error);
            System.err.println("❌ " + error);
            return null;
        }

        try {
            System.out.println("📤 Sending automation report to API...");
            System.out.println("   Test Run Name: " + report.getTestRunName());
            System.out.println("   Environment: " + report.getEnvironment());
            System.out.println("   Results Count: " + report.getResults().size());
            
            String testRunId = client.importAutomationReport(report);
            if (testRunId != null) {
                logger.info("Successfully imported automation report to EZTest. Test run ID: {}", testRunId);
                System.out.println("✅ Import successful!");
            } else {
                String error = "Failed to import automation report - API returned null";
                logger.error(error);
                System.err.println("❌ " + error);
                System.err.println("   Check API error messages above for details");
            }
            return testRunId;
        } catch (Exception e) {
            String error = "Error importing automation report: " + e.getMessage();
            logger.error(error, e);
            System.err.println("❌ " + error);
            e.printStackTrace();
            return null;
        }
    }

}

