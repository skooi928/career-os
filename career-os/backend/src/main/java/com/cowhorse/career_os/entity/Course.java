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
@Table(name = "courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organisation_id", nullable = false)
    private UUID organisationId;

    @Column(nullable = false)
    private String title;

    private String description;
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", nullable = false)
    @Builder.Default
    private DifficultyLevel difficultyLevel = DifficultyLevel.BEGINNER;

    @Column(name = "duration_hours")
    private Integer durationHours;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonProperty("isPublished")
    private boolean isPublished = false;

    /** Badge awarded automatically when a learner reaches 100% progress. Null = no badge. */
    @Column(name = "badge_id")
    private UUID badgeId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "badge_id", insertable = false, updatable = false)
    private Badge badge;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organisation_id", insertable = false, updatable = false)
    private Organisation organisation;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
