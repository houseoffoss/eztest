package com.eztest.sdk.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Response DTO for test case list from EZTest API.
 * 
 * SDK Boundary: Response DTO for API communication.
 * Deserializes test case list data from EZTest REST API responses.
 * No dependencies on EZTest backend code or database.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestCaseListResponse {
    
    @JsonProperty("data")
    private List<TestCaseResponse> data;
    
    @JsonProperty("pagination")
    private Pagination pagination;

    public List<TestCaseResponse> getData() {
        return data;
    }

    public void setData(List<TestCaseResponse> data) {
        this.data = data;
    }

    public Pagination getPagination() {
        return pagination;
    }

    public void setPagination(Pagination pagination) {
        this.pagination = pagination;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Pagination {
        @JsonProperty("page")
        private Integer page;
        
        @JsonProperty("limit")
        private Integer limit;
        
        @JsonProperty("total")
        private Integer total;
        
        @JsonProperty("pages")
        private Integer pages;

        public Integer getPage() {
            return page;
        }

        public void setPage(Integer page) {
            this.page = page;
        }

        public Integer getLimit() {
            return limit;
        }

        public void setLimit(Integer limit) {
            this.limit = limit;
        }

        public Integer getTotal() {
            return total;
        }

        public void setTotal(Integer total) {
            this.total = total;
        }

        public Integer getPages() {
            return pages;
        }

        public void setPages(Integer pages) {
            this.pages = pages;
        }
    }
}

