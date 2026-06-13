package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, UUID> {
    List<SurveyResponse> findBySurveyId(UUID surveyId);
    long countBySurveyId(UUID surveyId);
}
