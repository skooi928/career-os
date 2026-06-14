package com.cowhorse.career_os.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class NetworkDTO {
    private Long id;
    private UUID requesterId;
    private UUID addresseeId;
    private String requesterName;
    private String addresseeName;
    private String status;           // pending, accepted, declined
    private LocalDateTime createdAt;
}