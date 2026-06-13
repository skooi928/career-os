package com.cowhorse.career_os.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class NotificationDTO {
    private Long id;
    private UUID actorId;
    private String actorName;
    private String actorInitials;
    private String type;             // like, comment, reshare, network_request, network_accepted
    private Long postId;
    private Long commentId;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}