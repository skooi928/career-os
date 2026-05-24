package com.cowhorse.career_os.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String location;
    private String bio;
    private String profileImageUrl;
    private List<ExperienceDTO> experiences;
    private List<EducationDTO> education;
    private List<ProjectDTO> projects;
    private List<SkillDTO> skills;
}
