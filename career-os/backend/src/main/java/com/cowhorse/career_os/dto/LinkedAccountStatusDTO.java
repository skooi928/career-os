package com.cowhorse.career_os.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkedAccountStatusDTO {
    private boolean linked;
    private String linkedEmail;
    private String linkedRole;
}
