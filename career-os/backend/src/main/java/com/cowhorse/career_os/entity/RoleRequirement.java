package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "role_requirements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID requirementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    @JsonBackReference
    private Job job;

    @Column(name = "seniority_level", nullable = false, length = 100)
    private String seniorityLevel;

    @Column(name = "required_experience_years", nullable = false)
    private Integer requiredExperienceYears;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @OneToMany(mappedBy = "roleRequirement", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RoleSkillRequirement> skills;
}
