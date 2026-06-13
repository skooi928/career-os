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
    private final QuickTaskRepository quickTaskRepository;
    private final OnboardingService onboardingService;
    private final DashboardService dashboardService;


    // ==================== User Profile Methods ====================

    public UUID getDataOwnerId(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        if (profile != null && profile.getLinkedUserId() != null) {
            UserProfile linkedProfile = userProfileRepository.findByUserId(profile.getLinkedUserId()).orElse(null);
            if (linkedProfile != null) {
                if ("candidate".equalsIgnoreCase(profile.getRole())) {
                    return profile.getUserId();
                } else if ("candidate".equalsIgnoreCase(linkedProfile.getRole())) {
                    return linkedProfile.getUserId();
                }
            }
        }
        return userId;
    }

    public UserProfileDTO getUserProfileBySupabaseUid(String supabaseUid) {
        log.info("Fetching profile for Supabase UID/UUID: {}", supabaseUid);
        UUID userUuid;
        try {
            userUuid = UUID.fromString(supabaseUid);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", supabaseUid);
            throw new RuntimeException("Invalid user ID format");
        }
        
        UserProfile loggedInProfile = userProfileRepository.findByUserId(userUuid)
                .orElseThrow(() -> {
                    log.error("UserProfile not found for UUID: {}", userUuid);
                    return new RuntimeException("Profile not found for UUID: " + supabaseUid);
                });

        UUID ownerUuid = getDataOwnerId(userUuid);
        UserProfile ownerProfile = userProfileRepository.findByUserId(ownerUuid)
                .orElse(loggedInProfile);

        log.debug("Found UserProfile: {}. Fetching related records...", ownerProfile.getId());

        List<ExperienceDTO> experiences = experienceRepository.findByUserId(ownerUuid)
                .stream().map(this::convertToExperienceDTO).collect(Collectors.toList());
        log.debug("Loaded {} experiences", experiences.size());

        List<EducationDTO> education = educationRepository.findByUserId(ownerUuid)
                .stream().map(this::convertToEducationDTO).collect(Collectors.toList());
        log.debug("Loaded {} education records", education.size());

        List<ProjectDTO> projects = projectRepository.findByUserId(ownerUuid)
                .stream().map(this::convertToProjectDTO).collect(Collectors.toList());
        log.debug("Loaded {} projects", projects.size());

        List<SkillDTO> skills = skillRepository.findByUserId(ownerUuid)
                .stream().map(this::convertToSkillDTO).collect(Collectors.toList());
        log.debug("Loaded {} skills", skills.size());

        List<QuickTaskDTO> quickTasks = quickTaskRepository.findByUserProfileId(ownerProfile.getId())
                .stream().map(this::convertToQuickTaskDTO).collect(Collectors.toList());
        log.debug("Loaded {} quick tasks", quickTasks.size());

        return UserProfileDTO.builder()
                .id(loggedInProfile.getId())
                .firstName(ownerProfile.getFirstName())
                .lastName(ownerProfile.getLastName())
                .email("")     // Typically provided by client or auth service
                .role(loggedInProfile.getRole())
                .phone(ownerProfile.getPhone())
                .location(ownerProfile.getLocation())
                .bio(ownerProfile.getBio())
                .profileImageUrl(ownerProfile.getProfileImageUrl())
                .experiences(experiences)
                .education(education)
                .projects(projects)
                .skills(skills)
                .quickTasks(quickTasks)
                .userId(supabaseUid)
                .build();
    }

    public UserProfileDTO updateUserProfileBySupabaseUid(String supabaseUid, UserProfileDTO profileDTO) {
        UUID userUuid = UUID.fromString(supabaseUid);
        UUID ownerUuid = getDataOwnerId(userUuid);
        
        UserProfile ownerProfile = userProfileRepository.findByUserId(ownerUuid)
                .orElseThrow(() -> new RuntimeException("Profile not found for UUID: " + ownerUuid));

        ownerProfile.setFirstName(profileDTO.getFirstName());
        ownerProfile.setLastName(profileDTO.getLastName());
        ownerProfile.setPhone(profileDTO.getPhone());
        ownerProfile.setLocation(profileDTO.getLocation());
        ownerProfile.setBio(profileDTO.getBio());
        ownerProfile.setProfileImageUrl(profileDTO.getProfileImageUrl());

        userProfileRepository.save(ownerProfile);

        UserProfile loggedInProfile = userProfileRepository.findByUserId(userUuid)
                .orElseThrow(() -> new RuntimeException("Profile not found for UUID: " + supabaseUid));
        if (profileDTO.getRole() != null && !profileDTO.getRole().isEmpty()) {
            String newRole = profileDTO.getRole();
            if (!newRole.equalsIgnoreCase(loggedInProfile.getRole())) {
                String currentRole = loggedInProfile.getRole();
                if (("employer".equalsIgnoreCase(currentRole) || "mentor".equalsIgnoreCase(currentRole))
                        && "candidate".equalsIgnoreCase(newRole)) {
                    throw new IllegalArgumentException("Employer or mentor accounts cannot change their role to candidate");
                }
                loggedInProfile.setRole(newRole);
                onboardingService.initializeRoleSpecificRecords(supabaseUid, newRole);
                userProfileRepository.save(loggedInProfile);
            }
        }

        dashboardService.logActivity(ownerUuid, "PROFILE", "Profile details updated");

        return getUserProfileBySupabaseUid(supabaseUid);
    }

    // Experience Methods
    public ExperienceDTO addExperienceBySupabaseUid(String supabaseUid, ExperienceDTO experienceDTO) {
        UUID userUuid = UUID.fromString(supabaseUid);
        UUID ownerUuid = getDataOwnerId(userUuid);
        
        Experience experience = Experience.builder()
                .userId(ownerUuid)
                .jobTitle(experienceDTO.getJobTitle())
                .company(experienceDTO.getCompany())
                .startDate(experienceDTO.getStartDate())
                .endDate(experienceDTO.getEndDate())
                .isCurrent(experienceDTO.getCurrent() != null ? experienceDTO.getCurrent() : false)
                .description(experienceDTO.getDescription())
                .responsibilities(experienceDTO.getResponsibilities())
                .build();

        Experience saved = experienceRepository.save(experience);
        dashboardService.logActivity(ownerUuid, "PROFILE", "Added experience: <strong>" + saved.getJobTitle() + "</strong> at <strong>" + saved.getCompany() + "</strong>");
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
        experience.setResponsibilities(experienceDTO.getResponsibilities());

        Experience saved = experienceRepository.save(experience);
        return convertToExperienceDTO(saved);
    }

    public void deleteExperience(Long experienceId) {
        experienceRepository.deleteById(experienceId);
    }

    // Education Methods
    public EducationDTO addEducationBySupabaseUid(String supabaseUid, EducationDTO educationDTO) {
        UUID userUuid = UUID.fromString(supabaseUid);
        UUID ownerUuid = getDataOwnerId(userUuid);

        Education education = Education.builder()
                .userId(ownerUuid)
                .degree(educationDTO.getDegree())
                .institution(educationDTO.getInstitution())
                .field(educationDTO.getField())
                .startDate(educationDTO.getStartDate())
                .endDate(educationDTO.getEndDate())
                .isCurrent(educationDTO.getCurrent() != null ? educationDTO.getCurrent() : false)
                .cgpa(educationDTO.getCgpa())
                .grades(educationDTO.getGrades())
                .minor(educationDTO.getMinor())
                .build();

        Education saved = educationRepository.save(education);
        dashboardService.logActivity(ownerUuid, "PROFILE", "Added education: <strong>" + saved.getDegree() + "</strong> at <strong>" + saved.getInstitution() + "</strong>");
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
        education.setCgpa(educationDTO.getCgpa());
        education.setGrades(educationDTO.getGrades());
        education.setMinor(educationDTO.getMinor());

        Education saved = educationRepository.save(education);
        return convertToEducationDTO(saved);
    }

    public void deleteEducation(Long educationId) {
        educationRepository.deleteById(educationId);
    }

    // Project Methods
    public ProjectDTO addProjectBySupabaseUid(String supabaseUid, ProjectDTO projectDTO) {
        UUID userUuid = UUID.fromString(supabaseUid);
        UUID ownerUuid = getDataOwnerId(userUuid);

        String technologiesStr = projectDTO.getTechnologies() != null 
                ? String.join(",", projectDTO.getTechnologies()) 
                : "";

        Project project = Project.builder()
                .userId(ownerUuid)
                .title(projectDTO.getTitle())
                .description(projectDTO.getDescription())
                .technologies(technologiesStr)
                .link(projectDTO.getLink())
                .startDate(projectDTO.getStartDate())
                .endDate(projectDTO.getEndDate())
                .build();

        Project saved = projectRepository.save(project);
        dashboardService.logActivity(ownerUuid, "PROFILE", "Added project: <strong>" + saved.getTitle() + "</strong>");
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
        UUID ownerUuid = getDataOwnerId(userUuid);

        Skill.ProficiencyLevel proficiency = Skill.ProficiencyLevel.valueOf(
                skillDTO.getProficiency().toUpperCase());

        Skill skill = Skill.builder()
                .userId(ownerUuid)
                .name(skillDTO.getName())
                .proficiency(proficiency)
                .endorsed(0)
                .build();

        Skill saved = skillRepository.save(skill);
        dashboardService.logActivity(ownerUuid, "PROFILE", "Added skill: <strong>" + saved.getName() + "</strong>");
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

    // Quick Task Methods
    public QuickTaskDTO addQuickTaskBySupabaseUid(String supabaseUid, QuickTaskDTO taskDTO) {
        UUID userUuid = UUID.fromString(supabaseUid);
        UUID ownerUuid = getDataOwnerId(userUuid);
        UserProfile userProfile = userProfileRepository.findByUserId(ownerUuid)
                .orElseThrow(() -> new RuntimeException("Profile not found for UUID: " + ownerUuid));

        QuickTask task = QuickTask.builder()
                .userProfile(userProfile)
                .description(taskDTO.getDescription())
                .status("added")
                .priority(taskDTO.getPriority() != null ? taskDTO.getPriority().toLowerCase() : "medium")
                .build();

        QuickTask saved = quickTaskRepository.save(task);
        return convertToQuickTaskDTO(saved);
    }

    public QuickTaskDTO updateQuickTask(Long taskId, QuickTaskDTO taskDTO) {
        QuickTask task = quickTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (taskDTO.getStatus() != null) task.setStatus(taskDTO.getStatus());
        if (taskDTO.getDescription() != null) task.setDescription(taskDTO.getDescription());
        if (taskDTO.getPriority() != null) task.setPriority(taskDTO.getPriority());

        QuickTask saved = quickTaskRepository.save(task);
        return convertToQuickTaskDTO(saved);
    }

    public void deleteQuickTask(Long taskId) {
        quickTaskRepository.deleteById(taskId);
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
                .responsibilities(experience.getResponsibilities())
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
                .cgpa(education.getCgpa())
                .grades(education.getGrades())
                .minor(education.getMinor())
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

    private QuickTaskDTO convertToQuickTaskDTO(QuickTask task) {
        return QuickTaskDTO.builder()
                .id(task.getId())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .build();
    }
}
