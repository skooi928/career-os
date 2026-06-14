package com.cowhorse.career_os.service;

import com.cowhorse.career_os.dto.UserProfileDTO;
import com.cowhorse.career_os.entity.Badge;
import com.cowhorse.career_os.entity.FairPayAnalysis;
import com.cowhorse.career_os.entity.Job;
import com.cowhorse.career_os.entity.UserBadge;
import com.cowhorse.career_os.repository.BadgeRepository;
import com.cowhorse.career_os.repository.FairPayAnalysisRepository;
import com.cowhorse.career_os.repository.JobRepository;
import com.cowhorse.career_os.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FairPayService {

    private final FairPayAnalysisRepository fairPayAnalysisRepository;
    private final JobRepository jobRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final ProfileService profileService;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://127.0.0.1:8000}")
    private String aiServiceUrl;

    public String analyze(String supabaseUid, String jobTitle, String location, String employmentType) {
        // Load user profile
        UserProfileDTO profile = null;
        try {
            profile = profileService.getUserProfileBySupabaseUid(supabaseUid);
        } catch (Exception e) {
            log.warn("Could not load profile for fair pay analysis: {}", e.getMessage());
        }

        // Load user badges -> badge names
        List<String> badgeNames = new ArrayList<>();
        try {
            UUID userUuid = UUID.fromString(supabaseUid);
            List<UserBadge> userBadges = userBadgeRepository.findByUserId(userUuid);
            for (UserBadge ub : userBadges) {
                badgeRepository.findById(ub.getBadgeId()).ifPresent(b -> badgeNames.add(b.getName()));
            }
        } catch (Exception e) {
            log.warn("Could not load badges for fair pay analysis: {}", e.getMessage());
        }

        // Find market jobs matching job title (case-insensitive, up to 20 jobs)
        List<Job> allJobs = jobRepository.findAllByOrderByCreatedAtDesc();
        String titleLower = jobTitle.toLowerCase();
        List<Job> matchedJobs = allJobs.stream()
                .filter(j -> j.getTitle() != null && j.getTitle().toLowerCase().contains(titleLower))
                .limit(20)
                .collect(Collectors.toList());

        // Build market_jobs payload
        List<Map<String, Object>> marketJobs = new ArrayList<>();
        for (Job job : matchedJobs) {
            Map<String, Object> jMap = new HashMap<>();
            jMap.put("title", job.getTitle());
            jMap.put("company", job.getCompany());
            jMap.put("location", job.getLocation());
            jMap.put("employment_type", job.getEmploymentType());
            jMap.put("min_salary", job.getMinSalary());
            jMap.put("max_salary", job.getMaxSalary());
            List<String> benefits = new ArrayList<>();
            if (job.getBenefits() != null) {
                for (var b : job.getBenefits()) {
                    benefits.add(b.getBenefitText());
                }
            }
            jMap.put("benefits", benefits);
            // seniority from role requirements
            List<String> seniorities = new ArrayList<>();
            if (job.getRoleRequirements() != null) {
                for (var rr : job.getRoleRequirements()) {
                    seniorities.add(rr.getSeniorityLevel() + " (" + rr.getRequiredExperienceYears() + "yrs)");
                }
            }
            jMap.put("seniority_levels", seniorities);
            marketJobs.add(jMap);
        }

        // Build user profile section
        Map<String, Object> userProfilePayload = new HashMap<>();
        if (profile != null) {
            userProfilePayload.put("location", profile.getLocation() != null ? profile.getLocation() : "");
            List<Map<String, String>> skills = new ArrayList<>();
            if (profile.getSkills() != null) {
                for (var s : profile.getSkills()) {
                    Map<String, String> sm = new HashMap<>();
                    sm.put("name", s.getName() != null ? s.getName() : "");
                    sm.put("proficiency", s.getProficiency() != null ? s.getProficiency() : "");
                    skills.add(sm);
                }
            }
            userProfilePayload.put("skills", skills);
            List<Map<String, Object>> experiences = new ArrayList<>();
            if (profile.getExperiences() != null) {
                for (var exp : profile.getExperiences()) {
                    Map<String, Object> em = new HashMap<>();
                    em.put("jobTitle", exp.getJobTitle() != null ? exp.getJobTitle() : "");
                    em.put("company", exp.getCompany() != null ? exp.getCompany() : "");
                    em.put("startDate", exp.getStartDate() != null ? exp.getStartDate().toString() : "");
                    em.put("endDate", exp.getEndDate() != null ? exp.getEndDate().toString() : "");
                    em.put("current", exp.getCurrent() != null ? exp.getCurrent() : false);
                    experiences.add(em);
                }
            }
            userProfilePayload.put("experiences", experiences);
            List<Map<String, String>> educations = new ArrayList<>();
            if (profile.getEducation() != null) {
                for (var edu : profile.getEducation()) {
                    Map<String, String> edm = new HashMap<>();
                    edm.put("degree", edu.getDegree() != null ? edu.getDegree() : "");
                    edm.put("institution", edu.getInstitution() != null ? edu.getInstitution() : "");
                    edm.put("field", edu.getField() != null ? edu.getField() : "");
                    educations.add(edm);
                }
            }
            userProfilePayload.put("education", educations);
        }
        userProfilePayload.put("badges", badgeNames);

        // Build final request payload
        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("job_title", jobTitle);
        requestPayload.put("location", location != null ? location : "");
        requestPayload.put("employment_type", employmentType != null ? employmentType : "");
        requestPayload.put("user_profile", userProfilePayload);
        requestPayload.put("market_jobs", marketJobs);

        String resultJson;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceUrl + "/fair-pay/analyze", entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                resultJson = response.getBody();
            } else {
                resultJson = buildFallbackResult(jobTitle, matchedJobs);
            }
        } catch (Exception e) {
            log.error("Fair pay AI service call failed: {}", e.getMessage());
            resultJson = buildFallbackResult(jobTitle, matchedJobs);
        }

        // Evict old cache for this user+title then save new
        try {
            fairPayAnalysisRepository.deleteBySupabaseUidAndJobTitleIgnoreCase(supabaseUid, jobTitle);
        } catch (Exception e) {
            log.warn("Could not evict old fair pay cache: {}", e.getMessage());
        }
        FairPayAnalysis analysis = FairPayAnalysis.builder()
                .supabaseUid(supabaseUid)
                .jobTitle(jobTitle)
                .location(location)
                .employmentType(employmentType)
                .resultJson(resultJson)
                .build();
        fairPayAnalysisRepository.save(analysis);

        return resultJson;
    }

    public String getHistory(String supabaseUid) {
        List<FairPayAnalysis> history = fairPayAnalysisRepository
                .findBySupabaseUidOrderByCreatedAtDesc(supabaseUid);
        if (history.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < history.size(); i++) {
            if (i > 0) sb.append(",");
            FairPayAnalysis a = history.get(i);
            sb.append("{");
            sb.append("\"id\":\"").append(a.getId()).append("\",");
            sb.append("\"jobTitle\":\"").append(escapeJson(a.getJobTitle())).append("\",");
            sb.append("\"location\":\"").append(escapeJson(a.getLocation() != null ? a.getLocation() : "")).append("\",");
            sb.append("\"employmentType\":\"").append(escapeJson(a.getEmploymentType() != null ? a.getEmploymentType() : "")).append("\",");
            sb.append("\"createdAt\":\"").append(a.getCreatedAt()).append("\",");
            sb.append("\"result\":").append(a.getResultJson());
            sb.append("}");
        }
        sb.append("]");
        return sb.toString();
    }

    private String buildFallbackResult(String jobTitle, List<Job> matchedJobs) {
        int minSalary = 3000, maxSalary = 8000, avgSalary = 5500;
        if (!matchedJobs.isEmpty()) {
            int totalMin = 0, totalMax = 0;
            for (Job j : matchedJobs) {
                totalMin += j.getMinSalary() != null ? j.getMinSalary() : 0;
                totalMax += j.getMaxSalary() != null ? j.getMaxSalary() : 0;
            }
            minSalary = totalMin / matchedJobs.size();
            maxSalary = totalMax / matchedJobs.size();
            avgSalary = (minSalary + maxSalary) / 2;
        }
        return String.format("""
            {
              "min_salary": %d,
              "avg_salary": %d,
              "max_salary": %d,
              "currency": "MYR",
              "market_competitiveness_score": 65,
              "percentile": 50,
              "benefits_value_estimate": 1000,
              "compensation_breakdown": {
                "base": %d,
                "benefits": 1000,
                "total_package": %d
              },
              "salary_explanation": "Estimated salary range for %s based on %d similar job postings on the platform. AI analysis unavailable — showing market averages.",
              "skills_to_increase_salary": [
                {"skill": "Cloud Computing (AWS/Azure)", "impact": "Can increase salary by 15-20%%"},
                {"skill": "Data Analysis", "impact": "Can increase salary by 10-15%%"},
                {"skill": "Project Management", "impact": "Can increase salary by 8-12%%"}
              ],
              "certifications_to_increase_salary": ["AWS Certified Solutions Architect", "PMP", "Google Cloud Professional"],
              "comparison_summary": "Your profile aligns with mid-market compensation for this role. Adding cloud or data skills can improve your position.",
              "ai_available": false
            }
            """, minSalary, avgSalary, maxSalary, avgSalary, avgSalary + 1000,
                escapeJson(jobTitle), matchedJobs.size());
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
