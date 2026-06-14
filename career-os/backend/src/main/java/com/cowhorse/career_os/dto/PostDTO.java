package com.cowhorse.career_os.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class PostDTO {
    private Long id;
    private UUID userId;
    private String authorName;
    private String authorInitials;
    private String content;
    private String postType;
    private Boolean includeInCv;
    private Boolean isReshare;
    private Long originalPostId;
    private PostDTO originalPost;          // populated for reshares
    private Boolean isEdited;
    private List<PostMediaDTO> media;
    private long likeCount;
    private long commentCount;
    private long reshareCount;
    private boolean likedByCurrentUser;
    private boolean resharedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}