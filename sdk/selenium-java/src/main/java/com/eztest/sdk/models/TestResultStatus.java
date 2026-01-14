package com.eztest.sdk.models;

/**
 * Test result status enumeration.
 * 
 * SDK Boundary: Pure model class representing test result statuses.
 * Maps to EZTest backend status values. No dependencies on backend code.
 */
public enum TestResultStatus {
    /** Test passed successfully */
    PASSED,
    
    /** Test failed */
    FAILED,
    
    /** Test was blocked and could not be executed */
    BLOCKED,
    
    /** Test was skipped */
    SKIPPED,
    
    /** Test needs to be retested */
    RETEST;

    /**
     * Converts a TestNG test status to EZTest status.
     * 
     * @param testNgStatus TestNG status (1=SUCCESS, 2=FAILURE, 3=SKIP)
     * @return Corresponding EZTest status
     */
    public static TestResultStatus fromTestNgStatus(int testNgStatus) {
        switch (testNgStatus) {
            case 1: // ITestResult.SUCCESS
                return PASSED;
            case 2: // ITestResult.FAILURE
                return FAILED;
            case 3: // ITestResult.SKIP
                return SKIPPED;
            default:
                return SKIPPED;
        }
    }
}

