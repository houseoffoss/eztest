package com.eztest.sdk.core;

import com.eztest.sdk.models.*;
import com.eztest.sdk.utils.TimeUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * Utility class for importing test reports from JSON format (e.g., ExtentSparkReporter)
 * and syncing them with EZTest.
 * 
 * SDK Boundary: This class parses external test report JSON and uses EZTestClient
 * (which only communicates via REST APIs) to sync results. NO database access,
 * NO dependencies on EZTest backend code.
 * 
 * This class handles:
 * - Parsing ExtentSparkReporter or similar JSON report formats
 * - Creating test cases in EZTest (if they don't exist)
 * - Creating a test run for the report
 * - Recording all test results
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
     * Imports a test report from a JSON string and syncs it with EZTest.
     * 
     * @param jsonString JSON string containing the test report
     * @return Test run ID if successful, null otherwise
     */
    public String importFromJson(String jsonString) {
        try {
            ExtentReportModel report = objectMapper.readValue(jsonString, ExtentReportModel.class);
            return syncReportToEZTest(report);
        } catch (Exception e) {
            logger.error("Error parsing JSON report", e);
            return null;
        }
    }

    /**
     * Syncs the parsed report to EZTest.
     * 
     * @param report Parsed report model
     * @return Test run ID if successful, null otherwise
     */
    private String syncReportToEZTest(ExtentReportModel report) {
        if (report == null || report.getResults() == null || report.getResults().isEmpty()) {
            logger.warn("Report is empty or has no results");
            return null;
        }

        try {
            // Step 1: Create or map test cases
            List<String> testCaseIds = new ArrayList<>();
            for (ExtentReportModel.TestResult result : report.getResults()) {
                String testCaseId = createOrMapTestCase(result, report);
                if (testCaseId != null) {
                    testCaseIds.add(testCaseId);
                }
            }

            if (testCaseIds.isEmpty()) {
                logger.warn("No test cases could be created/mapped");
                return null;
            }

            // Step 2: Create test run
            String testRunName = buildTestRunName(report);
            CreateTestRunRequest testRunRequest = new CreateTestRunRequest();
            testRunRequest.setName(testRunName);
            testRunRequest.setDescription(buildTestRunDescription(report));
            testRunRequest.setEnvironment(buildEnvironmentString(report));
            testRunRequest.setTestCaseIds(testCaseIds);

            String testRunId = client.createTestRun(testRunRequest);
            if (testRunId == null) {
                logger.error("Failed to create test run");
                return null;
            }

            // Step 3: Start test run
            client.startTestRun(testRunId);

            // Step 4: Record test results
            for (ExtentReportModel.TestResult result : report.getResults()) {
                String testCaseId = createOrMapTestCase(result, report);
                if (testCaseId == null) {
                    continue;
                }

                RecordTestResultRequest resultRequest = buildResultRequest(result, testCaseId);
                client.recordTestResult(testRunId, resultRequest);
            }

            // Step 5: Complete test run
            client.completeTestRun(testRunId);

            logger.info("Successfully imported report to EZTest. Test run ID: {}", testRunId);
            return testRunId;

        } catch (Exception e) {
            logger.error("Error syncing report to EZTest", e);
            return null;
        }
    }

    /**
     * Creates or maps a test case for the given test result.
     * 
     * @param result Test result from the report
     * @param report Full report (for additional context)
     * @return Test case ID, or null if creation failed
     */
    private String createOrMapTestCase(ExtentReportModel.TestResult result, ExtentReportModel report) {
        // Use test_id if available, otherwise use test_name
        String testCaseTitle = result.getTestId() != null && !result.getTestId().trim().isEmpty()
                ? result.getTestId() + " - " + result.getTestName()
                : result.getTestName();

        // First, try to find existing test case by ID or title
        String existingTestCaseId = client.findOrCreateTestCase(
            result.getTestId(), // Try by ID first
            testCaseTitle        // Then try by title
        );
        
        if (existingTestCaseId != null) {
            logger.debug("Using existing test case: {} for test: {}", existingTestCaseId, testCaseTitle);
            return existingTestCaseId;
        }
        
        // If not found, create new test case
        logger.debug("Test case not found, creating new one: {}", testCaseTitle);
        
        // Create test case request
        CreateTestCaseRequest request = new CreateTestCaseRequest(testCaseTitle);
        
        // Build description from available information
        StringBuilder description = new StringBuilder();
        if (result.getClassName() != null) {
            description.append("Class: ").append(result.getClassName()).append("\n");
        }
        if (result.getTags() != null && !result.getTags().isEmpty()) {
            description.append("Tags: ").append(String.join(", ", result.getTags())).append("\n");
        }
        if (report.getReportMeta() != null && report.getReportMeta().getEnvironment() != null) {
            ExtentReportModel.Environment env = report.getReportMeta().getEnvironment();
            description.append("Environment: ");
            if (env.getBrowser() != null) description.append(env.getBrowser());
            if (env.getOs() != null) description.append(" on ").append(env.getOs());
            description.append("\n");
        }
        if (description.length() > 0) {
            request.setDescription(description.toString().trim());
        }

        // Set priority based on tags or default to MEDIUM
        String priority = "MEDIUM";
        if (result.getTags() != null) {
            if (result.getTags().stream().anyMatch(tag -> 
                tag.equalsIgnoreCase("critical") || tag.equalsIgnoreCase("high"))) {
                priority = "HIGH";
            }
        }
        request.setPriority(priority);
        request.setStatus("ACTIVE");

        return client.createTestCase(request);
    }

    /**
     * Builds a test run name from the report metadata.
     */
    private String buildTestRunName(ExtentReportModel report) {
        StringBuilder name = new StringBuilder();
        
        if (report.getReportMeta() != null) {
            if (report.getReportMeta().getUserConfig() != null) {
                String buildId = report.getReportMeta().getUserConfig().getBuildId();
                String profile = report.getReportMeta().getUserConfig().getExecutionProfile();
                if (buildId != null) {
                    name.append(buildId);
                }
                if (profile != null) {
                    if (name.length() > 0) name.append(" - ");
                    name.append(profile);
                }
            }
            if (report.getReportMeta().getProjectName() != null && name.length() == 0) {
                name.append(report.getReportMeta().getProjectName());
            }
        }
        
        if (name.length() == 0) {
            name.append("Automated Test Run");
        }
        
        if (report.getSummary() != null && report.getSummary().getStartTime() != null) {
            name.append(" - ").append(report.getSummary().getStartTime());
        }
        
        return name.toString();
    }

    /**
     * Builds a test run description from the report metadata.
     */
    private String buildTestRunDescription(ExtentReportModel report) {
        StringBuilder desc = new StringBuilder();
        desc.append("Automated test execution imported from ");
        
        if (report.getReportMeta() != null) {
            if (report.getReportMeta().getReportSource() != null) {
                desc.append(report.getReportMeta().getReportSource());
            } else {
                desc.append("external report");
            }
            
            if (report.getReportMeta().getUserConfig() != null) {
                String triggeredBy = report.getReportMeta().getUserConfig().getTriggeredBy();
                if (triggeredBy != null) {
                    desc.append("\nTriggered by: ").append(triggeredBy);
                }
            }
        }
        
        return desc.toString();
    }

    /**
     * Builds environment string from report metadata.
     */
    private String buildEnvironmentString(ExtentReportModel report) {
        if (report.getReportMeta() == null || report.getReportMeta().getEnvironment() == null) {
            return "AUTOMATION";
        }
        
        ExtentReportModel.Environment env = report.getReportMeta().getEnvironment();
        StringBuilder envStr = new StringBuilder();
        
        if (env.getBrowser() != null) {
            envStr.append(env.getBrowser());
        }
        if (env.getEnvironmentUrl() != null) {
            if (envStr.length() > 0) envStr.append(" - ");
            envStr.append(env.getEnvironmentUrl());
        }
        
        return envStr.length() > 0 ? envStr.toString() : "AUTOMATION";
    }

    /**
     * Builds a RecordTestResultRequest from a test result.
     * 
     * @param result Test result from the report
     * @param testCaseId Test case ID (must be provided)
     * @return RecordTestResultRequest ready to be sent to EZTest
     */
    private RecordTestResultRequest buildResultRequest(ExtentReportModel.TestResult result, String testCaseId) {
        // Map status from report format to EZTest format
        TestResultStatus status = mapStatus(result.getStatus());
        
        RecordTestResultRequest request = new RecordTestResultRequest(testCaseId, status);
        
        // Convert duration from milliseconds to seconds
        if (result.getDurationMs() != null) {
            request.setDuration(TimeUtils.millisecondsToSeconds(result.getDurationMs()));
        }
        
        // Build comment
        StringBuilder comment = new StringBuilder();
        if (result.getTags() != null && !result.getTags().isEmpty()) {
            comment.append("Tags: ").append(String.join(", ", result.getTags()));
        }
        if (comment.length() > 0) {
            request.setComment(comment.toString());
        }
        
        // Add error information for failed tests
        if (status == TestResultStatus.FAILED) {
            request.setErrorMessage(result.getErrorMessage());
            request.setStackTrace(result.getStackTrace());
        }
        
        return request;
    }

    /**
     * Maps status string from report format to EZTest TestResultStatus.
     */
    private TestResultStatus mapStatus(String status) {
        if (status == null) {
            return TestResultStatus.SKIPPED;
        }
        
        String statusUpper = status.toUpperCase().trim();
        switch (statusUpper) {
            case "PASS":
            case "PASSED":
                return TestResultStatus.PASSED;
            case "FAIL":
            case "FAILED":
                return TestResultStatus.FAILED;
            case "SKIP":
            case "SKIPPED":
                return TestResultStatus.SKIPPED;
            default:
                logger.warn("Unknown status: {}. Defaulting to SKIPPED", status);
                return TestResultStatus.SKIPPED;
        }
    }
}

