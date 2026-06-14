package com.cowhorse.career_os.dto;

import lombok.*;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class PostMediaDTO {
    private Long id;
    private String url;
    private String mediaType;   // image, pdf, video
    private String fileName;
    private Long fileSize;
}