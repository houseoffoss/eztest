package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Model for the minimal automation report JSON format.
 * 
 * This format is used by the automation-report API endpoint:
 * POST /api/projects/{id}/automation-report
 * 
 * SDK Boundary: Data transfer object for parsing automation report JSON.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AutomationReportModel {
    
    @JsonProperty("testRunName")
    private String testRunName;
    
    @JsonProperty("environment")
    private String environment;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("results")
    private List<AutomationResult> results;

    public String getTestRunName() {
        return testRunName;
    }

    public void setTestRunName(String testRunName) {
        this.testRunName = testRunName;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<AutomationResult> getResults() {
        return results;
    }

    public void setResults(List<AutomationResult> results) {
        this.results = results;
    }

    /**
     * Individual test result in the automation report.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AutomationResult {
        
        @JsonProperty("testCaseId")
        private String testCaseId;
        
        @JsonProperty("status")
        private String status;
        
        @JsonProperty("duration")
        private Integer duration;
        
        @JsonProperty("comment")
        private String comment;
        
        @JsonProperty("errorMessage")
        private String errorMessage;
        
        @JsonProperty("stackTrace")
        private String stackTrace;

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

        public Integer getDuration() {
            return duration;
        }

        public void setDuration(Integer duration) {
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
}

