package com.cowhorse.career_os.dto;

import com.cowhorse.career_os.entity.OrgMemberRole;
import com.cowhorse.career_os.entity.OrgType;

import lombok.Data;

public class OrganisationDTOs {

    @Data
    public static class CreateOrganisationRequest {
        private String name;
        private OrgType type;
        private String website;
        private String description;
        private String emailDomain;
    }

    @Data
    public static class UpdateOrganisationRequest {
        private String name;
        private String website;
        private String description;
        private String emailDomain;
    }

    @Data
    public static class InviteMemberRequest {
        private String userId;
        private OrgMemberRole role;
    }

    @Data
    public static class UpdateMemberRoleRequest {
        private OrgMemberRole role;
    }

    @Data
    public static class DashboardStatsResponse {
        private long publishedCourses;
        private long totalEnrollments;
        private long totalBadgesIssued;
        private long pendingVerifications;

        public DashboardStatsResponse(long publishedCourses, long totalEnrollments, long totalBadgesIssued, long pendingVerifications) {
            this.publishedCourses = publishedCourses;
            this.totalEnrollments = totalEnrollments;
            this.totalBadgesIssued = totalBadgesIssued;
            this.pendingVerifications = pendingVerifications;
        }
    }
}
