package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.ProjectApplication;
import com.cowhorse.career_os.entity.ProjectApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, UUID> {
    List<ProjectApplication> findByProjectId(UUID projectId);
    List<ProjectApplication> findByUserId(UUID userId);
    Optional<ProjectApplication> findByProjectIdAndUserId(UUID projectId, UUID userId);
    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);
    long countByProjectIdAndStatus(UUID projectId, ProjectApplicationStatus status);
}
