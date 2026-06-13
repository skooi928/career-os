package com.cowhorse.career_os.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cowhorse.career_os.entity.UserBadge;

public interface UserBadgeRepository extends JpaRepository<UserBadge, UUID> {
    List<UserBadge> findByUserId(UUID userId);
    List<UserBadge> findByBadgeId(UUID badgeId);
    boolean existsByUserIdAndBadgeId(UUID userId, UUID badgeId);
    long countByBadge_OrganisationId(UUID organisationId);
}
