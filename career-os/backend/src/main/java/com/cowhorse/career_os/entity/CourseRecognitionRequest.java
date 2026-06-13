package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "course_recognition_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRecognitionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "submitting_org_id", nullable = false)
    private UUID submittingOrgId;

    @Column(name = "reviewing_university_id")
    private UUID reviewingUniversityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RecognitionStatus status = RecognitionStatus.SUBMITTED;

    @Column(name = "syllabus_url")
    private String syllabusUrl;

    @Column(name = "learning_outcomes", columnDefinition = "TEXT")
    private String learningOutcomes;

    @Column(name = "credit_hours")
    private Integer creditHours;

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(name = "submitted_at", updatable = false)
    @Builder.Default
    private Instant submittedAt = Instant.now();

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();

    // Eager joins for display
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", insertable = false, updatable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "submitting_org_id", insertable = false, updatable = false)
    private Organisation submittingOrg;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewing_university_id", insertable = false, updatable = false)
    private Organisation reviewingUniversity;
}
