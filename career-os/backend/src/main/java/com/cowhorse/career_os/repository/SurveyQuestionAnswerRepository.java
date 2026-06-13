package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.SurveyQuestionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SurveyQuestionAnswerRepository extends JpaRepository<SurveyQuestionAnswer, UUID> {
    List<SurveyQuestionAnswer> findByResponseId(UUID responseId);
    List<SurveyQuestionAnswer> findByQuestionId(UUID questionId);
    List<SurveyQuestionAnswer> findByResponseIdIn(List<UUID> responseIds);
}
