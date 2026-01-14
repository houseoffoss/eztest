package com.eztest.sdk.core;

import java.util.Objects;

/**
 * Configuration for EZTest SDK.
 * 
 * This class holds the API configuration required to communicate with EZTest backend.
 * All configuration values are required and validated upon construction.
 * 
 * SDK Boundary: This class is purely for configuration. It does not interact with
 * the database or any EZTest backend code directly. It only stores configuration
 * values that will be used by EZTestClient for REST API calls.
 */
public class EZTestConfig {
    
    /**
     * EZTest server base URL (e.g., "https://eztest.example.com" or "http://localhost:3000").
     * Must not include trailing slash.
     */
    private final String serverUrl;
    
    /**
     * API key for authentication.
     * This key is used in the Authorization header for all REST API requests.
     */
    private final String apiKey;
    
    /**
     * Project ID in EZTest system.
     * All test cases and test runs will be associated with this project.
     */
    private final String projectId;
    
    /**
     * Connection timeout in milliseconds (default: 30000 = 30 seconds).
     */
    private final int connectTimeoutMs;
    
    /**
     * Read timeout in milliseconds (default: 60000 = 60 seconds).
     */
    private final int readTimeoutMs;

    /**
     * Creates a new EZTest configuration.
     * 
     * @param serverUrl EZTest server base URL (must not be null or empty)
     * @param apiKey API key for authentication (must not be null or empty)
     * @param projectId Project ID (must not be null or empty)
     * @throws IllegalArgumentException if any required parameter is null or empty
     */
    public EZTestConfig(String serverUrl, String apiKey, String projectId) {
        this(serverUrl, apiKey, projectId, 30000, 60000);
    }

    /**
     * Creates a new EZTest configuration with custom timeouts.
     * 
     * @param serverUrl EZTest server base URL (must not be null or empty)
     * @param apiKey API key for authentication (must not be null or empty)
     * @param projectId Project ID (must not be null or empty)
     * @param connectTimeoutMs Connection timeout in milliseconds (must be > 0)
     * @param readTimeoutMs Read timeout in milliseconds (must be > 0)
     * @throws IllegalArgumentException if any required parameter is invalid
     */
    public EZTestConfig(String serverUrl, String apiKey, String projectId, 
                        int connectTimeoutMs, int readTimeoutMs) {
        if (serverUrl == null || serverUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Server URL cannot be null or empty");
        }
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key cannot be null or empty");
        }
        if (projectId == null || projectId.trim().isEmpty()) {
            throw new IllegalArgumentException("Project ID cannot be null or empty");
        }
        if (connectTimeoutMs <= 0) {
            throw new IllegalArgumentException("Connection timeout must be greater than 0");
        }
        if (readTimeoutMs <= 0) {
            throw new IllegalArgumentException("Read timeout must be greater than 0");
        }
        
        // Normalize server URL (remove trailing slash)
        this.serverUrl = serverUrl.trim().replaceAll("/+$", "");
        this.apiKey = apiKey.trim();
        this.projectId = projectId.trim();
        this.connectTimeoutMs = connectTimeoutMs;
        this.readTimeoutMs = readTimeoutMs;
    }

    public String getServerUrl() {
        return serverUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getProjectId() {
        return projectId;
    }

    public int getConnectTimeoutMs() {
        return connectTimeoutMs;
    }

    public int getReadTimeoutMs() {
        return readTimeoutMs;
    }

    /**
     * Gets the base API URL (serverUrl + "/api").
     * 
     * @return Base API URL
     */
    public String getApiBaseUrl() {
        return serverUrl + "/api";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EZTestConfig that = (EZTestConfig) o;
        return connectTimeoutMs == that.connectTimeoutMs &&
               readTimeoutMs == that.readTimeoutMs &&
               Objects.equals(serverUrl, that.serverUrl) &&
               Objects.equals(apiKey, that.apiKey) &&
               Objects.equals(projectId, that.projectId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(serverUrl, apiKey, projectId, connectTimeoutMs, readTimeoutMs);
    }

    @Override
    public String toString() {
        return "EZTestConfig{" +
               "serverUrl='" + serverUrl + '\'' +
               ", projectId='" + projectId + '\'' +
               ", connectTimeoutMs=" + connectTimeoutMs +
               ", readTimeoutMs=" + readTimeoutMs +
               '}';
    }
}

