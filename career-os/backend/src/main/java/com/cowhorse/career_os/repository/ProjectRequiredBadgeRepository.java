package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.ProjectRequiredBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProjectRequiredBadgeRepository extends JpaRepository<ProjectRequiredBadge, UUID> {
    List<ProjectRequiredBadge> findByProjectId(UUID projectId);
    void deleteByProjectId(UUID projectId);
    void deleteByProjectIdAndBadgeId(UUID projectId, UUID badgeId);
    boolean existsByProjectIdAndBadgeId(UUID projectId, UUID badgeId);
}
