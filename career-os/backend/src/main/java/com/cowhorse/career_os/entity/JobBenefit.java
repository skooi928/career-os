package com.cowhorse.career_os.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "job_benefits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobBenefit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "benefit_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    @JsonBackReference
    private Job job;

    @Column(name = "benefit_text", nullable = false, columnDefinition = "TEXT")
    private String benefitText;
}
