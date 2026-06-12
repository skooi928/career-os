package com.cowhorse.career_os.dto;

import java.util.UUID;

import com.cowhorse.career_os.entity.DifficultyLevel;

import lombok.Data;

public class UpskillingDTOs {

    @Data
    public static class CreateCourseRequest {
        private String title;
        private String description;
        private String category;
        private DifficultyLevel difficultyLevel;
        private Integer durationHours;
    }

    @Data
    public static class UpdateCourseRequest {
        private String title;
        private String description;
        private String category;
        private DifficultyLevel difficultyLevel;
        private Integer durationHours;
    }

    @Data
    public static class EnrollRequest {
        private UUID courseId;
    }

    @Data
    public static class UpdateProgressRequest {
        private int progressPercentage;
    }

    @Data
    public static class LearnerStatsResponse {
        private long totalEnrolled;
        private long completed;
        private long inProgress;
        private long dropped;

        public LearnerStatsResponse(long totalEnrolled, long completed, long inProgress, long dropped) {
            this.totalEnrolled = totalEnrolled;
            this.completed = completed;
            this.inProgress = inProgress;
            this.dropped = dropped;
        }
    }
}
