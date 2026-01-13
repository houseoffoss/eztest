package com.eztest.sdk.core;

import com.eztest.sdk.models.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.util.Timeout;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Client for communicating with EZTest REST API.
 * 
 * SDK Boundary: This is the ONLY class that communicates with EZTest backend.
 * It uses HTTPS REST APIs exclusively - NO database access, NO imports from
 * EZTest backend/frontend code. All communication is via HTTP requests.
 * 
 * This client is designed to fail safely - API errors do not interrupt test execution.
 * All API calls are non-blocking and handle failures gracefully.
 */
public class EZTestClient {
    
    private static final Logger logger = LoggerFactory.getLogger(EZTestClient.class);
    
    private final EZTestConfig config;
    private final CloseableHttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    /**
     * Gets the configuration used by this client.
     * 
     * @return EZTest configuration
     */
    public EZTestConfig getConfig() {
        return config;
    }
    
    /**
     * Creates a new EZTest client.
     * 
     * @param config EZTest configuration (must not be null)
     */
    public EZTestClient(EZTestConfig config) {
        if (config == null) {
            throw new IllegalArgumentException("Config cannot be null");
        }
        this.config = config;
        
        // Configure HTTP client with timeouts
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(Timeout.of(config.getConnectTimeoutMs(), TimeUnit.MILLISECONDS))
                .setResponseTimeout(Timeout.of(config.getReadTimeoutMs(), TimeUnit.MILLISECONDS))
                .build();
        
        this.httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .build();
        
        // Configure JSON mapper
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Gets a test case by ID.
     * 
     * @param testCaseId Test case ID
     * @return Test case response if found, null otherwise
     */
    public TestCaseResponse getTestCaseById(String testCaseId) {
        try {
            String url = config.getApiBaseUrl() + "/testcases/" + testCaseId;
            HttpGet httpGet = new HttpGet(url);
            httpGet.setHeader("Authorization", "Bearer " + config.getApiKey());
            
            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
                HttpEntity entity = response.getEntity();
                String responseBody = EntityUtils.toString(entity, StandardCharsets.UTF_8);
                
                if (response.getCode() >= 200 && response.getCode() < 300) {
                    ApiResponse<TestCaseResponse> apiResponse = objectMapper.readValue(
                            responseBody,
                            new TypeReference<ApiResponse<TestCaseResponse>>() {}
                    );
                    
                    if (apiResponse.getData() != null) {
                        logger.debug("Test case found: {}", testCaseId);
                        return apiResponse.getData();
                    }
                } else if (response.getCode() == 404) {
                    logger.debug("Test case not found: {}", testCaseId);
                    return null;
                } else {
                    logger.warn("Failed to get test case. Status: {}, Response: {}", response.getCode(), responseBody);
                }
            }
        } catch (Exception e) {
            logger.error("Error getting test case by ID: {}", testCaseId, e);
        }
        return null;
    }

    /**
     * Searches for test cases by title/name.
     * 
     * @param searchTerm Search term (title or description)
     * @return List of matching test cases, empty list if none found or error
     */
    public List<TestCaseResponse> searchTestCases(String searchTerm) {
        try {
            String url = config.getApiBaseUrl() + "/projects/" + config.getProjectId() + "/testcases?search=" 
                    + java.net.URLEncoder.encode(searchTerm, StandardCharsets.UTF_8.toString()) + "&limit=100";
            HttpGet httpGet = new HttpGet(url);
            httpGet.setHeader("Authorization", "Bearer " + config.getApiKey());
            
            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
                HttpEntity entity = response.getEntity();
                String responseBody = EntityUtils.toString(entity, StandardCharsets.UTF_8);
                
                if (response.getCode() >= 200 && response.getCode() < 300) {
                    ApiResponse<List<TestCaseResponse>> apiResponse = objectMapper.readValue(
                            responseBody,
                            new TypeReference<ApiResponse<List<TestCaseResponse>>>() {}
                    );
                    
                    if (apiResponse.getData() != null) {
                        logger.debug("Found {} test cases matching: {}", apiResponse.getData().size(), searchTerm);
                        return apiResponse.getData();
                    }
                } else {
                    logger.warn("Failed to search test cases. Status: {}, Response: {}", response.getCode(), responseBody);
                }
            }
        } catch (Exception e) {
            logger.error("Error searching test cases", e);
        }
        return new java.util.ArrayList<>();
    }

    /**
     * Finds an existing test case by ID or by title/name.
     * First tries to get by ID if provided, then searches by title if not found.
     * 
     * @param testCaseId Optional test case ID to search by
     * @param title Test case title to search by
     * @return Test case ID if found, null otherwise
     */
    public String findOrCreateTestCase(String testCaseId, String title) {
        // First, try to get by ID if provided
        if (testCaseId != null && !testCaseId.trim().isEmpty()) {
            TestCaseResponse existing = getTestCaseById(testCaseId.trim());
            if (existing != null && existing.getId() != null) {
                logger.debug("Found existing test case by ID: {}", testCaseId);
                return existing.getId();
            }
        }
        
        // If not found by ID or ID not provided, search by title
        if (title != null && !title.trim().isEmpty()) {
            List<TestCaseResponse> matches = searchTestCases(title.trim());
            // Find exact match by title (case-insensitive)
            for (TestCaseResponse tc : matches) {
                if (tc.getTitle() != null && tc.getTitle().equalsIgnoreCase(title.trim())) {
                    logger.debug("Found existing test case by title: {} -> {}", title, tc.getId());
                    return tc.getId();
                }
            }
        }
        
        return null;
    }

    /**
     * Creates or registers a test case in EZTest.
     * 
     * @param request Test case creation request
     * @return Test case ID if successful, null if failed (logs error)
     */
    public String createTestCase(CreateTestCaseRequest request) {
        try {
            String url = config.getApiBaseUrl() + "/projects/" + config.getProjectId() + "/testcases";
            HttpPost httpPost = new HttpPost(url);
            httpPost.setHeader("Authorization", "Bearer " + config.getApiKey());
            httpPost.setHeader("Content-Type", ContentType.APPLICATION_JSON.getMimeType());
            
            String jsonBody = objectMapper.writeValueAsString(request);
            httpPost.setEntity(new StringEntity(jsonBody, StandardCharsets.UTF_8));
            
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                HttpEntity entity = response.getEntity();
                String responseBody = EntityUtils.toString(entity, StandardCharsets.UTF_8);
                
                if (response.getCode() >= 200 && response.getCode() < 300) {
                    ApiResponse<TestCaseResponse> apiResponse = objectMapper.readValue(
                            responseBody,
                            new TypeReference<ApiResponse<TestCaseResponse>>() {}
                    );
                    
                    if (apiResponse.getData() != null && apiResponse.getData().getId() != null) {
                        logger.debug("Test case created successfully: {}", apiResponse.getData().getId());
                        return apiResponse.getData().getId();
                    }
                } else {
                    logger.warn("Failed to create test case. Status: {}, Response: {}", response.getCode(), responseBody);
                }
            }
        } catch (Exception e) {
            logger.error("Error creating test case in EZTest", e);
        }
        return null;
    }

    /**
     * Creates a test run in EZTest.
     * 
     * @param request Test run creation request
     * @return Test run ID if successful, null if failed (logs error)
     */
    public String createTestRun(CreateTestRunRequest request) {
        try {
            String url = config.getApiBaseUrl() + "/projects/" + config.getProjectId() + "/testruns";
            HttpPost httpPost = new HttpPost(url);
            httpPost.setHeader("Authorization", "Bearer " + config.getApiKey());
            httpPost.setHeader("Content-Type", ContentType.APPLICATION_JSON.getMimeType());
            
            String jsonBody = objectMapper.writeValueAsString(request);
            httpPost.setEntity(new StringEntity(jsonBody, StandardCharsets.UTF_8));
            
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                HttpEntity entity = response.getEntity();
                String responseBody = EntityUtils.toString(entity, StandardCharsets.UTF_8);
                
                if (response.getCode() >= 200 && response.getCode() < 300) {
                    ApiResponse<TestRunResponse> apiResponse = objectMapper.readValue(
                            responseBody,
                            new TypeReference<ApiResponse<TestRunResponse>>() {}
                    );
                    
                    if (apiResponse.getData() != null && apiResponse.getData().getId() != null) {
                        logger.debug("Test run created successfully: {}", apiResponse.getData().getId());
                        return apiResponse.getData().getId();
                    }
                } else {
                    logger.warn("Failed to create test run. Status: {}, Response: {}", response.getCode(), responseBody);
                }
            }
        } catch (Exception e) {
            logger.error("Error creating test run in EZTest", e);
        }
        return null;
    }

    /**
     * Starts a test run execution.
     * 
     * @param testRunId Test run ID
     * @return true if successful, false otherwise (logs error)
     */
    public boolean startTestRun(String testRunId) {
        try {
            String url = config.getApiBaseUrl() + "/testruns/" + testRunId + "/start";
            HttpPost httpPost = new HttpPost(url);
            httpPost.setHeader("Authorization", "Bearer " + config.getApiKey());
            
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                if (response.getCode() >= 200 && response.getCode() < 300) {
                    logger.debug("Test run started successfully: {}", testRunId);
                    return true;
                } else {
                    String responseBody = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                    logger.warn("Failed to start test run. Status: {}, Response: {}", response.getCode(), responseBody);
                }
            }
        } catch (Exception e) {
            logger.error("Error starting test run in EZTest", e);
        }
        return false;
    }

    /**
     * Records a test result for a test case in a test run.
     * 
     * @param testRunId Test run ID
     * @param request Test result request
     * @return true if successful, false otherwise (logs error)
     */
    public boolean recordTestResult(String testRunId, RecordTestResultRequest request) {
        try {
            String url = config.getApiBaseUrl() + "/testruns/" + testRunId + "/results";
            HttpPost httpPost = new HttpPost(url);
            httpPost.setHeader("Authorization", "Bearer " + config.getApiKey());
            httpPost.setHeader("Content-Type", ContentType.APPLICATION_JSON.getMimeType());
            
            String jsonBody = objectMapper.writeValueAsString(request);
            httpPost.setEntity(new StringEntity(jsonBody, StandardCharsets.UTF_8));
            
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                if (response.getCode() >= 200 && response.getCode() < 300) {
                    logger.debug("Test result recorded successfully for test case: {}", request.getTestCaseId());
                    return true;
                } else {
                    String responseBody = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                    logger.warn("Failed to record test result. Status: {}, Response: {}", response.getCode(), responseBody);
                }
            }
        } catch (Exception e) {
            logger.error("Error recording test result in EZTest", e);
        }
        return false;
    }

    /**
     * Completes a test run execution.
     * 
     * @param testRunId Test run ID
     * @return true if successful, false otherwise (logs error)
     */
    public boolean completeTestRun(String testRunId) {
        try {
            String url = config.getApiBaseUrl() + "/testruns/" + testRunId + "/complete";
            HttpPost httpPost = new HttpPost(url);
            httpPost.setHeader("Authorization", "Bearer " + config.getApiKey());
            
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                if (response.getCode() >= 200 && response.getCode() < 300) {
                    logger.debug("Test run completed successfully: {}", testRunId);
                    return true;
                } else {
                    String responseBody = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                    logger.warn("Failed to complete test run. Status: {}, Response: {}", response.getCode(), responseBody);
                }
            }
        } catch (Exception e) {
            logger.error("Error completing test run in EZTest", e);
        }
        return false;
    }

    /**
     * Closes the HTTP client and releases resources.
     * Should be called when the client is no longer needed.
     */
    public void close() {
        try {
            httpClient.close();
        } catch (IOException e) {
            logger.warn("Error closing HTTP client", e);
        }
    }
}

