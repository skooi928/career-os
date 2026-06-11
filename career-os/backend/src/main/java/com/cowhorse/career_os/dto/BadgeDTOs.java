package com.cowhorse.career_os.dto;

import lombok.Data;
import java.util.UUID;

public class BadgeDTOs {

    @Data
    public static class CreateBadgeRequest {
        private String name;
        private String description;
        private String skillTag;
    }

    @Data
    public static class IssueBadgeRequest {
        private String userId;
        private UUID badgeId;
    }

    @Data
    public static class SubmitConversionRequest {
        private String universityName;
        private String courseName;
        private UUID mappedBadgeId;
    }

    @Data
    public static class ReviewConversionRequest {
        private String status; // "APPROVED" or "REJECTED"
        private UUID badgeId;
        private String notes;
    }

    @Data
    public static class FileUploadResponse {
        private String url;

        public FileUploadResponse(String url) {
            this.url = url;
        }
    }
}
