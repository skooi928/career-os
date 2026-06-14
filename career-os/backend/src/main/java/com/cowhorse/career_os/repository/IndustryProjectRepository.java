package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.IndustryProject;
import com.cowhorse.career_os.entity.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface IndustryProjectRepository extends JpaRepository<IndustryProject, UUID> {
    List<IndustryProject> findByOrganisationId(UUID organisationId);
    List<IndustryProject> findByStatus(ProjectStatus status);
    long countByOrganisationId(UUID organisationId);
}
