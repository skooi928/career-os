package com.cowhorse.career_os.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class CommentDTO {
    private Long id;
    private Long postId;
    private UUID userId;
    private String authorName;
    private String authorInitials;
    private String content;
    private Long parentCommentId;
    private List<CommentDTO> replies;
    private Boolean isEdited;
    private LocalDateTime createdAt;
}