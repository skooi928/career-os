package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.Organisation;
import com.cowhorse.career_os.entity.OrgType;
import com.cowhorse.career_os.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OrganisationRepository extends JpaRepository<Organisation, UUID> {
    List<Organisation> findByVerificationStatus(VerificationStatus status);
    List<Organisation> findByType(OrgType type);
    List<Organisation> findByVerificationStatusOrderByCreatedAtDesc(VerificationStatus status);
}
