package com.cowhorse.career_os.dto;

import lombok.*;
import java.util.List;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class CreatePostRequest {
    private String content;
    private String postType;          // general, achievement, project, learning, hiring
    private Boolean includeInCv;
    private List<PostMediaDTO> media; // URLs already uploaded to Supabase Storage
    private Long reshareOfPostId;     // set if this is a reshare
}