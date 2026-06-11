package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.OrganisationMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganisationMemberRepository extends JpaRepository<OrganisationMember, UUID> {
    List<OrganisationMember> findByOrganisationId(UUID organisationId);
    List<OrganisationMember> findByUserId(String userId);
    Optional<OrganisationMember> findByOrganisationIdAndUserId(UUID organisationId, String userId);
    boolean existsByOrganisationIdAndUserId(UUID organisationId, String userId);
}
