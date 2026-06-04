package com.cowhorse.career_os.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "job_application_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonBackReference
    private JobApplication jobApplication;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "answer_text", nullable = false, columnDefinition = "TEXT")
    private String answerText;
}
