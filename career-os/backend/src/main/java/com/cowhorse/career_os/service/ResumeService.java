package com.cowhorse.career_os.service;

import com.cowhorse.career_os.dto.ResumeDTO;
import com.cowhorse.career_os.dto.RoadmapRequestDTO;
import com.cowhorse.career_os.dto.RoadmapResponseDTO;
import com.cowhorse.career_os.dto.SkillSuggestionDTO;
import com.cowhorse.career_os.entity.*;
import com.cowhorse.career_os.repository.*;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ResumeService {

    // Repositories for saving extracted data
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final UserProfileRepository userProfileRepository;

    // Repositories for new sections added in V4 migration
    private final ResumeLanguageRepository resumeLanguageRepository;
    private final ResumeAwardRepository resumeAwardRepository;
    private final ResumeActivityRepository resumeActivityRepository;
    private final ResumeCertificationRepository resumeCertificationRepository;
    private final ResumeReferenceRepository resumeReferenceRepository;

    private final RestTemplate restTemplate;

    // FastAPI URL from application.properties
    @Value("${ai.service.url:http://127.0.0.1:8000}")
    private String aiServiceUrl;

    //  ====== MAIN METHOD: upload PDF → call FastAPI → save ===========

    public ResumeDTO processAndSaveResume(MultipartFile file, String supabaseUid) throws IOException {

        log.info("Processing resume upload for user: {}", supabaseUid);
        UUID userUuid = UUID.fromString(supabaseUid);

        // 1. Call FastAPI with the PDF file
        ResumeDTO resumeData = callFastApiExtraction(file);
        log.info("FastAPI extraction successful for user: {}", supabaseUid);

        // 2. Update UserProfile with basic info (name, location, bio/summary)
        updateUserProfile(userUuid, resumeData);

        // 3. Clear existing extracted data before saving new
        // This handles re-uploads — user uploads new CV, old data gets replaced
        clearExistingResumeData(userUuid);

        // 4. Save all sections
        saveEducation(userUuid, supabaseUid, resumeData);
        saveExperience(userUuid, supabaseUid, resumeData);
        saveProjects(userUuid, supabaseUid, resumeData);
        saveSkills(userUuid, supabaseUid, resumeData);
        saveLanguages(userUuid, resumeData);
        saveAwards(userUuid, resumeData);
        saveActivities(userUuid, resumeData);
        saveCertifications(userUuid, resumeData);
        saveReferences(userUuid, resumeData);

        log.info("Resume saved successfully for user: {}", supabaseUid);
        return resumeData;
    }

    // ─────────────────────────────────────────────
    // 1. Call FastAPI
    // ─────────────────────────────────────────────

    private ResumeDTO callFastApiExtraction(MultipartFile file) throws IOException {
        String fastApiUrl = aiServiceUrl + "/upload-resume";

        // Build multipart request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<java.util.Map> response = restTemplate.postForEntity(
                    fastApiUrl, requestEntity, java.util.Map.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("FastAPI returned error: " + response.getStatusCode());
            }

            // FastAPI returns { "data": {...}, "extraction_quality": {...} }
            // Extract the "data" field
            Object dataObj = response.getBody().get("data");
            if (dataObj == null) {
                throw new RuntimeException("FastAPI response missing 'data' field");
            }

            // Convert the data map to ResumeDTO
            tools.jackson.databind.ObjectMapper mapper =
                    new tools.jackson.databind.ObjectMapper();
            return mapper.convertValue(dataObj, ResumeDTO.class);

        } catch (Exception e) {
            log.error("FastAPI call failed: {}", e.getMessage());
            throw new RuntimeException("AI extraction failed: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // 2. Update UserProfile
    // ─────────────────────────────────────────────

    private void updateUserProfile(UUID userUuid, ResumeDTO data) {
        userProfileRepository.findByUserId(userUuid).ifPresent(profile -> {
            // Only update fields that are not null in the extracted data
            if (data.getLocation() != null) profile.setLocation(data.getLocation());
            if (data.getSummary() != null)  profile.setBio(data.getSummary());
            if (data.getPhone() != null)    profile.setPhone(data.getPhone());
            userProfileRepository.save(profile);
            log.debug("Updated UserProfile for user: {}", userUuid);
        });
    }

    // ─────────────────────────────────────────────
    // 3. Clear existing data (for re-uploads)
    // ─────────────────────────────────────────────

    private void clearExistingResumeData(UUID userUuid) {
        educationRepository.deleteByUserId(userUuid);
        experienceRepository.deleteByUserId(userUuid);
        projectRepository.deleteByUserId(userUuid);
        skillRepository.deleteByUserId(userUuid);
        resumeLanguageRepository.deleteByUserId(userUuid);
        resumeAwardRepository.deleteByUserId(userUuid);
        resumeActivityRepository.deleteByUserId(userUuid);
        resumeCertificationRepository.deleteByUserId(userUuid);
        resumeReferenceRepository.deleteByUserId(userUuid);
        log.debug("Cleared existing resume data for user: {}", userUuid);
    }

    // ─────────────────────────────────────────────
    // 4. Save each section
    // ─────────────────────────────────────────────

    private void saveEducation(UUID userUuid, String supabaseUid, ResumeDTO data) {
        if (data.getEducation() == null) return;

        for (ResumeDTO.EducationItem item : data.getEducation()) {
            // Parse years into LocalDate — use Jan 1 of the year as default
            LocalDate startDate = parseYear(item.getStartYear(), false);
            LocalDate endDate   = parseYear(item.getYear(), true);

            Education edu = Education.builder()
                    .userId(userUuid)
                    .supabaseUid(supabaseUid)
                    .degree(item.getQualification() != null ? item.getQualification() : "")
                    .institution(item.getInstitution() != null ? item.getInstitution() : "")
                    .field(item.getFieldOfStudy() != null ? item.getFieldOfStudy() : "")
                    .startDate(startDate)
                    .endDate(endDate)
                    .isCurrent(item.getIsCurrent() != null ? item.getIsCurrent() : false)
                    .cgpa(item.getCgpa())
                    .grades(item.getGrades())
                    .minor(item.getMinor())
                    .build();

            educationRepository.save(edu);
        }
        log.debug("Saved {} education records", data.getEducation().size());
    }

    private void saveExperience(UUID userUuid, String supabaseUid, ResumeDTO data) {
        if (data.getExperience() == null) return;

        for (ResumeDTO.ExperienceItem item : data.getExperience()) {
            LocalDate startDate = parseDateString(item.getStartDate(), false);
            LocalDate endDate   = parseDateString(item.getEndDate(), true);

            String[] responsibilitiesArray = null;
            if (item.getResponsibilities() != null && !item.getResponsibilities().isEmpty()) {
                responsibilitiesArray = item.getResponsibilities().toArray(new String[0]);
            }

            Experience exp = Experience.builder()
                    .userId(userUuid)
                    .supabaseUid(supabaseUid)
                    .jobTitle(item.getRole() != null ? item.getRole() : "")
                    .company(item.getCompany() != null ? item.getCompany() : "")
                    .startDate(startDate)
                    .endDate(endDate)
                    .isCurrent(item.getIsCurrent() != null ? item.getIsCurrent() : false)
                    .description(item.getDescription())
                    .responsibilities(responsibilitiesArray)   // ← now saves as array
                    .build();

            experienceRepository.save(exp);
        }
        log.debug("Saved {} experience records", data.getExperience().size());
    }

    private void saveProjects(UUID userUuid, String supabaseUid, ResumeDTO data) {
        if (data.getProjects() == null) return;

        for (ResumeDTO.ProjectItem item : data.getProjects()) {
            // Prefer tools_and_methods, fall back to technologies
            List<String> techList = item.getToolsAndMethods() != null && !item.getToolsAndMethods().isEmpty()
                    ? item.getToolsAndMethods()
                    : item.getTechnologies();

            String technologiesStr = (techList != null && !techList.isEmpty())
                    ? String.join(",", techList) : "";

            // Parse year to LocalDate
            LocalDate startDate = parseYear(item.getYear(), false);

            Project project = Project.builder()
                    .userId(userUuid)
                    .supabaseUid(supabaseUid)
                    .title(item.getTitle() != null ? item.getTitle() : "")
                    .description(item.getDescription())
                    .technologies(technologiesStr)
                    .link(item.getUrl())
                    .startDate(startDate)
                    .endDate(null)
                    .build();

            projectRepository.save(project);
        }
        log.debug("Saved {} projects", data.getProjects().size());
    }

    private void saveSkills(UUID userUuid, String supabaseUid, ResumeDTO data) {
        if (data.getSkills() == null) return;

        for (ResumeDTO.SkillItem item : data.getSkills()) {
            if (item.getName() == null) continue;

            // Map category to Skill.ProficiencyLevel
            // Your teammate used BEGINNER/INTERMEDIATE/ADVANCED/EXPERT
            // We default to INTERMEDIATE for extracted skills since we don't have level info
            Skill skill = Skill.builder()
                    .userId(userUuid)
                    .supabaseUid(supabaseUid)
                    .name(item.getName())
                    .proficiency(Skill.ProficiencyLevel.INTERMEDIATE)
                    .endorsed(0)
                    .build();

            skillRepository.save(skill);
        }
        log.debug("Saved {} skills", data.getSkills().size());
    }

    private void saveLanguages(UUID userUuid, ResumeDTO data) {
        if (data.getHumanLanguages() == null) return;

        for (ResumeDTO.LanguageItem item : data.getHumanLanguages()) {
            if (item.getName() == null) continue;
            ResumeLanguage lang = ResumeLanguage.builder()
                    .userId(userUuid)
                    .name(item.getName())
                    .proficiency(item.getProficiency())
                    .rawScore(item.getRawScore())
                    .build();
            resumeLanguageRepository.save(lang);
        }
        log.debug("Saved {} languages", data.getHumanLanguages().size());
    }

    private void saveAwards(UUID userUuid, ResumeDTO data) {
        if (data.getAwards() == null) return;

        for (ResumeDTO.AwardItem item : data.getAwards()) {
            if (item.getTitle() == null) continue;
            ResumeAward award = ResumeAward.builder()
                    .userId(userUuid)
                    .title(item.getTitle())
                    .issuer(item.getIssuer())
                    .year(item.getYear())
                    .level(item.getLevel())
                    .build();
            resumeAwardRepository.save(award);
        }
        log.debug("Saved {} awards", data.getAwards().size());
    }

    private void saveActivities(UUID userUuid, ResumeDTO data) {
        if (data.getActivities() == null) return;

        for (ResumeDTO.ActivityItem item : data.getActivities()) {
            if (item.getTitle() == null) continue;
            ResumeActivity activity = ResumeActivity.builder()
                    .userId(userUuid)
                    .title(item.getTitle())
                    .organization(item.getOrganization())
                    .role(item.getRole())
                    .year(item.getYear())
                    .duration(item.getDuration())
                    .description(item.getDescription())
                    .build();
            resumeActivityRepository.save(activity);
        }
        log.debug("Saved {} activities", data.getActivities().size());
    }

    private void saveCertifications(UUID userUuid, ResumeDTO data) {
        if (data.getCertifications() == null) return;

        for (ResumeDTO.CertificationItem item : data.getCertifications()) {
            if (item.getName() == null) continue;
            ResumeCertification cert = ResumeCertification.builder()
                    .userId(userUuid)
                    .name(item.getName())
                    .issuer(item.getIssuer())
                    .year(item.getYear())
                    .expiry(item.getExpiry())
                    .credentialId(item.getCredentialId())
                    .build();
            resumeCertificationRepository.save(cert);
        }
        log.debug("Saved {} certifications", data.getCertifications().size());
    }

    private void saveReferences(UUID userUuid, ResumeDTO data) {
        if (data.getReferences() == null) return;

        for (ResumeDTO.ReferenceItem item : data.getReferences()) {
            if (item.getName() == null) continue;
            ResumeReference ref = ResumeReference.builder()
                    .userId(userUuid)
                    .name(item.getName())
                    .title(item.getTitle())
                    .organization(item.getOrganization())
                    .email(item.getEmail())
                    .phone(item.getPhone())
                    .build();
            resumeReferenceRepository.save(ref);
        }
        log.debug("Saved {} references", data.getReferences().size());
    }

    // ─────────────────────────────────────────────
    // DATE HELPERS
    // ─────────────────────────────────────────────

    /**
     * Parse a 4-digit year string into LocalDate.
     * endOfYear=true returns Dec 31, false returns Jan 1.
     */
    private LocalDate parseYear(String yearStr, boolean endOfYear) {
        if (yearStr == null || yearStr.isBlank()) {
            return endOfYear ? null : LocalDate.now();
        }
        try {
            // Extract first 4-digit number found
            String digits = yearStr.replaceAll(".*?(\\d{4}).*", "$1");
            int year = Integer.parseInt(digits);
            return endOfYear ? LocalDate.of(year, 12, 31) : LocalDate.of(year, 1, 1);
        } catch (Exception e) {
            log.warn("Could not parse year: {}", yearStr);
            return endOfYear ? null : LocalDate.now();
        }
    }

    /**
     * Parse date strings like "April 2022", "Jul 2023", "2022-04-01".
     * Falls back to parseYear if month can't be determined.
     */
    private LocalDate parseDateString(String dateStr, boolean endOfYear) {
        if (dateStr == null || dateStr.isBlank()) {
            return endOfYear ? null : LocalDate.now();
        }
        // Try full date parse first
        try {
            return LocalDate.parse(dateStr);
        } catch (Exception ignored) {}

        // Try "Month YYYY" format
        String[] monthNames = {"january","february","march","april","may","june",
                "july","august","september","october","november","december"};
        String lower = dateStr.toLowerCase();
        for (int i = 0; i < monthNames.length; i++) {
            if (lower.contains(monthNames[i]) || lower.contains(monthNames[i].substring(0,3))) {
                try {
                    String digits = dateStr.replaceAll(".*?(\\d{4}).*", "$1");
                    int year = Integer.parseInt(digits);
                    int month = i + 1;
                    int day = endOfYear ? java.time.YearMonth.of(year, month).lengthOfMonth() : 1;
                    return LocalDate.of(year, month, day);
                } catch (Exception ignored) {}
            }
        }
        // Fall back to year only
        return parseYear(dateStr, endOfYear);
    }
    public RoadmapResponseDTO generateRoadmap(
            RoadmapRequestDTO request
    ) {

        String fastApiUrl = aiServiceUrl + "/roadmap/generate";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<RoadmapRequestDTO> entity =
                new HttpEntity<>(request, headers);

        ResponseEntity<RoadmapResponseDTO> response =
                restTemplate.exchange(
                        fastApiUrl,
                        HttpMethod.POST,
                        entity,
                        RoadmapResponseDTO.class
                );
        log.info("FastAPI raw response: {}", response.getBody());

        return response.getBody();
    }
}