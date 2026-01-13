package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Generic API response wrapper from EZTest REST API.
 * 
 * SDK Boundary: Response DTO for API communication.
 * EZTest API returns responses in the format: { "data": {...}, "message": "..." }
 * This class deserializes such responses. No dependencies on EZTest backend code.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApiResponse<T> {
    
    @JsonProperty("data")
    private T data;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("error")
    private String error;
    
    @JsonProperty("statusCode")
    private Integer statusCode;

    public ApiResponse() {
        // Default constructor for Jackson
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }

    public boolean isSuccess() {
        return error == null && statusCode == null || (statusCode != null && statusCode >= 200 && statusCode < 300);
    }
}

