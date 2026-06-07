package com.cowhorse.career_os.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Maps the JSON response from FastAPI /upload-resume endpoint.
 * Mirrors the Pydantic ResumeData schema exactly.
 * JsonIgnoreProperties = unknown fields from FastAPI won't crash deserialization.
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResumeDTO {

    private String name;
    private String email;
    private String phone;
    private String linkedin;
    private String github;
    private String website;
    private String location;
    private String summary;

    private List<SkillItem> skills;
    private List<EducationItem> education;
    private List<ExperienceItem> experience;
    private List<ProjectItem> projects;

    @JsonProperty("human_languages")
    private List<LanguageItem> humanLanguages;

    private List<AwardItem> awards;
    private List<ActivityItem> activities;
    private List<CertificationItem> certifications;
    private List<ReferenceItem> references;

    // ── Nested classes — one per section ──

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SkillItem {
        private String name;
        private String category;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EducationItem {
        private String institution;
        private String qualification;       // maps to degree in Education entity
        @JsonProperty("field_of_study")
        private String fieldOfStudy;        // maps to field in Education entity
        private String minor;
        @JsonProperty("start_year")
        private String startYear;
        private String year;                // graduation/end year
        private String cgpa;
        private String grades;
        @JsonProperty("is_current")
        private Boolean isCurrent;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExperienceItem {
        private String role;                // maps to jobTitle in Experience entity
        private String company;
        private String duration;
        @JsonProperty("start_date")
        private String startDate;
        @JsonProperty("end_date")
        private String endDate;
        @JsonProperty("is_current")
        private Boolean isCurrent;
        private String description;
        private List<String> responsibilities;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProjectItem {
        private String title;
        private String description;
        @JsonProperty("tools_and_methods")
        private List<String> toolsAndMethods;
        private List<String> technologies;  // fallback if tools_and_methods is empty
        private String url;
        private String year;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LanguageItem {
        private String name;
        private String proficiency;
        @JsonProperty("raw_score")
        private String rawScore;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AwardItem {
        private String title;
        private String issuer;
        private String year;
        private String level;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ActivityItem {
        private String title;
        private String organization;
        private String role;
        private String year;
        private String duration;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CertificationItem {
        private String name;
        private String issuer;
        private String year;
        private String expiry;
        @JsonProperty("credential_id")
        private String credentialId;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ReferenceItem {
        private String name;
        private String title;
        private String organization;
        private String email;
        private String phone;
    }
}