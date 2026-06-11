package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "university_course_conversion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversityCourseConversion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "university_name", nullable = false)
    private String universityName;

    @Column(name = "course_name", nullable = false)
    private String courseName;

    @Column(name = "uploaded_document_url")
    private String uploadedDocumentUrl;

    @Column(name = "mapped_badge_id")
    private UUID mappedBadgeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ConversionStatus status = ConversionStatus.PENDING;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    private String notes;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
