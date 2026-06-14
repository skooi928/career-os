package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "survey_ai_insights", schema = "dbo")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyAiInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "survey_id", nullable = false)
    private UUID surveyId;

    @Column(name = "insight_json", nullable = false, columnDefinition = "TEXT")
    private String insightJson;

    @Column(name = "generated_at", updatable = false)
    @Builder.Default
    private Instant generatedAt = Instant.now();
}
