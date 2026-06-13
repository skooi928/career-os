package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, UUID> {
    List<SurveyQuestion> findBySurveyIdOrderByOrderIndex(UUID surveyId);
    void deleteBySurveyId(UUID surveyId);
}
