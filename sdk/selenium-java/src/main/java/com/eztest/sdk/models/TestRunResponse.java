package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response DTO for test run data from EZTest API.
 * 
 * SDK Boundary: Response DTO for API communication.
 * Deserializes test run data from EZTest REST API responses.
 * No dependencies on EZTest backend code or database.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestRunResponse {
    
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("environment")
    private String environment;
    
    @JsonProperty("startedAt")
    private String startedAt;
    
    @JsonProperty("completedAt")
    private String completedAt;

    public TestRunResponse() {
        // Default constructor for Jackson
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(String startedAt) {
        this.startedAt = startedAt;
    }

    public String getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(String completedAt) {
        this.completedAt = completedAt;
    }
}

