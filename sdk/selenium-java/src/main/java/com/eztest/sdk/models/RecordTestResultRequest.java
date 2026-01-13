package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request DTO for recording a test result in EZTest.
 * 
 * SDK Boundary: Data transfer object for API communication.
 * This class is used to serialize requests to the EZTest REST API.
 * No dependencies on EZTest backend code or database.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecordTestResultRequest {
    
    @JsonProperty("testCaseId")
    private String testCaseId;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("duration")
    private Long duration;
    
    @JsonProperty("comment")
    private String comment;
    
    @JsonProperty("errorMessage")
    private String errorMessage;
    
    @JsonProperty("stackTrace")
    private String stackTrace;

    public RecordTestResultRequest() {
        // Default constructor for Jackson
    }

    public RecordTestResultRequest(String testCaseId, TestResultStatus status) {
        this.testCaseId = testCaseId;
        this.status = status.name();
    }

    public String getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(String testCaseId) {
        this.testCaseId = testCaseId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setStatus(TestResultStatus status) {
        this.status = status != null ? status.name() : null;
    }

    public Long getDuration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getStackTrace() {
        return stackTrace;
    }

    public void setStackTrace(String stackTrace) {
        this.stackTrace = stackTrace;
    }
}

