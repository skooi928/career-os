package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.SurveyParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SurveyParticipationRepository extends JpaRepository<SurveyParticipation, UUID> {
    boolean existsBySurveyIdAndUserId(UUID surveyId, UUID userId);
    Optional<SurveyParticipation> findBySurveyIdAndUserId(UUID surveyId, UUID userId);
    long countBySurveyId(UUID surveyId);
}
