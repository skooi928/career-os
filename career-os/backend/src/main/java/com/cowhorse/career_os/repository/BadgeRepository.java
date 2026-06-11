package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BadgeRepository extends JpaRepository<Badge, UUID> {
    List<Badge> findByOrganisationId(UUID organisationId);
}
