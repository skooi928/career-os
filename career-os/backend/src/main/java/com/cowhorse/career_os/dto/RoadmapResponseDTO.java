package com.cowhorse.career_os.dto;

import lombok.Data;
import java.util.List;

@Data
public class RoadmapResponseDTO {

    // List of skill suggestions returned by FastAPI
    private List<SkillSuggestionDTO> suggestions;

    // Optional: a plan object if FastAPI returns structured steps
    private Plan plan;

    // Optional: timeline items if FastAPI returns roadmap entries
    private List<RoadmapItem> timeline;

    @Data
    public static class Plan {
        private List<String> steps;
    }

    @Data
    public static class RoadmapItem {
        private String type;      // "edu", "work", "future"
        private String year;      // e.g. "2020 – 2024"
        private String title;     // e.g. "Software Engineer"
        private String subtitle;  // e.g. "Company XYZ"
        private List<String> tags;
    }
}
