package com.cowhorse.career_os.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "course_enrollments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", insertable = false, updatable = false)
    private Course course;

    @Column(name = "progress_percentage", nullable = false)
    @Builder.Default
    private int progressPercentage = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_status", nullable = false)
    @Builder.Default
    private EnrollmentStatus completionStatus = EnrollmentStatus.IN_PROGRESS;

    @Column(name = "enrolled_at", updatable = false)
    @Builder.Default
    private Instant enrolledAt = Instant.now();
}
