package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.util.UUID;

@Entity
@Table(name = "role_technical_skill_requirements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleTechnicalSkillRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "role_technical_skill_id")
    private UUID roleTechnicalSkillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id", nullable = false)
    @JsonBackReference
    private RoleRequirement roleRequirement;

    @Column(name = "technical_skill_text", nullable = false)
    private String technicalSkillText;
}
