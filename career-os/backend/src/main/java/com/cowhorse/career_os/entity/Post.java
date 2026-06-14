package com.cowhorse.career_os.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "posts", schema = "dbo")
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "post_type")
    @Builder.Default
    private String postType = "general";

    @Column(name = "include_in_cv")
    @Builder.Default
    private Boolean includeInCv = false;

    @Column(name = "is_reshare")
    @Builder.Default
    private Boolean isReshare = false;

    @Column(name = "original_post_id")
    private Long originalPostId;

    @Column(name = "is_edited")
    @Builder.Default
    private Boolean isEdited = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @jakarta.persistence.Transient
    private String authorName;
}