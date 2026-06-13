package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "survey_responses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "survey_id", nullable = false)
    private UUID surveyId;

    // Randomly generated — NOT linked to any user
    @Column(name = "anonymization_token", nullable = false)
    @Builder.Default
    private UUID anonymizationToken = UUID.randomUUID();

    @Column(name = "submitted_at", updatable = false)
    @Builder.Default
    private Instant submittedAt = Instant.now();
}
