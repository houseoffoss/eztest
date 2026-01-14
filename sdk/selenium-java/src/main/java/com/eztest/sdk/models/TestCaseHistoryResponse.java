package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

/**
 * Response DTO for test case history (execution history) from EZTest API.
 * 
 * SDK Boundary: Response DTO for API communication.
 * Deserializes test case history data from EZTest REST API responses.
 * No dependencies on EZTest backend code or database.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestCaseHistoryResponse {
    
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("testCaseId")
    private String testCaseId;
    
    @JsonProperty("testRunId")
    private String testRunId;
    
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
    
    @JsonProperty("executedAt")
    private Instant executedAt;
    
    @JsonProperty("executedBy")
    private ExecutedByInfo executedBy;
    
    @JsonProperty("testRun")
    private TestRunInfo testRun;

    public TestCaseHistoryResponse() {
        // Default constructor for Jackson
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(String testCaseId) {
        this.testCaseId = testCaseId;
    }

    public String getTestRunId() {
        return testRunId;
    }

    public void setTestRunId(String testRunId) {
        this.testRunId = testRunId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public Instant getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Instant executedAt) {
        this.executedAt = executedAt;
    }

    public ExecutedByInfo getExecutedBy() {
        return executedBy;
    }

    public void setExecutedBy(ExecutedByInfo executedBy) {
        this.executedBy = executedBy;
    }

    public TestRunInfo getTestRun() {
        return testRun;
    }

    public void setTestRun(TestRunInfo testRun) {
        this.testRun = testRun;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExecutedByInfo {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("email")
        private String email;

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

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TestRunInfo {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("environment")
        private String environment;
        
        @JsonProperty("status")
        private String status;

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

        public String getEnvironment() {
            return environment;
        }

        public void setEnvironment(String environment) {
            this.environment = environment;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}

