package com.cowhorse.career_os.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProfileRequest {
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
