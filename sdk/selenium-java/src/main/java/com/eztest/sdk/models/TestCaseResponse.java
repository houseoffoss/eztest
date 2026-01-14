package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response DTO for test case data from EZTest API.
 * 
 * SDK Boundary: Response DTO for API communication.
 * Deserializes test case data from EZTest REST API responses.
 * No dependencies on EZTest backend code or database.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestCaseResponse {
    
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("tcId")
    private String tcId;
    
    @JsonProperty("title")
    private String title;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("priority")
    private String priority;
    
    @JsonProperty("status")
    private String status;

    public TestCaseResponse() {
        // Default constructor for Jackson
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTcId() {
        return tcId;
    }

    public void setTcId(String tcId) {
        this.tcId = tcId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

