package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "interview_evaluations", schema = "dbo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "evaluation_id")
    private UUID evaluationId;

    @Column(name = "answer_id", nullable = false)
    private UUID answerId;

    @Column(name = "technical_score")
    private BigDecimal technicalScore;

    @Column(name = "communication_score")
    private BigDecimal communicationScore;

    @Column(name = "confidence_score")
    private BigDecimal confidenceScore;

    @Column(name = "role_fit_score")
    private BigDecimal roleFitScore;

    @Column(name = "overall_answer_score")
    private BigDecimal overallAnswerScore;

    @Column(name = "feedback_text", columnDefinition = "TEXT")
    private String feedbackText;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses;

    @Column(name = "improved_sample_answer", columnDefinition = "TEXT")
    private String improvedSampleAnswer;

    @Column(name = "skill_gap_detected", columnDefinition = "TEXT")
    private String skillGapDetected;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "raw_ai_response", columnDefinition = "jsonb")
    private String rawAiResponse;

    @Column(name = "ai_model_used")
    private String aiModelUsed;

    @Column(name = "evaluated_at", nullable = false, updatable = false)
    private LocalDateTime evaluatedAt;

    @PrePersist
    protected void onCreate() {
        if (evaluatedAt == null) evaluatedAt = LocalDateTime.now();
    }
}
