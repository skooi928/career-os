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
@Table(name = "interview_answers", schema = "dbo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "answer_id")
    private UUID answerId;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "transcript_text", columnDefinition = "TEXT")
    private String transcriptText;

    @Column(name = "audio_url", columnDefinition = "TEXT")
    private String audioUrl;

    @Column(name = "video_url", columnDefinition = "TEXT")
    private String videoUrl;

    @Column(name = "response_duration")
    private Integer responseDuration;

    @Column(name = "confidence_level")
    private BigDecimal confidenceLevel;

    @Column(name = "speech_pace")
    private BigDecimal speechPace;

    @Column(name = "filler_word_count")
    private Integer fillerWordCount;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) submittedAt = LocalDateTime.now();
    }
}
