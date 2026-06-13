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
@Table(name = "user_badges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBadge {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "badge_id", nullable = false)
    private UUID badgeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    @Builder.Default
    private BadgeVerificationStatus verificationStatus = BadgeVerificationStatus.PENDING;

    /** Populated when this badge was automatically awarded upon course completion. */
    @Column(name = "awarded_by_course_id")
    private UUID awardedByCourseId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "badge_id", insertable = false, updatable = false)
    private Badge badge;

    @Column(name = "issued_at", updatable = false)
    @Builder.Default
    private Instant issuedAt = Instant.now();
}
