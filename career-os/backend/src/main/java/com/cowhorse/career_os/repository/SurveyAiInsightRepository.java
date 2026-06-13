package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.SurveyAiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SurveyAiInsightRepository extends JpaRepository<SurveyAiInsight, UUID> {
    List<SurveyAiInsight> findBySurveyIdOrderByGeneratedAtDesc(UUID surveyId);
    Optional<SurveyAiInsight> findTopBySurveyIdOrderByGeneratedAtDesc(UUID surveyId);
}
