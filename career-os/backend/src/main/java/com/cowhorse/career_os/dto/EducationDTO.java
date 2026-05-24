package com.cowhorse.career_os.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationDTO {
    private Long id;
    private String degree;
    private String institution;
    private String field;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean current;
}
