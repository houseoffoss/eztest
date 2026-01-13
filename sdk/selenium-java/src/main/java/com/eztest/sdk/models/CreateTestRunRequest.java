package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Request DTO for creating a test run in EZTest.
 * 
 * SDK Boundary: Data transfer object for API communication.
 * This class is used to serialize requests to the EZTest REST API.
 * No dependencies on EZTest backend code or database.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateTestRunRequest {
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("environment")
    private String environment;
    
    @JsonProperty("testCaseIds")
    private List<String> testCaseIds;

    public CreateTestRunRequest() {
        // Default constructor for Jackson
    }

    public CreateTestRunRequest(String name, List<String> testCaseIds) {
        this.name = name;
        this.testCaseIds = testCaseIds;
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

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public List<String> getTestCaseIds() {
        return testCaseIds;
    }

    public void setTestCaseIds(List<String> testCaseIds) {
        this.testCaseIds = testCaseIds;
    }
}

