package com.eztest.sdk.listeners;

import com.eztest.sdk.annotations.EZTestCase;
import com.eztest.sdk.annotations.EZTestProject;
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.models.*;
import com.eztest.sdk.utils.TimeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.lang.reflect.Method;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * TestNG listener that automatically syncs test execution with EZTest.
 * 
 * SDK Boundary: This listener integrates with TestNG test execution lifecycle.
 * It uses EZTestClient (which only communicates via REST APIs) to sync test results.
 * NO database access, NO dependencies on EZTest backend code.
 * 
 * The listener:
 * - Creates a test run when a test suite starts
 * - Registers/maps test cases based on @EZTestCase annotations
 * - Records test results (pass/fail/skip) for each test execution
 * - Completes the test run when the suite finishes
 * 
 * Usage: Add this listener to your testng.xml or via @Listeners annotation.
 */
public class EZTestTestNGListener implements ITestListener {
    
    private static final Logger logger = LoggerFactory.getLogger(EZTestTestNGListener.class);
    
    private EZTestClient defaultClient;
    private final Map<String, EZTestClient> projectClients = new ConcurrentHashMap<>(); // Maps project ID -> client
    private final Map<String, String> testRunIdMap = new ConcurrentHashMap<>(); // Maps project ID -> test run ID
    private String currentTestRunId;
    private String currentProjectId;
    private final Map<String, String> testCaseIdMap = new ConcurrentHashMap<>(); // Maps test method name -> EZTest test case ID
    private final Map<String, Long> testStartTimes = new ConcurrentHashMap<>(); // Maps test method name -> start time (ms)
    private final Set<String> processedTests = ConcurrentHashMap.newKeySet(); // Track which tests we've processed
    
    /**
     * Initialize the listener with EZTest configuration.
     * This method must be called before test execution starts.
     * 
     * Configuration can be provided via:
     * - System properties: eztest.server.url, eztest.api.key, eztest.project.id
     * - Environment variables: EZTEST_SERVER_URL, EZTEST_API_KEY, EZTEST_PROJECT_ID
     * 
     * @param config EZTest configuration (can be null to use system properties/env vars)
     */
    public void initialize(EZTestConfig config) {
        if (config != null) {
            this.defaultClient = new EZTestClient(config);
            this.currentProjectId = config.getProjectId();
            // Cache the default client for the default project
            this.projectClients.put(config.getProjectId(), this.defaultClient);
        } else {
            // Try to load from system properties or environment variables
            String serverUrl = getConfigValue("eztest.server.url", "EZTEST_SERVER_URL");
            String apiKey = getConfigValue("eztest.api.key", "EZTEST_API_KEY");
            String projectId = getConfigValue("eztest.project.id", "EZTEST_PROJECT_ID");
            
            if (serverUrl != null && apiKey != null && projectId != null) {
                EZTestConfig defaultConfig = new EZTestConfig(serverUrl, apiKey, projectId);
                this.defaultClient = new EZTestClient(defaultConfig);
                this.currentProjectId = projectId;
                this.projectClients.put(projectId, this.defaultClient);
            } else {
                logger.warn("EZTest configuration not found. SDK will not sync with EZTest.");
                logger.warn("Please provide configuration via EZTestConfig or system properties/environment variables.");
            }
        }
    }
    
    /**
     * Gets or creates a client for the specified project.
     * If project-specific configuration is provided via @EZTestProject annotation,
     * creates a new client for that project. Otherwise, uses the default client.
     */
    private EZTestClient getClientForProject(String projectId, String serverUrl, String apiKey) {
        if (projectId == null || projectId.trim().isEmpty()) {
            return defaultClient;
        }
        
        // If same as current project, return existing client
        if (projectId.equals(currentProjectId) && defaultClient != null) {
            return defaultClient;
        }
        
        // Check if we already have a client for this project
        EZTestClient cachedClient = projectClients.get(projectId);
        if (cachedClient != null) {
            return cachedClient;
        }
        
        // Create new client for this project
        String effectiveServerUrl = serverUrl != null && !serverUrl.trim().isEmpty() 
                ? serverUrl.trim() 
                : (defaultClient != null ? defaultClient.getConfig().getServerUrl() : null);
        String effectiveApiKey = apiKey != null && !apiKey.trim().isEmpty() 
                ? apiKey.trim() 
                : (defaultClient != null ? defaultClient.getConfig().getApiKey() : null);
        
        if (effectiveServerUrl == null || effectiveApiKey == null) {
            logger.warn("Cannot create client for project {}: missing server URL or API key", projectId);
            return defaultClient;
        }
        
        EZTestConfig projectConfig = new EZTestConfig(effectiveServerUrl, effectiveApiKey, projectId);
        EZTestClient projectClient = new EZTestClient(projectConfig);
        projectClients.put(projectId, projectClient);
        logger.debug("Created client for project: {}", projectId);
        
        return projectClient;
    }
    
    private String getConfigValue(String systemProperty, String envVar) {
        String value = System.getProperty(systemProperty);
        if (value == null || value.trim().isEmpty()) {
            value = System.getenv(envVar);
        }
        return value;
    }

    @Override
    public void onStart(ITestContext context) {
        if (defaultClient == null) {
            initialize(null);
        }
        
        if (defaultClient == null) {
            logger.warn("EZTest client not initialized. Skipping test run creation.");
            return;
        }
        
        // Determine project ID from context or use default
        String projectId = currentProjectId;
        
        // Check if any test class has @EZTestProject annotation
        try {
            org.testng.ITestNGMethod[] allMethods = context.getAllTestMethods();
            if (allMethods.length > 0) {
                Class<?> testClass = allMethods[0].getTestClass().getRealClass();
                EZTestProject projectAnnotation = testClass.getAnnotation(EZTestProject.class);
                if (projectAnnotation != null && !projectAnnotation.projectId().trim().isEmpty()) {
                    projectId = projectAnnotation.projectId().trim();
                    // Get or create client for this project
                    EZTestClient projectClient = getClientForProject(
                        projectId,
                        projectAnnotation.serverUrl(),
                        projectAnnotation.apiKey()
                    );
                    if (projectClient != null) {
                        currentProjectId = projectId;
                    }
                }
            }
        } catch (Exception e) {
            logger.debug("Could not determine project from test classes, using default", e);
        }
        
        EZTestClient client = getClientForProject(projectId, null, null);
        if (client == null) {
            logger.warn("No client available for project: {}. Skipping test run creation.", projectId);
            return;
        }
        
        try {
            // Create test run with name based on suite name and timestamp
            String runName = "Automated Test Run - " + context.getSuite().getName() + " - " + TimeUtils.getCurrentTimestamp();
            CreateTestRunRequest request = new CreateTestRunRequest();
            request.setName(runName);
            request.setDescription("Automated test execution via Selenium Java SDK");
            request.setEnvironment(System.getProperty("eztest.environment", System.getenv("EZTEST_ENVIRONMENT") != null ? System.getenv("EZTEST_ENVIRONMENT") : "AUTOMATION"));
            
            // Collect test case IDs (we'll populate this as tests run)
            request.setTestCaseIds(new ArrayList<>());
            
            currentTestRunId = client.createTestRun(request);
            testRunIdMap.put(projectId, currentTestRunId);
            
            if (currentTestRunId != null) {
                client.startTestRun(currentTestRunId);
                logger.info("EZTest test run created and started: {} for project: {}", currentTestRunId, projectId);
                context.setAttribute("eztest.run.id", currentTestRunId);
                context.setAttribute("eztest.project.id", projectId);
            }
        } catch (Exception e) {
            logger.error("Error creating EZTest test run", e);
        }
    }

    @Override
    public void onTestStart(ITestResult result) {
        // Determine project for this test
        String projectId = getProjectIdForTest(result);
        EZTestClient client = getClientForProject(projectId, null, null);
        String testRunId = testRunIdMap.get(projectId);
        
        if (client == null || testRunId == null) {
            return;
        }
        
        try {
            String testMethodName = getTestMethodName(result);
            testStartTimes.put(testMethodName, System.currentTimeMillis());
            
            // Get or create test case ID (using the correct client for this project)
            String testCaseId = getOrCreateTestCaseId(result, client);
            if (testCaseId != null) {
                testCaseIdMap.put(testMethodName, testCaseId);
            }
        } catch (Exception e) {
            logger.error("Error processing test start for: {}", result.getMethod().getMethodName(), e);
        }
    }
    
    /**
     * Gets the project ID for a test result.
     * Checks @EZTestProject annotation on class or method level.
     */
    private String getProjectIdForTest(ITestResult result) {
        Method method = result.getMethod().getConstructorOrMethod().getMethod();
        if (method == null) {
            return currentProjectId;
        }
        
        // Check method-level annotation first
        EZTestProject methodAnnotation = method.getAnnotation(EZTestProject.class);
        if (methodAnnotation != null && !methodAnnotation.projectId().trim().isEmpty()) {
            return methodAnnotation.projectId().trim();
        }
        
        // Check class-level annotation
        EZTestProject classAnnotation = method.getDeclaringClass().getAnnotation(EZTestProject.class);
        if (classAnnotation != null && !classAnnotation.projectId().trim().isEmpty()) {
            return classAnnotation.projectId().trim();
        }
        
        // Use default project
        return currentProjectId;
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        recordTestResult(result, TestResultStatus.PASSED, null);
    }

    @Override
    public void onTestFailure(ITestResult result) {
        String errorMessage = result.getThrowable() != null ? result.getThrowable().getMessage() : "Test failed";
        String stackTrace = getStackTrace(result.getThrowable());
        recordTestResult(result, TestResultStatus.FAILED, errorMessage, stackTrace);
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        recordTestResult(result, TestResultStatus.SKIPPED, "Test was skipped");
    }
    
    /**
     * Records a test result to EZTest, using the appropriate project/client.
     */
    private void recordTestResult(ITestResult result, TestResultStatus status, String errorMessage) {
        recordTestResult(result, status, errorMessage, null);
    }
    
    private void recordTestResult(ITestResult result, TestResultStatus status, String errorMessage, String stackTrace) {
        // Determine project for this test
        String projectId = getProjectIdForTest(result);
        EZTestClient client = getClientForProject(projectId, null, null);
        String testRunId = testRunIdMap.get(projectId);
        
        if (client == null || testRunId == null) {
            return;
        }
        
        try {
            String testMethodName = getTestMethodName(result);
            
            // Prevent duplicate reporting
            if (processedTests.contains(testMethodName)) {
                return;
            }
            processedTests.add(testMethodName);
            
            String testCaseId = testCaseIdMap.get(testMethodName);
            if (testCaseId == null) {
                testCaseId = getOrCreateTestCaseId(result, client);
                if (testCaseId == null) {
                    logger.warn("Could not determine test case ID for: {}", testMethodName);
                    return;
                }
                testCaseIdMap.put(testMethodName, testCaseId);
            }
            
            // Calculate duration
            Long startTime = testStartTimes.get(testMethodName);
            Long duration = null;
            if (startTime != null) {
                duration = TimeUtils.calculateDurationSeconds(startTime, System.currentTimeMillis());
            }
            
            // Create result request
            RecordTestResultRequest request = new RecordTestResultRequest(testCaseId, status);
            request.setDuration(duration);
            request.setComment("Automated test execution via Selenium Java SDK");
            request.setErrorMessage(errorMessage);
            request.setStackTrace(stackTrace);
            
            // Record result (non-blocking - failures are logged but don't interrupt test execution)
            client.recordTestResult(testRunId, request);
            
        } catch (Exception e) {
            logger.error("Error recording test result for: {}", result.getMethod().getMethodName(), e);
        }
    }

    @Override
    public void onFinish(ITestContext context) {
        // Complete all test runs for all projects
        for (Map.Entry<String, String> entry : testRunIdMap.entrySet()) {
            String projectId = entry.getKey();
            String testRunId = entry.getValue();
            EZTestClient client = projectClients.get(projectId);
            
            if (client != null && testRunId != null) {
                try {
                    client.completeTestRun(testRunId);
                    logger.info("EZTest test run completed: {} for project: {}", testRunId, projectId);
                } catch (Exception e) {
                    logger.error("Error completing EZTest test run for project: {}", projectId, e);
                }
            }
        }
        
        // Close all clients
        for (EZTestClient client : projectClients.values()) {
            if (client != null) {
                try {
                    client.close();
                } catch (Exception e) {
                    logger.warn("Error closing client", e);
                }
            }
        }
        
        // Clear all maps
        testCaseIdMap.clear();
        testStartTimes.clear();
        processedTests.clear();
        testRunIdMap.clear();
        projectClients.clear();
    }


    /**
     * Gets or creates a test case ID for the given test result.
     * First searches for existing test case by ID or title, then creates if not found.
     * Uses the provided client (which may be project-specific).
     */
    private String getOrCreateTestCaseId(ITestResult result, EZTestClient client) {
        if (client == null) {
            return null;
        }
        
        Method method = result.getMethod().getConstructorOrMethod().getMethod();
        if (method == null) {
            return null;
        }
        
        EZTestCase annotation = method.getAnnotation(EZTestCase.class);
        if (annotation == null) {
            // Check class-level annotation
            annotation = method.getDeclaringClass().getAnnotation(EZTestCase.class);
        }
        
        if (annotation != null) {
            String testCaseId = annotation.testCaseId();
            String title = annotation.title();
            if (title == null || title.trim().isEmpty()) {
                title = method.getName();
            }
            String description = annotation.description();
            String priority = annotation.priority();
            
            // Use findOrCreateTestCase which handles lookup and creation
            String existingId = client.findOrCreateTestCase(testCaseId, title);
            if (existingId != null) {
                return existingId;
            }
            
            // If not found, create new test case
            CreateTestCaseRequest createRequest = new CreateTestCaseRequest(title);
            createRequest.setDescription(description);
            createRequest.setPriority(priority);
            createRequest.setStatus("ACTIVE");
            return client.createTestCase(createRequest);
        }
        
        // No annotation - skip this test
        return null;
    }
    
    private String getTestMethodName(ITestResult result) {
        return result.getTestClass().getName() + "." + result.getMethod().getMethodName();
    }
    
    private String getStackTrace(Throwable throwable) {
        if (throwable == null) {
            return null;
        }
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        throwable.printStackTrace(pw);
        return sw.toString();
    }
}

