package com.cowhorse.career_os.dto;

import java.util.List;
import java.util.UUID;

import lombok.Data;

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

    /** A single badge/skill-tag requirement for a job posting. */
    @Data
    public static class JobRequiredBadgeRequest {
        private UUID badgeId;    // optional
        private String skillTag; // optional
        private boolean isRequired; // true = mandatory, false = preferred
    }

    /** Recruiter view: how well a candidate's badges match a job's requirements. */
    @Data
    public static class CandidateMatchResponse {
        private UUID candidateId;
        private String candidateName;
        private int matchScore;           // 0–100
        private List<UUID> matchedBadges; // badge IDs the candidate holds that the job requires
        private List<UUID> missingBadges; // required badge IDs the candidate is missing

        public CandidateMatchResponse(UUID candidateId, String candidateName,
                                      int matchScore, List<UUID> matchedBadges, List<UUID> missingBadges) {
            this.candidateId = candidateId;
            this.candidateName = candidateName;
            this.matchScore = matchScore;
            this.matchedBadges = matchedBadges;
            this.missingBadges = missingBadges;
        }
    }
}
