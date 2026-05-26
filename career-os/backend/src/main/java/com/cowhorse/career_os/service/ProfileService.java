package com.cowhorse.career_os.service;

import com.cowhorse.career_os.dto.*;
import com.cowhorse.career_os.entity.*;
import com.cowhorse.career_os.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {
    private final UserProfileRepository userProfileRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;

    // ==================== User Profile Methods ====================

    public UserProfileDTO getUserProfileBySupabaseUid(String supabaseUid) {
        log.info("Fetching profile for Supabase UID/UUID: {}", supabaseUid);
        UUID userUuid;
        try {
            userUuid = UUID.fromString(supabaseUid);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", supabaseUid);
            throw new RuntimeException("Invalid user ID format");
        }
        
        UserProfile userProfile = userProfileRepository.findByUserId(userUuid)
                .orElseThrow(() -> {
                    log.error("UserProfile not found for UUID: {}", userUuid);
                    return new RuntimeException("Profile not found for UUID: " + supabaseUid);
                });

        log.debug("Found UserProfile: {}. Fetching related records...", userProfile.getId());

        List<ExperienceDTO> experiences = experienceRepository.findByUserId(userUuid)
                .stream().map(this::convertToExperienceDTO).collect(Collectors.toList());
        log.debug("Loaded {} experiences", experiences.size());

        List<EducationDTO> education = educationRepository.findByUserId(userUuid)
                .stream().map(this::convertToEducationDTO).collect(Collectors.toList());
        log.debug("Loaded {} education records", education.size());

        List<ProjectDTO> projects = projectRepository.findByUserId(userUuid)
                .stream().map(this::convertToProjectDTO).collect(Collectors.toList());
        log.debug("Loaded {} projects", projects.size());

        List<SkillDTO> skills = skillRepository.findByUserId(userUuid)
                .stream().map(this::convertToSkillDTO).collect(Collectors.toList());
        log.debug("Loaded {} skills", skills.size());

        return UserProfileDTO.builder()
                .id(userProfile.getId())
                .firstName(userProfile.getFirstName())
                .lastName(userProfile.getLastName())
                .email("")     // Typically provided by client or auth service
                .phone(userProfile.getPhone())
                .location(userProfile.getLocation())
                .bio(userProfile.getBio())
                .profileImageUrl(userProfile.getProfileImageUrl())
                .experiences(experiences)
                .education(education)
                .projects(projects)
                .skills(skills)
                .userId(supabaseUid)
                .build();
    }

    public UserProfileDTO updateUserProfileBySupabaseUid(String supabaseUid, UserProfileDTO profileDTO) {
        UUID userUuid = UUID.fromString(supabaseUid);
        UserProfile userProfile = userProfileRepository.findByUserId(userUuid)
                .orElseThrow(() -> new RuntimeException("Profile not found for UUID: " + supabaseUid));

        userProfile.setFirstName(profileDTO.getFirstName());
        userProfile.setLastName(profileDTO.getLastName());
        userProfile.setPhone(profileDTO.getPhone());
        userProfile.setLocation(profileDTO.getLocation());
        userProfile.setBio(profileDTO.getBio());
        userProfile.setProfileImageUrl(profileDTO.getProfileImageUrl());

        userProfileRepository.save(userProfile);

        return getUserProfileBySupabaseUid(supabaseUid);
    }

    // Experience Methods
    public ExperienceDTO addExperienceBySupabaseUid(String supabaseUid, ExperienceDTO experienceDTO) {
        UUID userUuid = UUID.fromString(supabaseUid);
        
        Experience experience = Experience.builder()
                .userId(userUuid)
                .jobTitle(experienceDTO.getJobTitle())
                .company(experienceDTO.getCompany())
                .startDate(experienceDTO.getStartDate())
                .endDate(experienceDTO.getEndDate())
                .isCurrent(experienceDTO.getCurrent() != null ? experienceDTO.getCurrent() : false)
                .description(experienceDTO.getDescription())
                .build();

        Experience saved = experienceRepository.save(experience);
        return convertToExperienceDTO(saved);
    }

    public ExperienceDTO updateExperience(Long experienceId, ExperienceDTO experienceDTO) {
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new RuntimeException("Experience not found"));

        experience.setJobTitle(experienceDTO.getJobTitle());
        experience.setCompany(experienceDTO.getCompany());
        experience.setStartDate(experienceDTO.getStartDate());
        experience.setEndDate(experienceDTO.getEndDate());
        experience.setIsCurrent(experienceDTO.getCurrent() != null ? experienceDTO.getCurrent() : false);
        experience.setDescription(experienceDTO.getDescription());

        Experience saved = experienceRepository.save(experience);
        return convertToExperienceDTO(saved);
    }

    public void deleteExperience(Long experienceId) {
        experienceRepository.deleteById(experienceId);
    }

    // Education Methods
    public EducationDTO addEducationBySupabaseUid(String supabaseUid, EducationDTO educationDTO) {
        UUID userUuid = UUID.fromString(supabaseUid);

        Education education = Education.builder()
                .userId(userUuid)
                .degree(educationDTO.getDegree())
                .institution(educationDTO.getInstitution())
                .field(educationDTO.getField())
                .startDate(educationDTO.getStartDate())
                .endDate(educationDTO.getEndDate())
                .isCurrent(educationDTO.getCurrent() != null ? educationDTO.getCurrent() : false)
                .build();

        Education saved = educationRepository.save(education);
        return convertToEducationDTO(saved);
    }

    public EducationDTO updateEducation(Long educationId, EducationDTO educationDTO) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new RuntimeException("Education not found"));

        education.setDegree(educationDTO.getDegree());
        education.setInstitution(educationDTO.getInstitution());
        education.setField(educationDTO.getField());
        education.setStartDate(educationDTO.getStartDate());
        education.setEndDate(educationDTO.getEndDate());
        education.setIsCurrent(educationDTO.getCurrent() != null ? educationDTO.getCurrent() : false);

        Education saved = educationRepository.save(education);
        return convertToEducationDTO(saved);
    }

    public void deleteEducation(Long educationId) {
        educationRepository.deleteById(educationId);
    }

    // Project Methods
    public ProjectDTO addProjectBySupabaseUid(String supabaseUid, ProjectDTO projectDTO) {
        UUID userUuid = UUID.fromString(supabaseUid);

        String technologiesStr = projectDTO.getTechnologies() != null 
                ? String.join(",", projectDTO.getTechnologies()) 
                : "";

        Project project = Project.builder()
                .userId(userUuid)
                .title(projectDTO.getTitle())
                .description(projectDTO.getDescription())
                .technologies(technologiesStr)
                .link(projectDTO.getLink())
                .startDate(projectDTO.getStartDate())
                .endDate(projectDTO.getEndDate())
                .build();

        Project saved = projectRepository.save(project);
        return convertToProjectDTO(saved);
    }

    public ProjectDTO updateProject(Long projectId, ProjectDTO projectDTO) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String technologiesStr = projectDTO.getTechnologies() != null 
                ? String.join(",", projectDTO.getTechnologies()) 
                : "";

        project.setTitle(projectDTO.getTitle());
        project.setDescription(projectDTO.getDescription());
        project.setTechnologies(technologiesStr);
        project.setLink(projectDTO.getLink());
        project.setStartDate(projectDTO.getStartDate());
        project.setEndDate(projectDTO.getEndDate());

        Project saved = projectRepository.save(project);
        return convertToProjectDTO(saved);
    }

    public void deleteProject(Long projectId) {
        projectRepository.deleteById(projectId);
    }

    // Skill Methods
    public SkillDTO addSkillBySupabaseUid(String supabaseUid, SkillDTO skillDTO) {
        UUID userUuid = UUID.fromString(supabaseUid);

        Skill.ProficiencyLevel proficiency = Skill.ProficiencyLevel.valueOf(
                skillDTO.getProficiency().toUpperCase());

        Skill skill = Skill.builder()
                .userId(userUuid)
                .name(skillDTO.getName())
                .proficiency(proficiency)
                .endorsed(0)
                .build();

        Skill saved = skillRepository.save(skill);
        return convertToSkillDTO(saved);
    }

    public SkillDTO updateSkill(Long skillId, SkillDTO skillDTO) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        Skill.ProficiencyLevel proficiency = Skill.ProficiencyLevel.valueOf(
                skillDTO.getProficiency().toUpperCase());

        skill.setName(skillDTO.getName());
        skill.setProficiency(proficiency);

        Skill saved = skillRepository.save(skill);
        return convertToSkillDTO(saved);
    }

    public void deleteSkill(Long skillId) {
        skillRepository.deleteById(skillId);
    }

    // Helper conversion methods
    private ExperienceDTO convertToExperienceDTO(Experience experience) {
        return ExperienceDTO.builder()
                .id(experience.getId())
                .jobTitle(experience.getJobTitle())
                .company(experience.getCompany())
                .startDate(experience.getStartDate())
                .endDate(experience.getEndDate())
                .current(experience.getIsCurrent())
                .description(experience.getDescription())
                .build();
    }

    private EducationDTO convertToEducationDTO(Education education) {
        return EducationDTO.builder()
                .id(education.getId())
                .degree(education.getDegree())
                .institution(education.getInstitution())
                .field(education.getField())
                .startDate(education.getStartDate())
                .endDate(education.getEndDate())
                .current(education.getIsCurrent())
                .build();
    }

    private ProjectDTO convertToProjectDTO(Project project) {
        List<String> technologies = project.getTechnologies() != null && !project.getTechnologies().isEmpty()
                ? List.of(project.getTechnologies().split(","))
                : List.of();

        return ProjectDTO.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .technologies(technologies)
                .link(project.getLink())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .build();
    }

    private SkillDTO convertToSkillDTO(Skill skill) {
        return SkillDTO.builder()
                .id(skill.getId())
                .name(skill.getName())
                .proficiency(skill.getProficiency().toString())
                .endorsed(skill.getEndorsed())
                .build();
    }
}
