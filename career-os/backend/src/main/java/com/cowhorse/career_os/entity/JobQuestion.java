package com.cowhorse.career_os.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "job_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    @JsonBackReference
    private Job job;

    @Column(name = "question_text", nullable = false)
    private String questionText;

    @Column(name = "question_type", nullable = false)
    private String questionType; // e.g. "TEXT", "MULTIPLE_CHOICE"

    @ElementCollection
    @CollectionTable(name = "job_question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text")
    private List<String> options;
}
