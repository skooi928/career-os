package com.cowhorse.career_os.service;

import com.cowhorse.career_os.dto.*;
import com.cowhorse.career_os.entity.*;
import com.cowhorse.career_os.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;

    // ==================== Email-based Methods ====================

    // User Profile Methods
    public UserProfileDTO getUserProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return getUserProfile(user.getId());
    }

    public UserProfileDTO updateUserProfileByEmail(String email, UserProfileDTO profileDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return updateUserProfile(user.getId(), profileDTO);
    }

    // Experience Methods
    public ExperienceDTO addExperienceByEmail(String email, ExperienceDTO experienceDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return addExperience(user.getId(), experienceDTO);
    }

    // Education Methods
    public EducationDTO addEducationByEmail(String email, EducationDTO educationDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return addEducation(user.getId(), educationDTO);
    }

    // Project Methods
    public ProjectDTO addProjectByEmail(String email, ProjectDTO projectDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return addProject(user.getId(), projectDTO);
    }

    // Skill Methods
    public SkillDTO addSkillByEmail(String email, SkillDTO skillDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return addSkill(user.getId(), skillDTO);
    }

    // ==================== ID-based Methods (existing) ====================

    // User Profile Methods
    public UserProfileDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElse(null);

        List<ExperienceDTO> experiences = experienceRepository.findByUserId(userId)
                .stream().map(this::convertToExperienceDTO).collect(Collectors.toList());

        List<EducationDTO> education = educationRepository.findByUserId(userId)
                .stream().map(this::convertToEducationDTO).collect(Collectors.toList());

        List<ProjectDTO> projects = projectRepository.findByUserId(userId)
                .stream().map(this::convertToProjectDTO).collect(Collectors.toList());

        List<SkillDTO> skills = skillRepository.findByUserId(userId)
                .stream().map(this::convertToSkillDTO).collect(Collectors.toList());

        return UserProfileDTO.builder()
                .id(userProfile != null ? userProfile.getId() : null)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(userProfile != null ? userProfile.getPhone() : null)
                .location(userProfile != null ? userProfile.getLocation() : null)
                .bio(userProfile != null ? userProfile.getBio() : null)
                .profileImageUrl(userProfile != null ? userProfile.getProfileImageUrl() : null)
                .experiences(experiences)
                .education(education)
                .projects(projects)
                .skills(skills)
                .build();
    }

    public UserProfileDTO updateUserProfile(Long userId, UserProfileDTO profileDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElse(UserProfile.builder().user(user).build());

        userProfile.setPhone(profileDTO.getPhone());
        userProfile.setLocation(profileDTO.getLocation());
        userProfile.setBio(profileDTO.getBio());
        userProfile.setProfileImageUrl(profileDTO.getProfileImageUrl());

        userProfileRepository.save(userProfile);
        return getUserProfile(userId);
    }

    // Experience Methods
    public ExperienceDTO addExperience(Long userId, ExperienceDTO experienceDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Experience experience = Experience.builder()
                .user(user)
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
    public EducationDTO addEducation(Long userId, EducationDTO educationDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Education education = Education.builder()
                .user(user)
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
    public ProjectDTO addProject(Long userId, ProjectDTO projectDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String technologiesStr = projectDTO.getTechnologies() != null 
                ? String.join(",", projectDTO.getTechnologies()) 
                : "";

        Project project = Project.builder()
                .user(user)
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
    public SkillDTO addSkill(Long userId, SkillDTO skillDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Skill.ProficiencyLevel proficiency = Skill.ProficiencyLevel.valueOf(
                skillDTO.getProficiency().toUpperCase());

        Skill skill = Skill.builder()
                .user(user)
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
        List<String> technologies = project.getTechnologies() != null 
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

    // ==================== Supabase UID-based Methods ====================

    // Create profile for Supabase user after signup
    public UserProfileDTO createProfileForSupabaseUser(String supabaseUid, String email, String firstName, String lastName) {
        // Check if profile already exists
        UserProfile existing = userProfileRepository.findBySupabaseUid(supabaseUid).orElse(null);
        if (existing != null) {
            return getUserProfileBySupabaseUid(supabaseUid);
        }

        // Create new UserProfile for Supabase user
        UserProfile userProfile = UserProfile.builder()
                .supabaseUid(supabaseUid)
                .phone(null)
                .location(null)
                .bio("Add your professional bio here...")
                .profileImageUrl(null)
                .build();

        userProfileRepository.save(userProfile);

        return UserProfileDTO.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .phone(null)
                .location(null)
                .bio("Add your professional bio here...")
                .profileImageUrl(null)
                .experiences(List.of())
                .education(List.of())
                .projects(List.of())
                .skills(List.of())
                .build();
    }

    // User Profile Methods - Supabase UID based
    public UserProfileDTO getUserProfileBySupabaseUid(String supabaseUid) {
        UserProfile userProfile = userProfileRepository.findBySupabaseUid(supabaseUid)
                .orElseThrow(() -> new RuntimeException("Profile not found for UID: " + supabaseUid));

        List<ExperienceDTO> experiences = experienceRepository.findBySupabaseUid(supabaseUid)
                .stream().map(this::convertToExperienceDTO).collect(Collectors.toList());

        List<EducationDTO> education = educationRepository.findBySupabaseUid(supabaseUid)
                .stream().map(this::convertToEducationDTO).collect(Collectors.toList());

        List<ProjectDTO> projects = projectRepository.findBySupabaseUid(supabaseUid)
                .stream().map(this::convertToProjectDTO).collect(Collectors.toList());

        List<SkillDTO> skills = skillRepository.findBySupabaseUid(supabaseUid)
                .stream().map(this::convertToSkillDTO).collect(Collectors.toList());

        return UserProfileDTO.builder()
                .id(userProfile.getId())
                .firstName("") // Will be populated by frontend from AuthService
                .lastName("")  // Will be populated by frontend from AuthService
                .email("")     // Will be populated by frontend from AuthService
                .phone(userProfile.getPhone())
                .location(userProfile.getLocation())
                .bio(userProfile.getBio())
                .profileImageUrl(userProfile.getProfileImageUrl())
                .experiences(experiences)
                .education(education)
                .projects(projects)
                .skills(skills)
                .build();
    }

    public UserProfileDTO updateUserProfileBySupabaseUid(String supabaseUid, UserProfileDTO profileDTO) {
        UserProfile userProfile = userProfileRepository.findBySupabaseUid(supabaseUid)
                .orElseThrow(() -> new RuntimeException("Profile not found for UID: " + supabaseUid));

        userProfile.setPhone(profileDTO.getPhone());
        userProfile.setLocation(profileDTO.getLocation());
        userProfile.setBio(profileDTO.getBio());
        userProfile.setProfileImageUrl(profileDTO.getProfileImageUrl());

        userProfileRepository.save(userProfile);

        return getUserProfileBySupabaseUid(supabaseUid);
    }

    // Experience Methods - Supabase UID based
    public ExperienceDTO addExperienceBySupabaseUid(String supabaseUid, ExperienceDTO experienceDTO) {
        UserProfile userProfile = userProfileRepository.findBySupabaseUid(supabaseUid)
                .orElseThrow(() -> new RuntimeException("Profile not found for UID: " + supabaseUid));

        Experience experience = Experience.builder()
                .supabaseUid(supabaseUid)
                .jobTitle(experienceDTO.getJobTitle())
                .company(experienceDTO.getCompany())
                .startDate(experienceDTO.getStartDate())
                .endDate(experienceDTO.getEndDate())
                .isCurrent(experienceDTO.getCurrent())
                .description(experienceDTO.getDescription())
                .build();

        Experience saved = experienceRepository.save(experience);
        return convertToExperienceDTO(saved);
    }

    // Education Methods - Supabase UID based
    public EducationDTO addEducationBySupabaseUid(String supabaseUid, EducationDTO educationDTO) {
        UserProfile userProfile = userProfileRepository.findBySupabaseUid(supabaseUid)
                .orElseThrow(() -> new RuntimeException("Profile not found for UID: " + supabaseUid));

        Education education = Education.builder()
                .supabaseUid(supabaseUid)
                .degree(educationDTO.getDegree())
                .institution(educationDTO.getInstitution())
                .field(educationDTO.getField())
                .startDate(educationDTO.getStartDate())
                .endDate(educationDTO.getEndDate())
                .isCurrent(educationDTO.getCurrent())
                .build();

        Education saved = educationRepository.save(education);
        return convertToEducationDTO(saved);
    }

    // Project Methods - Supabase UID based
    public ProjectDTO addProjectBySupabaseUid(String supabaseUid, ProjectDTO projectDTO) {
        UserProfile userProfile = userProfileRepository.findBySupabaseUid(supabaseUid)
                .orElseThrow(() -> new RuntimeException("Profile not found for UID: " + supabaseUid));

        String technologiesStr = projectDTO.getTechnologies() != null 
                ? String.join(",", projectDTO.getTechnologies()) 
                : "";

        Project project = Project.builder()
                .supabaseUid(supabaseUid)
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

    // Skill Methods - Supabase UID based
    public SkillDTO addSkillBySupabaseUid(String supabaseUid, SkillDTO skillDTO) {
        UserProfile userProfile = userProfileRepository.findBySupabaseUid(supabaseUid)
                .orElseThrow(() -> new RuntimeException("Profile not found for UID: " + supabaseUid));

        Skill.ProficiencyLevel proficiency = Skill.ProficiencyLevel.valueOf(
                skillDTO.getProficiency().toUpperCase());

        Skill skill = Skill.builder()
                .supabaseUid(supabaseUid)
                .name(skillDTO.getName())
                .proficiency(proficiency)
                .endorsed(0)
                .build();

        Skill saved = skillRepository.save(skill);
        return convertToSkillDTO(saved);
    }
}
