package com.cowhorse.career_os.dto;

import java.util.UUID;

import com.cowhorse.career_os.entity.CourseEnrollment;
import com.cowhorse.career_os.entity.DifficultyLevel;
import com.cowhorse.career_os.entity.UserBadge;

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

    /** Links (or unlinks when badgeId=null) a badge to a course. */
    @Data
    public static class LinkCourseBadgeRequest {
        private UUID badgeId; // null to remove the link
    }

    /**
     * Response after updating progress.
     * awardedBadge is non-null only when the user just completed the course
     * AND the course had a linked badge AND the user did not already hold it.
     */
    @Data
    public static class UpdateProgressResponse {
        private CourseEnrollment enrollment;
        private UserBadge awardedBadge; // null = no badge awarded

        public UpdateProgressResponse(CourseEnrollment enrollment, UserBadge awardedBadge) {
            this.enrollment = enrollment;
            this.awardedBadge = awardedBadge;
        }
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
