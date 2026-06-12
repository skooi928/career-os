package com.cowhorse.career_os.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cowhorse.career_os.entity.OrganisationMember;

public interface OrganisationMemberRepository extends JpaRepository<OrganisationMember, UUID> {
    List<OrganisationMember> findByOrganisationId(UUID organisationId);
    List<OrganisationMember> findByUserId(UUID userId);
    Optional<OrganisationMember> findByOrganisationIdAndUserId(UUID organisationId, UUID userId);
    boolean existsByOrganisationIdAndUserId(UUID organisationId, UUID userId);
}
