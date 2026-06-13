package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "mock_interview_sessions", schema = "dbo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockInterviewSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "session_id")
    private UUID sessionId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "target_role")
    private String targetRole;

    @Column(name = "department")
    private String department;

    @Column(name = "industry")
    private String industry;

    @Column(name = "seniority_level")
    private String seniorityLevel;

    @Column(name = "language")
    private String language;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "interview_mode")
    private String interviewMode;

    @Column(name = "interview_type")
    private String interviewType;

    @Column(name = "status")
    private String status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "overall_score")
    private BigDecimal overallScore;

    @Column(name = "evaluation_summary", columnDefinition = "TEXT")
    private String evaluationSummary;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (startedAt == null) startedAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
