package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Model classes for ExtentSparkReporter JSON format.
 * 
 * SDK Boundary: Data transfer objects for parsing external test report JSON.
 * Used to deserialize ExtentSparkReporter or similar test report JSON formats
 * and sync them with EZTest. No dependencies on EZTest backend code.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExtentReportModel {
    
    @JsonProperty("report_meta")
    private ReportMeta reportMeta;
    
    @JsonProperty("summary")
    private ReportSummary summary;
    
    @JsonProperty("results")
    private List<TestResult> results;

    public ReportMeta getReportMeta() {
        return reportMeta;
    }

    public void setReportMeta(ReportMeta reportMeta) {
        this.reportMeta = reportMeta;
    }

    public ReportSummary getSummary() {
        return summary;
    }

    public void setSummary(ReportSummary summary) {
        this.summary = summary;
    }

    public List<TestResult> getResults() {
        return results;
    }

    public void setResults(List<TestResult> results) {
        this.results = results;
    }

    /**
     * Report metadata section.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ReportMeta {
        @JsonProperty("project_name")
        private String projectName;
        
        @JsonProperty("generated_at")
        private String generatedAt;
        
        @JsonProperty("report_source")
        private String reportSource;
        
        @JsonProperty("environment")
        private Environment environment;
        
        @JsonProperty("user_config")
        private UserConfig userConfig;

        public String getProjectName() {
            return projectName;
        }

        public void setProjectName(String projectName) {
            this.projectName = projectName;
        }

        public String getGeneratedAt() {
            return generatedAt;
        }

        public void setGeneratedAt(String generatedAt) {
            this.generatedAt = generatedAt;
        }

        public String getReportSource() {
            return reportSource;
        }

        public void setReportSource(String reportSource) {
            this.reportSource = reportSource;
        }

        public Environment getEnvironment() {
            return environment;
        }

        public void setEnvironment(Environment environment) {
            this.environment = environment;
        }

        public UserConfig getUserConfig() {
            return userConfig;
        }

        public void setUserConfig(UserConfig userConfig) {
            this.userConfig = userConfig;
        }
    }

    /**
     * Environment information.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Environment {
        @JsonProperty("os")
        private String os;
        
        @JsonProperty("java_version")
        private String javaVersion;
        
        @JsonProperty("browser")
        private String browser;
        
        @JsonProperty("environment_url")
        private String environmentUrl;

        public String getOs() {
            return os;
        }

        public void setOs(String os) {
            this.os = os;
        }

        public String getJavaVersion() {
            return javaVersion;
        }

        public void setJavaVersion(String javaVersion) {
            this.javaVersion = javaVersion;
        }

        public String getBrowser() {
            return browser;
        }

        public void setBrowser(String browser) {
            this.browser = browser;
        }

        public String getEnvironmentUrl() {
            return environmentUrl;
        }

        public void setEnvironmentUrl(String environmentUrl) {
            this.environmentUrl = environmentUrl;
        }
    }

    /**
     * User configuration information.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class UserConfig {
        @JsonProperty("triggered_by")
        private String triggeredBy;
        
        @JsonProperty("build_id")
        private String buildId;
        
        @JsonProperty("execution_profile")
        private String executionProfile;

        public String getTriggeredBy() {
            return triggeredBy;
        }

        public void setTriggeredBy(String triggeredBy) {
            this.triggeredBy = triggeredBy;
        }

        public String getBuildId() {
            return buildId;
        }

        public void setBuildId(String buildId) {
            this.buildId = buildId;
        }

        public String getExecutionProfile() {
            return executionProfile;
        }

        public void setExecutionProfile(String executionProfile) {
            this.executionProfile = executionProfile;
        }
    }

    /**
     * Test execution summary.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ReportSummary {
        @JsonProperty("total_tests")
        private Integer totalTests;
        
        @JsonProperty("passed")
        private Integer passed;
        
        @JsonProperty("failed")
        private Integer failed;
        
        @JsonProperty("skipped")
        private Integer skipped;
        
        @JsonProperty("total_duration_ms")
        private Long totalDurationMs;
        
        @JsonProperty("start_time")
        private String startTime;
        
        @JsonProperty("end_time")
        private String endTime;

        public Integer getTotalTests() {
            return totalTests;
        }

        public void setTotalTests(Integer totalTests) {
            this.totalTests = totalTests;
        }

        public Integer getPassed() {
            return passed;
        }

        public void setPassed(Integer passed) {
            this.passed = passed;
        }

        public Integer getFailed() {
            return failed;
        }

        public void setFailed(Integer failed) {
            this.failed = failed;
        }

        public Integer getSkipped() {
            return skipped;
        }

        public void setSkipped(Integer skipped) {
            this.skipped = skipped;
        }

        public Long getTotalDurationMs() {
            return totalDurationMs;
        }

        public void setTotalDurationMs(Long totalDurationMs) {
            this.totalDurationMs = totalDurationMs;
        }

        public String getStartTime() {
            return startTime;
        }

        public void setStartTime(String startTime) {
            this.startTime = startTime;
        }

        public String getEndTime() {
            return endTime;
        }

        public void setEndTime(String endTime) {
            this.endTime = endTime;
        }
    }

    /**
     * Individual test result.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TestResult {
        @JsonProperty("test_id")
        private String testId;
        
        @JsonProperty("test_name")
        private String testName;
        
        @JsonProperty("class_name")
        private String className;
        
        @JsonProperty("status")
        private String status;
        
        @JsonProperty("start_time")
        private String startTime;
        
        @JsonProperty("end_time")
        private String endTime;
        
        @JsonProperty("duration_ms")
        private Long durationMs;
        
        @JsonProperty("tags")
        private List<String> tags;
        
        @JsonProperty("error_message")
        private String errorMessage;
        
        @JsonProperty("stack_trace")
        private String stackTrace;

        public String getTestId() {
            return testId;
        }

        public void setTestId(String testId) {
            this.testId = testId;
        }

        public String getTestName() {
            return testName;
        }

        public void setTestName(String testName) {
            this.testName = testName;
        }

        public String getClassName() {
            return className;
        }

        public void setClassName(String className) {
            this.className = className;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getStartTime() {
            return startTime;
        }

        public void setStartTime(String startTime) {
            this.startTime = startTime;
        }

        public String getEndTime() {
            return endTime;
        }

        public void setEndTime(String endTime) {
            this.endTime = endTime;
        }

        public Long getDurationMs() {
            return durationMs;
        }

        public void setDurationMs(Long durationMs) {
            this.durationMs = durationMs;
        }

        public List<String> getTags() {
            return tags;
        }

        public void setTags(List<String> tags) {
            this.tags = tags;
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

