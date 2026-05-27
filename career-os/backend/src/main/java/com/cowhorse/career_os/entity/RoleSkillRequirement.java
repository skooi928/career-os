package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.util.UUID;

@Entity
@Table(name = "role_skill_requirements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleSkillRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID roleSkillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id", nullable = false)
    @JsonBackReference
    private RoleRequirement roleRequirement;

    @Column(name = "skill_text", nullable = false)
    private String skillText;
}
