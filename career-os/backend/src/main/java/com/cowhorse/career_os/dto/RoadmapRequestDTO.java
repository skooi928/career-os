package com.cowhorse.career_os.dto;

import lombok.Data;
import java.util.List;

@Data
public class RoadmapRequestDTO {

    private String targetRole;
    private List<String> currentSkills;
    private List<String> education;
    private List<String> experience;
    private String bio;
}