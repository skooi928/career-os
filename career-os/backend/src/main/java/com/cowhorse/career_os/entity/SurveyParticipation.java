package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "survey_participation", schema = "dbo")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "survey_id", nullable = false)
    private UUID surveyId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "participated_at", updatable = false)
    @Builder.Default
    private Instant participatedAt = Instant.now();
}
