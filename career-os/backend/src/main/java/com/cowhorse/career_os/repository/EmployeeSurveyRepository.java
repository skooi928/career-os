package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.EmployeeSurvey;
import com.cowhorse.career_os.entity.SurveyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface EmployeeSurveyRepository extends JpaRepository<EmployeeSurvey, UUID> {
    List<EmployeeSurvey> findByOrganisationId(UUID organisationId);
    List<EmployeeSurvey> findByOrganisationIdAndStatus(UUID organisationId, SurveyStatus status);
}
