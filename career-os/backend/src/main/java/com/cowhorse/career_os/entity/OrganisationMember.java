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
@Table(name = "organisation_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganisationMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organisation_id", nullable = false)
    private UUID organisationId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrgMemberRole role = OrgMemberRole.MENTOR;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "APPROVED";

    @Column(name = "invited_by", insertable = false, updatable = false)
    private UUID invitedBy;

    @Column(name = "joined_at", updatable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();
}
