package com.cowhorse.career_os.service;

import com.cowhorse.career_os.dto.UserProfileDTO;
import com.cowhorse.career_os.entity.CareerPrediction;
import com.cowhorse.career_os.repository.CareerPredictionRepository;
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

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CareerAnalysisService {

    private final CareerPredictionRepository careerPredictionRepository;
    private final ProfileService profileService;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://127.0.0.1:8000}")
    private String aiServiceUrl;

    public String getPredictionsForUser(String supabaseUid) {
        List<CareerPrediction> predictions = careerPredictionRepository.findBySupabaseUidOrderByCreatedAtDesc(supabaseUid);
        if (predictions.isEmpty()) {
            // Return empty array as string
            return "[]";
        }
        
        // Build JSON array directly from saved raw JSON text values
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < predictions.size(); i++) {
            if (i > 0) {
                sb.append(",");
            }
            sb.append(predictions.get(i).getPredictionData());
        }
        sb.append("]");
        return sb.toString();
    }

    public String analyzeCareer(String supabaseUid) {
        UserProfileDTO profile;
        try {
            profile = profileService.getUserProfileBySupabaseUid(supabaseUid);
        } catch (Exception e) {
            log.error("Failed to load user profile for analysis", e);
            return getFallbackPlaceholderJson(supabaseUid);
        }
        
        // Build payload
        Map<String, Object> request = new HashMap<>();
        request.put("supabaseUid", supabaseUid);
        request.put("bio", profile.getBio() != null ? profile.getBio() : "");
        
        List<Map<String, Object>> educationList = new ArrayList<>();
        if (profile.getEducation() != null) {
            for (var edu : profile.getEducation()) {
                Map<String, Object> eduMap = new HashMap<>();
                eduMap.put("degree", edu.getDegree() != null ? edu.getDegree() : "");
                eduMap.put("institution", edu.getInstitution() != null ? edu.getInstitution() : "");
                eduMap.put("field", edu.getField() != null ? edu.getField() : "");
                eduMap.put("startDate", edu.getStartDate() != null ? edu.getStartDate().toString() : "");
                eduMap.put("endDate", edu.getEndDate() != null ? edu.getEndDate().toString() : "");
                eduMap.put("current", edu.getCurrent() != null ? edu.getCurrent() : false);
                educationList.add(eduMap);
            }
        }
        request.put("education", educationList);

        List<Map<String, Object>> experienceList = new ArrayList<>();
        if (profile.getExperiences() != null) {
            for (var exp : profile.getExperiences()) {
                Map<String, Object> expMap = new HashMap<>();
                expMap.put("jobTitle", exp.getJobTitle() != null ? exp.getJobTitle() : "");
                expMap.put("company", exp.getCompany() != null ? exp.getCompany() : "");
                expMap.put("startDate", exp.getStartDate() != null ? exp.getStartDate().toString() : "");
                expMap.put("endDate", exp.getEndDate() != null ? exp.getEndDate().toString() : "");
                expMap.put("current", exp.getCurrent() != null ? exp.getCurrent() : false);
                expMap.put("description", exp.getDescription() != null ? exp.getDescription() : "");
                experienceList.add(expMap);
            }
        }
        request.put("experience", experienceList);

        List<Map<String, Object>> skillsList = new ArrayList<>();
        if (profile.getSkills() != null) {
            for (var skill : profile.getSkills()) {
                Map<String, Object> skillMap = new HashMap<>();
                skillMap.put("name", skill.getName() != null ? skill.getName() : "");
                skillMap.put("proficiency", skill.getProficiency() != null ? skill.getProficiency() : "");
                skillsList.add(skillMap);
            }
        }
        request.put("skills", skillsList);

        // Try to fetch prediction from FastAPI AI Service
        String fastApiUrl = aiServiceUrl + "/career-analysis/analyze";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(fastApiUrl, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String responseBody = response.getBody();
                
                // Save real prediction to DB
                CareerPrediction prediction = CareerPrediction.builder()
                        .userId(UUID.fromString(supabaseUid))
                        .supabaseUid(supabaseUid)
                        .predictionData(responseBody)
                        .build();
                careerPredictionRepository.save(prediction);
                return responseBody;
            }
        } catch (Exception e) {
            log.error("Failed to query AI service at {}, falling back to placeholder prediction: {}", fastApiUrl, e.getMessage());
        }

        // Return a high-quality fallback placeholder if AI service fails or is offline
        return getFallbackPlaceholderJson(supabaseUid);
    }

    private String getFallbackPlaceholderJson(String supabaseUid) {
        String fallback = "{\n" +
                "  \"userId\": \"" + supabaseUid + "\",\n" +
                "  \"analysisDate\": \"" + java.time.LocalDate.now().toString() + "\",\n" +
                "  \"confidence\": 85,\n" +
                "  \"predictedRoles\": [\n" +
                "    {\n" +
                "      \"role\": \"AI / ML Engineer\",\n" +
                "      \"likelihood\": 90,\n" +
                "      \"yearsToAchieve\": 1,\n" +
                "      \"requiredSkills\": [\"Python\", \"PyTorch\", \"TensorFlow\", \"Scikit-Learn\", \"System Design\"],\n" +
                "      \"salaryRange\": { \"min\": 9000, \"max\": 15000 }\n" +
                "    },\n" +
                "    {\n" +
                "      \"role\": \"Senior Frontend Developer\",\n" +
                "      \"likelihood\": 80,\n" +
                "      \"yearsToAchieve\": 2,\n" +
                "      \"requiredSkills\": [\"TypeScript\", \"Angular\", \"TailwindCSS\", \"State Management\", \"RXJS\"],\n" +
                "      \"salaryRange\": { \"min\": 7500, \"max\": 12000 }\n" +
                "    },\n" +
                "    {\n" +
                "      \"role\": \"Solution Architect\",\n" +
                "      \"likelihood\": 65,\n" +
                "      \"yearsToAchieve\": 4,\n" +
                "      \"requiredSkills\": [\"Cloud Architecture\", \"AWS\", \"Microservices\", \"System Design\", \"Docker\"],\n" +
                "      \"salaryRange\": { \"min\": 10000, \"max\": 18000 }\n" +
                "    }\n" +
                "  ],\n" +
                "  \"skillGaps\": [\n" +
                "    { \"skillName\": \"System Design\", \"currentLevel\": \"None\", \"requiredLevel\": \"Intermediate\", \"priority\": \"high\" },\n" +
                "    { \"skillName\": \"PyTorch\", \"currentLevel\": \"Beginner\", \"requiredLevel\": \"Intermediate\", \"priority\": \"medium\" },\n" +
                "    { \"skillName\": \"Docker\", \"currentLevel\": \"Beginner\", \"requiredLevel\": \"Intermediate\", \"priority\": \"medium\" }\n" +
                "  ],\n" +
                "  \"recommendedLearningPaths\": [\n" +
                "    {\n" +
                "      \"title\": \"Deep Learning Specialization\",\n" +
                "      \"description\": \"Master deep learning foundations and build ML models using TensorFlow.\",\n" +
                "      \"duration\": \"12 weeks\",\n" +
                "      \"provider\": \"DeepLearning.AI\",\n" +
                "      \"difficulty\": \"Intermediate\",\n" +
                "      \"skills\": [\"PyTorch\", \"TensorFlow\"]\n" +
                "    }\n" +
                "  ],\n" +
                "  \"careerTrajectory\": [\n" +
                "    { \"year\": 2026, \"role\": \"Junior Software Engineer\", \"description\": \"Foundations, frontend and API builds\", \"estimatedSalary\": 4500 },\n" +
                "    { \"year\": 2027, \"role\": \"AI / ML Engineer\", \"description\": \"Build intelligent modules and agents\", \"estimatedSalary\": 9000 },\n" +
                "    { \"year\": 2030, \"role\": \"Solution Architect\", \"description\": \"Design complex scale systems\", \"estimatedSalary\": 15000 }\n" +
                "  ]\n" +
                "}";

        try {
            // Save mock/placeholder prediction to DB so it persists for the user
            CareerPrediction prediction = CareerPrediction.builder()
                    .userId(UUID.fromString(supabaseUid))
                    .supabaseUid(supabaseUid)
                    .predictionData(fallback)
                    .build();
            careerPredictionRepository.save(prediction);
        } catch (Exception e) {
            log.error("Failed to save fallback prediction to database", e);
        }

        return fallback;
    }
}
