package com.cowhorse.career_os.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProfileResponse {
    private String token;
    private String email;
    private String firstName;
    private String lastName;
    private String userId;
    private UserProfileDTO profile;
}
