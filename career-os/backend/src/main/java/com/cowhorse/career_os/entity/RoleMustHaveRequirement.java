package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.util.UUID;

@Entity
@Table(name = "role_must_have_requirements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleMustHaveRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "must_have_id")
    private UUID mustHaveId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id", nullable = false)
    @JsonBackReference
    private RoleRequirement roleRequirement;

    @Column(name = "requirement_text", nullable = false)
    private String requirementText;
}
