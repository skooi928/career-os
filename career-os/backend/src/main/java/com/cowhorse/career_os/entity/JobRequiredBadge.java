package com.cowhorse.career_os.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/**
 * Represents a badge or skill-tag requirement on a job posting.
 * is_required=true  → mandatory (candidate must hold the badge)
 * is_required=false → preferred (boosts candidate match score)
 */
@Entity
@Table(name = "job_required_badges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequiredBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    /** Specific badge required. Null if requirement is skill-tag based only. */
    @Column(name = "badge_id")
    private UUID badgeId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "badge_id", insertable = false, updatable = false)
    private Badge badge;

    /** Free-text skill tag (e.g. "Python", "Leadership"). Used when no specific badge mapped. */
    @Column(name = "skill_tag")
    private String skillTag;

    /** true = must-have, false = nice-to-have */
    @Column(name = "is_required", nullable = false)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonProperty("isRequired")
    private boolean isRequired = false;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
