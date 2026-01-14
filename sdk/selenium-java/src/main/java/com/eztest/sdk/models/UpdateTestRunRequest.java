package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request DTO for updating a test run in EZTest.
 * 
 * SDK Boundary: Data transfer object for API communication.
 * This class is used to serialize requests to the EZTest REST API.
 * No dependencies on EZTest backend code or database.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateTestRunRequest {
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("assignedToId")
    private String assignedToId;
    
    @JsonProperty("environment")
    private String environment;

    public UpdateTestRunRequest() {
        // Default constructor for Jackson
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(String assignedToId) {
        this.assignedToId = assignedToId;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }
}

