package com.cowhorse.career_os.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "project_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectApplicationStatus status = ProjectApplicationStatus.PENDING;

    private String note;

    @Column(name = "applied_at", updatable = false)
    @Builder.Default
    private Instant appliedAt = Instant.now();

    @Column(name = "reviewed_at")
    private Instant reviewedAt;
}
