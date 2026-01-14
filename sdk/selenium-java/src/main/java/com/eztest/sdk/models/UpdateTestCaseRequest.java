package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request DTO for updating a test case in EZTest.
 * 
 * SDK Boundary: Data transfer object for API communication.
 * This class is used to serialize requests to the EZTest REST API.
 * No dependencies on EZTest backend code or database.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateTestCaseRequest {
    
    @JsonProperty("title")
    private String title;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("priority")
    private String priority;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("estimatedTime")
    private Integer estimatedTime;
    
    @JsonProperty("preconditions")
    private String preconditions;
    
    @JsonProperty("postconditions")
    private String postconditions;
    
    @JsonProperty("expectedResult")
    private String expectedResult;
    
    @JsonProperty("testData")
    private String testData;
    
    @JsonProperty("moduleId")
    private String moduleId;
    
    @JsonProperty("suiteId")
    private String suiteId;

    public UpdateTestCaseRequest() {
        // Default constructor for Jackson
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

    public Integer getEstimatedTime() {
        return estimatedTime;
    }

    public void setEstimatedTime(Integer estimatedTime) {
        this.estimatedTime = estimatedTime;
    }

    public String getPreconditions() {
        return preconditions;
    }

    public void setPreconditions(String preconditions) {
        this.preconditions = preconditions;
    }

    public String getPostconditions() {
        return postconditions;
    }

    public void setPostconditions(String postconditions) {
        this.postconditions = postconditions;
    }

    public String getExpectedResult() {
        return expectedResult;
    }

    public void setExpectedResult(String expectedResult) {
        this.expectedResult = expectedResult;
    }

    public String getTestData() {
        return testData;
    }

    public void setTestData(String testData) {
        this.testData = testData;
    }

    public String getModuleId() {
        return moduleId;
    }

    public void setModuleId(String moduleId) {
        this.moduleId = moduleId;
    }

    public String getSuiteId() {
        return suiteId;
    }

    public void setSuiteId(String suiteId) {
        this.suiteId = suiteId;
    }
}

