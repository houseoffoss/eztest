package com.eztest.sdk.core;

import com.eztest.sdk.models.*;
import com.eztest.sdk.utils.TimeUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
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
 * Utility class for importing test reports from HTML format (e.g., ExtentReports, TestNG HTML reports)
 * and syncing them with EZTest.
 * 
 * SDK Boundary: This class parses external HTML test reports and uses EZTestClient
 * (which only communicates via REST APIs) to sync results. NO database access,
 * NO dependencies on EZTest backend code.
 * 
 * Supported HTML report formats:
 * - ExtentReports HTML reports
 * - TestNG HTML reports
 * - Generic HTML test reports with table-based results
 */
public class EZTestHtmlReportImporter {
    
    private static final Logger logger = LoggerFactory.getLogger(EZTestHtmlReportImporter.class);
    
    private final EZTestClient client;
    
    /**
     * Creates a new HTML report importer with the given EZTest client.
     * 
     * @param client EZTest client instance (must not be null)
     */
    public EZTestHtmlReportImporter(EZTestClient client) {
        if (client == null) {
            throw new IllegalArgumentException("EZTest client cannot be null");
        }
        this.client = client;
    }

    /**
     * Imports a test report from an HTML file and syncs it with EZTest.
     * 
     * @param htmlFilePath Path to the HTML report file
     * @return Test run ID if successful, null otherwise
     * @throws IOException if the file cannot be read
     */
    public String importFromFile(String htmlFilePath) throws IOException {
        File file = new File(htmlFilePath);
        if (!file.exists()) {
            throw new IOException("HTML report file does not exist: " + htmlFilePath);
        }
        String htmlContent = new String(Files.readAllBytes(Paths.get(htmlFilePath)));
        return importFromHtml(htmlContent, htmlFilePath);
    }

    /**
     * Imports a test report from an InputStream and syncs it with EZTest.
     * 
     * @param inputStream InputStream containing HTML report data
     * @return Test run ID if successful, null otherwise
     * @throws IOException if the stream cannot be read
     */
    public String importFromStream(InputStream inputStream) throws IOException {
        String htmlContent = new String(inputStream.readAllBytes());
        return importFromHtml(htmlContent, null);
    }

    /**
     * Imports a test report from an HTML string and syncs it with EZTest.
     * 
     * @param htmlString HTML string containing the test report
     * @param sourcePath Optional source path for logging (can be null)
     * @return Test run ID if successful, null otherwise
     */
    public String importFromHtml(String htmlString, String sourcePath) {
        try {
            Document doc = Jsoup.parse(htmlString);
            
            // Try to detect report format and parse accordingly
            if (isExtentReport(doc)) {
                logger.info("Detected ExtentReports format");
                return importExtentReport(doc, sourcePath);
            } else if (isTestNGReport(doc)) {
                logger.info("Detected TestNG HTML report format");
                return importTestNGReport(doc, sourcePath);
            } else {
                logger.info("Attempting generic HTML report parsing");
                return importGenericHtmlReport(doc, sourcePath);
            }
        } catch (Exception e) {
            logger.error("Error parsing HTML report", e);
            return null;
        }
    }

    /**
     * Checks if the HTML document is an ExtentReports report.
     */
    private boolean isExtentReport(Document doc) {
        // ExtentReports typically has specific class names or structure
        Elements extentElements = doc.select(".test, .test-name, .test-status");
        return !extentElements.isEmpty() || 
               doc.select("script:containsData(extent)").size() > 0 ||
               doc.title().toLowerCase().contains("extent");
    }

    /**
     * Checks if the HTML document is a TestNG HTML report.
     */
    private boolean isTestNGReport(Document doc) {
        // TestNG reports have specific structure
        return doc.select("table#suites").size() > 0 ||
               doc.select("table.suiteTable").size() > 0 ||
               doc.title().toLowerCase().contains("testng");
    }

    /**
     * Imports an ExtentReports HTML report.
     */
    private String importExtentReport(Document doc, String sourcePath) {
        try {
            // Extract report metadata
            String reportTitle = doc.title();
            if (reportTitle == null || reportTitle.isEmpty()) {
                reportTitle = "ExtentReports Test Run";
            }

            // Extract test results from ExtentReports structure
            List<ExtentReportModel.TestResult> results = new ArrayList<>();
            Elements testElements = doc.select(".test, [class*='test']");
            
            if (testElements.isEmpty()) {
                // Try alternative selectors
                testElements = doc.select("tr.test, div.test");
            }

            for (Element testElement : testElements) {
                ExtentReportModel.TestResult result = parseExtentTestElement(testElement);
                if (result != null) {
                    results.add(result);
                }
            }

            if (results.isEmpty()) {
                logger.warn("No test results found in ExtentReports HTML");
                return null;
            }

            // Build summary
            ExtentReportModel.ReportSummary summary = buildSummaryFromResults(results);

            // Create ExtentReportModel structure
            ExtentReportModel report = new ExtentReportModel();
            ExtentReportModel.ReportMeta meta = new ExtentReportModel.ReportMeta();
            meta.setProjectName(reportTitle);
            meta.setReportSource("ExtentReports HTML");
            meta.setGeneratedAt(TimeUtils.getCurrentTimestamp());
            report.setReportMeta(meta);
            report.setSummary(summary);
            report.setResults(results);

            // Use the JSON importer's sync logic
            return syncReportToEZTest(report);

        } catch (Exception e) {
            logger.error("Error importing ExtentReports HTML", e);
            return null;
        }
    }

    /**
     * Imports a TestNG HTML report.
     */
    private String importTestNGReport(Document doc, String sourcePath) {
        try {
            List<ExtentReportModel.TestResult> results = new ArrayList<>();
            
            // TestNG reports have test results in tables
            Elements testRows = doc.select("table.suiteTable tr, table#suites tr");
            
            for (Element row : testRows) {
                Elements cells = row.select("td");
                if (cells.size() >= 3) {
                    ExtentReportModel.TestResult result = parseTestNGRow(cells);
                    if (result != null) {
                        results.add(result);
                    }
                }
            }

            if (results.isEmpty()) {
                logger.warn("No test results found in TestNG HTML report");
                return null;
            }

            ExtentReportModel.ReportSummary summary = buildSummaryFromResults(results);
            
            ExtentReportModel report = new ExtentReportModel();
            ExtentReportModel.ReportMeta meta = new ExtentReportModel.ReportMeta();
            meta.setProjectName(doc.title());
            meta.setReportSource("TestNG HTML Report");
            meta.setGeneratedAt(TimeUtils.getCurrentTimestamp());
            report.setReportMeta(meta);
            report.setSummary(summary);
            report.setResults(results);

            return syncReportToEZTest(report);

        } catch (Exception e) {
            logger.error("Error importing TestNG HTML report", e);
            return null;
        }
    }

    /**
     * Imports a generic HTML report by looking for common patterns.
     */
    private String importGenericHtmlReport(Document doc, String sourcePath) {
        try {
            List<ExtentReportModel.TestResult> results = new ArrayList<>();
            
            // Look for common table structures
            Elements tables = doc.select("table");
            for (Element table : tables) {
                Elements rows = table.select("tr");
                for (Element row : rows) {
                    Elements cells = row.select("td, th");
                    if (cells.size() >= 2) {
                        // Try to identify test result rows
                        String rowText = row.text().toLowerCase();
                        if (rowText.contains("test") || 
                            rowText.contains("pass") || 
                            rowText.contains("fail") ||
                            rowText.contains("skip")) {
                            ExtentReportModel.TestResult result = parseGenericTableRow(cells);
                            if (result != null) {
                                results.add(result);
                            }
                        }
                    }
                }
            }

            if (results.isEmpty()) {
                logger.warn("No test results found in generic HTML report");
                return null;
            }

            ExtentReportModel.ReportSummary summary = buildSummaryFromResults(results);
            
            ExtentReportModel report = new ExtentReportModel();
            ExtentReportModel.ReportMeta meta = new ExtentReportModel.ReportMeta();
            meta.setProjectName(doc.title());
            meta.setReportSource("HTML Report");
            meta.setGeneratedAt(TimeUtils.getCurrentTimestamp());
            report.setReportMeta(meta);
            report.setSummary(summary);
            report.setResults(results);

            return syncReportToEZTest(report);

        } catch (Exception e) {
            logger.error("Error importing generic HTML report", e);
            return null;
        }
    }

    /**
     * Parses an ExtentReports test element.
     */
    private ExtentReportModel.TestResult parseExtentTestElement(Element element) {
        try {
            ExtentReportModel.TestResult result = new ExtentReportModel.TestResult();
            
            // Extract test name
            Element nameElement = element.selectFirst(".test-name, .name, [class*='name']");
            if (nameElement != null) {
                result.setTestName(nameElement.text());
            } else {
                result.setTestName(element.text());
            }

            // Extract status
            Element statusElement = element.selectFirst(".status, .test-status, [class*='status']");
            if (statusElement != null) {
                String statusText = statusElement.text().toUpperCase();
                result.setStatus(mapStatusFromText(statusText));
            } else {
                // Try to find status in class names
                String classes = element.className();
                if (classes.contains("pass")) {
                    result.setStatus("PASS");
                } else if (classes.contains("fail")) {
                    result.setStatus("FAIL");
                } else if (classes.contains("skip")) {
                    result.setStatus("SKIP");
                }
            }

            // Extract duration if available
            Element durationElement = element.selectFirst(".duration, .time, [class*='duration']");
            if (durationElement != null) {
                String durationText = durationElement.text();
                result.setDurationMs(parseDuration(durationText));
            }

            // Extract class name if available
            Element classElement = element.selectFirst(".class-name, [class*='class']");
            if (classElement != null) {
                result.setClassName(classElement.text());
            }

            return result.getTestName() != null ? result : null;
        } catch (Exception e) {
            logger.debug("Error parsing ExtentReports test element", e);
            return null;
        }
    }

    /**
     * Parses a TestNG table row.
     */
    private ExtentReportModel.TestResult parseTestNGRow(Elements cells) {
        try {
            if (cells.size() < 3) {
                return null;
            }

            ExtentReportModel.TestResult result = new ExtentReportModel.TestResult();
            
            // TestNG typically has: Method | Class | Duration | Status
            result.setTestName(cells.get(0).text());
            if (cells.size() > 1) {
                result.setClassName(cells.get(1).text());
            }
            if (cells.size() > 2) {
                String statusText = cells.get(2).text().toUpperCase();
                result.setStatus(mapStatusFromText(statusText));
            }
            if (cells.size() > 3) {
                String durationText = cells.get(3).text();
                result.setDurationMs(parseDuration(durationText));
            }

            return result.getTestName() != null && !result.getTestName().isEmpty() ? result : null;
        } catch (Exception e) {
            logger.debug("Error parsing TestNG row", e);
            return null;
        }
    }

    /**
     * Parses a generic table row.
     */
    private ExtentReportModel.TestResult parseGenericTableRow(Elements cells) {
        try {
            if (cells.size() < 2) {
                return null;
            }

            ExtentReportModel.TestResult result = new ExtentReportModel.TestResult();
            
            // Try to identify columns by content
            for (int i = 0; i < cells.size(); i++) {
                String cellText = cells.get(i).text().trim();
                String lowerText = cellText.toLowerCase();
                
                if (lowerText.contains("test") && result.getTestName() == null) {
                    result.setTestName(cellText);
                } else if ((lowerText.contains("pass") || lowerText.contains("fail") || 
                           lowerText.contains("skip")) && result.getStatus() == null) {
                    result.setStatus(mapStatusFromText(cellText));
                } else if ((lowerText.contains("ms") || lowerText.contains("sec") || 
                           lowerText.contains("min")) && result.getDurationMs() == null) {
                    result.setDurationMs(parseDuration(cellText));
                } else if (lowerText.contains("class") && result.getClassName() == null) {
                    result.setClassName(cellText);
                }
            }

            return result.getTestName() != null ? result : null;
        } catch (Exception e) {
            logger.debug("Error parsing generic table row", e);
            return null;
        }
    }

    /**
     * Maps status text to standard status format.
     */
    private String mapStatusFromText(String statusText) {
        if (statusText == null) {
            return "SKIP";
        }
        
        String upper = statusText.toUpperCase().trim();
        if (upper.contains("PASS") || upper.contains("SUCCESS")) {
            return "PASS";
        } else if (upper.contains("FAIL") || upper.contains("ERROR")) {
            return "FAIL";
        } else if (upper.contains("SKIP") || upper.contains("IGNORE")) {
            return "SKIP";
        }
        return "SKIP";
    }

    /**
     * Parses duration string to milliseconds.
     */
    private Long parseDuration(String durationText) {
        if (durationText == null || durationText.trim().isEmpty()) {
            return null;
        }

        try {
            // Remove non-numeric characters except decimal point
            String cleaned = durationText.replaceAll("[^0-9.]", "");
            if (cleaned.isEmpty()) {
                return null;
            }

            double value = Double.parseDouble(cleaned);
            
            // Determine unit
            String lower = durationText.toLowerCase();
            if (lower.contains("ms") || lower.contains("millisecond")) {
                return (long) value;
            } else if (lower.contains("sec") || lower.contains("second")) {
                return (long) (value * 1000);
            } else if (lower.contains("min") || lower.contains("minute")) {
                return (long) (value * 60 * 1000);
            } else if (lower.contains("hour")) {
                return (long) (value * 60 * 60 * 1000);
            } else {
                // Default to seconds if no unit specified
                return (long) (value * 1000);
            }
        } catch (Exception e) {
            logger.debug("Error parsing duration: " + durationText, e);
            return null;
        }
    }

    /**
     * Builds summary from test results.
     */
    private ExtentReportModel.ReportSummary buildSummaryFromResults(List<ExtentReportModel.TestResult> results) {
        ExtentReportModel.ReportSummary summary = new ExtentReportModel.ReportSummary();
        summary.setTotalTests(results.size());
        
        int passed = 0, failed = 0, skipped = 0;
        long totalDuration = 0;
        
        for (ExtentReportModel.TestResult result : results) {
            String status = result.getStatus();
            if (status != null) {
                if (status.toUpperCase().contains("PASS")) {
                    passed++;
                } else if (status.toUpperCase().contains("FAIL")) {
                    failed++;
                } else {
                    skipped++;
                }
            }
            
            if (result.getDurationMs() != null) {
                totalDuration += result.getDurationMs();
            }
        }
        
        summary.setPassed(passed);
        summary.setFailed(failed);
        summary.setSkipped(skipped);
        summary.setTotalDurationMs(totalDuration);
        summary.setStartTime(TimeUtils.getCurrentTimestamp());
        summary.setEndTime(TimeUtils.getCurrentTimestamp());
        
        return summary;
    }

    /**
     * Syncs the parsed report to EZTest.
     */
    private String syncReportToEZTest(ExtentReportModel report) {
        return syncReportToEZTestInternal(report);
    }

    /**
     * Internal method to sync report (duplicated from EZTestReportImporter for reuse).
     */
    private String syncReportToEZTestInternal(ExtentReportModel report) {
        if (report == null || report.getResults() == null || report.getResults().isEmpty()) {
            logger.warn("Report is empty or has no results");
            return null;
        }

        try {
            // Create or map test cases
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

            // Create test run
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

            // Start test run
            client.startTestRun(testRunId);

            // Record test results
            for (ExtentReportModel.TestResult result : report.getResults()) {
                String testCaseId = createOrMapTestCase(result, report);
                if (testCaseId == null) {
                    continue;
                }

                RecordTestResultRequest resultRequest = buildResultRequest(result, testCaseId);
                client.recordTestResult(testRunId, resultRequest);
            }

            // Complete test run
            client.completeTestRun(testRunId);

            logger.info("Successfully imported HTML report to EZTest. Test run ID: {}", testRunId);
            return testRunId;

        } catch (Exception e) {
            logger.error("Error syncing report to EZTest", e);
            return null;
        }
    }

    // Helper methods (similar to EZTestReportImporter)
    private String createOrMapTestCase(ExtentReportModel.TestResult result, ExtentReportModel report) {
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
        
        CreateTestCaseRequest request = new CreateTestCaseRequest(testCaseTitle);
        
        StringBuilder description = new StringBuilder();
        if (result.getClassName() != null) {
            description.append("Class: ").append(result.getClassName()).append("\n");
        }
        if (result.getTags() != null && !result.getTags().isEmpty()) {
            description.append("Tags: ").append(String.join(", ", result.getTags())).append("\n");
        }
        if (description.length() > 0) {
            request.setDescription(description.toString().trim());
        }

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

    private String buildTestRunName(ExtentReportModel report) {
        StringBuilder name = new StringBuilder();
        if (report.getReportMeta() != null) {
            if (report.getReportMeta().getProjectName() != null) {
                name.append(report.getReportMeta().getProjectName());
            }
        }
        if (name.length() == 0) {
            name.append("HTML Test Report Import");
        }
        return name.toString();
    }

    private String buildTestRunDescription(ExtentReportModel report) {
        StringBuilder desc = new StringBuilder();
        desc.append("Test execution imported from HTML report");
        if (report.getReportMeta() != null && report.getReportMeta().getReportSource() != null) {
            desc.append(" (").append(report.getReportMeta().getReportSource()).append(")");
        }
        return desc.toString();
    }

    private String buildEnvironmentString(ExtentReportModel report) {
        return "AUTOMATION";
    }

    private RecordTestResultRequest buildResultRequest(ExtentReportModel.TestResult result, String testCaseId) {
        TestResultStatus status = mapStatus(result.getStatus());
        RecordTestResultRequest request = new RecordTestResultRequest(testCaseId, status);
        
        if (result.getDurationMs() != null) {
            request.setDuration(TimeUtils.millisecondsToSeconds(result.getDurationMs()));
        }
        
        if (result.getTags() != null && !result.getTags().isEmpty()) {
            request.setComment("Tags: " + String.join(", ", result.getTags()));
        }
        
        if (status == TestResultStatus.FAILED) {
            request.setErrorMessage(result.getErrorMessage());
            request.setStackTrace(result.getStackTrace());
        }
        
        return request;
    }

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
                return TestResultStatus.SKIPPED;
        }
    }
}

