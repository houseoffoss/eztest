package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Response model for automation report import API.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AutomationReportResponse {
    
    @JsonProperty("testRunId")
    private String testRunId;
    
    @JsonProperty("testRunName")
    private String testRunName;
    
    @JsonProperty("environment")
    private String environment;
    
    @JsonProperty("processedCount")
    private Integer processedCount;
    
    @JsonProperty("errorCount")
    private Integer errorCount;
    
    @JsonProperty("results")
    private List<ProcessedResult> results;
    
    @JsonProperty("errors")
    private List<ErrorInfo> errors;

    public String getTestRunId() {
        return testRunId;
    }

    public void setTestRunId(String testRunId) {
        this.testRunId = testRunId;
    }

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

    public Integer getProcessedCount() {
        return processedCount;
    }

    public void setProcessedCount(Integer processedCount) {
        this.processedCount = processedCount;
    }

    public Integer getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(Integer errorCount) {
        this.errorCount = errorCount;
    }

    public List<ProcessedResult> getResults() {
        return results;
    }

    public void setResults(List<ProcessedResult> results) {
        this.results = results;
    }

    public List<ErrorInfo> getErrors() {
        return errors;
    }

    public void setErrors(List<ErrorInfo> errors) {
        this.errors = errors;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProcessedResult {
        @JsonProperty("testCaseId")
        private String testCaseId;
        
        @JsonProperty("status")
        private String status;
        
        @JsonProperty("resultId")
        private String resultId;

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

        public String getResultId() {
            return resultId;
        }

        public void setResultId(String resultId) {
            this.resultId = resultId;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ErrorInfo {
        @JsonProperty("testCaseId")
        private String testCaseId;
        
        @JsonProperty("error")
        private String error;

        public String getTestCaseId() {
            return testCaseId;
        }

        public void setTestCaseId(String testCaseId) {
            this.testCaseId = testCaseId;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }
}

