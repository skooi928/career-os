package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "survey_question_answers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyQuestionAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "response_id", nullable = false)
    private UUID responseId;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "rating_value")
    private Integer ratingValue;

    @Column(name = "text_answer", columnDefinition = "TEXT")
    private String textAnswer;
}
