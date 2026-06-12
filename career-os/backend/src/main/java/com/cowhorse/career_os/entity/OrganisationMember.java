package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

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
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrgMemberRole role = OrgMemberRole.MENTOR;

    @Column(name = "invited_by")
    private String invitedBy;

    @Column(name = "joined_at", updatable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();
}
