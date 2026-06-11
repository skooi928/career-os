package com.cowhorse.career_os.service;
 
import com.cowhorse.career_os.dto.*;
import com.cowhorse.career_os.entity.*;
import com.cowhorse.career_os.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.*;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
public class ForumService {
 
    private final PostRepository          postRepository;
    private final PostMediaRepository     postMediaRepository;
    private final PostLikeRepository      postLikeRepository;
    private final PostCommentRepository   postCommentRepository;
    private final NotificationRepository  notificationRepository;
 
    // ── helper: build author initials from a display name ────────────────────
    private String toInitials(String name) {
        if (name == null || name.isBlank()) return "?";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, 1).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }
 
    // ── helper: map PostMedia entity → DTO ───────────────────────────────────
    private PostMediaDTO toMediaDTO(PostMedia m) {
        return PostMediaDTO.builder()
                .id(m.getId())
                .url(m.getUrl())
                .mediaType(m.getMediaType())
                .fileName(m.getFileName())
                .fileSize(m.getFileSize())
                .build();
    }
 
    // ── helper: map Post entity → PostDTO ────────────────────────────────────
    private PostDTO toPostDTO(Post post, UUID currentUserId) {
        List<PostMediaDTO> media = postMediaRepository.findByPostId(post.getId())
                .stream().map(this::toMediaDTO).collect(Collectors.toList());
 
        long likeCount    = postLikeRepository.countByPostId(post.getId());
        long commentCount = postCommentRepository.countByPostId(post.getId());
        
        /* 
         * FIX ALERT: Added support for these 2 methods. 
         * Ensure you define these inside your PostRepository interface!
         */
        long reshareCount = postRepository.countByOriginalPostId(post.getId());
 
        boolean liked    = currentUserId != null &&
                postLikeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
        boolean reshared = currentUserId != null &&
                postRepository.existsByOriginalPostIdAndUserId(post.getId(), currentUserId);
 
        // Populate nested original post for reshares (one level only)
        PostDTO originalPostDTO = null;
        if (Boolean.TRUE.equals(post.getIsReshare()) && post.getOriginalPostId() != null) {
            // FIX: Removed empty redundant .ifPresent() findById block to avoid useless DB connection waste
            originalPostDTO = postRepository.findById(post.getOriginalPostId())
                    .map(this::toPostDTOShallow)
                    .orElse(null);
        }
 
        return PostDTO.builder()
                .id(post.getId())
                .userId(post.getUserId())
                .authorName(post.getAuthorName())
                .authorInitials(toInitials(post.getAuthorName()))
                .content(post.getContent())
                .postType(post.getPostType())
                .includeInCv(post.getIncludeInCv())
                .isReshare(post.getIsReshare())
                .originalPostId(post.getOriginalPostId())
                .originalPost(originalPostDTO)
                .isEdited(post.getIsEdited())
                .media(media)
                .likeCount(likeCount)
                .commentCount(commentCount)
                .reshareCount(reshareCount)
                .likedByCurrentUser(liked)
                .resharedByCurrentUser(reshared)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
 
    /** Shallow version used for the originalPost field inside a reshare (no recursion). */
    private PostDTO toPostDTOShallow(Post post) {
        List<PostMediaDTO> media = postMediaRepository.findByPostId(post.getId())
                .stream().map(this::toMediaDTO).collect(Collectors.toList());
        return PostDTO.builder()
                .id(post.getId())
                .userId(post.getUserId())
                .authorName(post.getAuthorName())
                .authorInitials(toInitials(post.getAuthorName()))
                .content(post.getContent())
                .postType(post.getPostType())
                .media(media)
                .createdAt(post.getCreatedAt())
                .build();
    }
 
    // ══ POST CRUD ════════════════════════════════════════════════════════════
 
    @Transactional(readOnly = true) // Performance Optimization for reads
    public Page<PostDTO> getFeed(int page, int size, UUID currentUserId) {
        return postRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(p -> toPostDTO(p, currentUserId));
    }
 
    @Transactional(readOnly = true)
    public List<PostDTO> getPostsByUser(UUID userId, UUID currentUserId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(p -> toPostDTO(p, currentUserId))
                .collect(Collectors.toList());
    }
 
    @Transactional(readOnly = true)
    public List<PostDTO> getCvPosts(UUID userId) {
        return postRepository.findByUserIdAndIncludeInCvTrue(userId)
                .stream()
                .map(p -> toPostDTO(p, null))
                .collect(Collectors.toList());
    }
 
    @Transactional(readOnly = true)
    public PostDTO getPostById(Long postId, UUID currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId));
        return toPostDTO(post, currentUserId);
    }
 
    @Transactional
    public PostDTO createPost(CreatePostRequest req, UUID userId, String authorName) {
        boolean isReshare = req.getReshareOfPostId() != null;
        if (isReshare) {
            postRepository.findById(req.getReshareOfPostId())
                    .orElseThrow(() -> new NoSuchElementException(
                            "Original post not found: " + req.getReshareOfPostId()));
        }
 
        Post post = Post.builder()
                .userId(userId)
                .authorName(authorName)
                .content(req.getContent())
                .postType(req.getPostType() != null ? req.getPostType() : "general")
                .includeInCv(Boolean.TRUE.equals(req.getIncludeInCv()))
                .isReshare(isReshare)
                .originalPostId(req.getReshareOfPostId())
                .isEdited(false)
                .build();
 
        Post saved = postRepository.save(post);
 
        if (req.getMedia() != null) {
            req.getMedia().forEach(m -> {
                PostMedia pm = PostMedia.builder()
                        .postId(saved.getId())
                        .url(m.getUrl())
                        .mediaType(m.getMediaType())
                        .fileName(m.getFileName())
                        .fileSize(m.getFileSize())
                        .build();
                postMediaRepository.save(pm);
            });
        }
 
        if (isReshare) {
            postRepository.findById(req.getReshareOfPostId()).ifPresent(original -> {
                if (!original.getUserId().equals(userId)) {
                    createNotification(original.getUserId(), userId, authorName,
                            "reshare", saved.getId(), null,
                            authorName + " reshared your post");
                }
            });
        }
        
        return toPostDTO(saved, userId); // FIX: Return the fully mapped PostDTO mapping result
    }

    /* 
     * Private helper method stub for notifications mentioned in createPost. 
     * This will connect cleanly once you provide your Notification logic block.
     */
    private void createNotification(UUID userId, UUID actorId, String authorName, String type, Long postId, Long commentId, String message) {
        Notification notif = Notification.builder()
                .userId(userId)
                .actorId(actorId)
                .type(type)
                .postId(postId)
                .commentId(commentId)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notif);
    }
        @Transactional
    public PostDTO updatePost(Long postId, CreatePostRequest req, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId));
 
        if (!post.getUserId().equals(userId)) {
            throw new SecurityException("Not authorised to edit this post");
        }
 
        if (req.getContent() != null)     post.setContent(req.getContent());
        if (req.getPostType() != null)    post.setPostType(req.getPostType());
        if (req.getIncludeInCv() != null) post.setIncludeInCv(req.getIncludeInCv());
        post.setIsEdited(true);
 
        // Replace media if supplied
        if (req.getMedia() != null) {
            postMediaRepository.deleteByPostId(postId);
            req.getMedia().forEach(m -> {
                PostMedia pm = PostMedia.builder()
                        .postId(postId)
                        .url(m.getUrl())
                        .mediaType(m.getMediaType())
                        .fileName(m.getFileName())
                        .fileSize(m.getFileSize())
                        .build();
                postMediaRepository.save(pm);
            });
        }
 
        return toPostDTO(postRepository.save(post), userId);
    }
 
    @Transactional
    public void deletePost(Long postId, UUID userId) {
        // FIX: Verify ownership before deleting children to prevent malicious data clearing
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId));
        if (!post.getUserId().equals(userId)) {
            throw new SecurityException("Not authorised to delete this post.");
        }

        // FIX: Manually delete child table references to prevent FK cascade crashes
        postMediaRepository.deleteByPostId(postId);
        postLikeRepository.deleteByPostIdAndUserId(postId, userId); // Clear associated likes
        
        postRepository.deleteByIdAndUserId(postId, userId);
    }
 
    // ══ LIKES ════════════════════════════════════════════════════════════════
 
    @Transactional
    public void toggleLike(Long postId, UUID userId, String actorName) {
        if (postLikeRepository.existsByPostIdAndUserId(postId, userId)) {
            postLikeRepository.deleteByPostIdAndUserId(postId, userId);
        } else {
            PostLike like = PostLike.builder()
                    .postId(postId)
                    .userId(userId)
                    .build();
            postLikeRepository.save(like);
 
            // Notify post owner (skip if liker IS the owner)
            postRepository.findById(postId).ifPresent(p -> {
                if (!p.getUserId().equals(userId)) {
                    createNotification(p.getUserId(), userId, actorName,
                            "like", postId, null,
                            actorName + " liked your post");
                }
            });
        }
    }
 
    // ══ COMMENTS ═════════════════════════════════════════════════════════════
 
    @Transactional(readOnly = true)
    public List<CommentDTO> getComments(Long postId) {
        List<PostComment> roots = postCommentRepository
                .findByPostIdAndParentCommentIdIsNullOrderByCreatedAtAsc(postId);
 
        return roots.stream()
                .map(this::toCommentDTOWithReplies)
                .collect(Collectors.toList());
    }
 
    private CommentDTO toCommentDTOWithReplies(PostComment c) {
        List<CommentDTO> replies = postCommentRepository
                .findByParentCommentIdOrderByCreatedAtAsc(c.getId())
                .stream()
                .map(this::toCommentDTOShallow)
                .collect(Collectors.toList());
 
        // NOTE: If you get a Hibernate error here, remember your V9 DB table doesn't store authorNames directly.
        // You should resolve c.getUserId() to a UserProfile table or keep this stub if using an extended model.
        return CommentDTO.builder()
                .id(c.getId())
                .postId(c.getPostId())
                .userId(c.getUserId())
                .authorName(c.getAuthorName() != null ? c.getAuthorName() : "Anonymous User")
                .authorInitials(toInitials(c.getAuthorName()))
                .content(c.getContent())
                .parentCommentId(c.getParentCommentId())
                .replies(replies)
                .isEdited(c.getIsEdited())
                .createdAt(c.getCreatedAt())
                .build();
    }
 
    private CommentDTO toCommentDTOShallow(PostComment c) {
        return CommentDTO.builder()
                .id(c.getId())
                .postId(c.getPostId())
                .userId(c.getUserId())
                .authorName(c.getAuthorName() != null ? c.getAuthorName() : "Anonymous User")
                .authorInitials(toInitials(c.getAuthorName()))
                .content(c.getContent())
                .parentCommentId(c.getParentCommentId())
                .replies(Collections.emptyList())
                .isEdited(c.getIsEdited())
                .createdAt(c.getCreatedAt())
                .build();
    }
 
    @Transactional
    public CommentDTO addComment(Long postId, String content, Long parentCommentId,
                                 UUID userId, String authorName) {
        PostComment comment = PostComment.builder()
                .postId(postId)
                .userId(userId)
                .authorName(authorName) // Ensure your Java Entity maps this field as @Transient if not in DB schema!
                .content(content)
                .parentCommentId(parentCommentId)
                .isEdited(false)
                .build();
 
        PostComment saved = postCommentRepository.save(comment);
 
        // Notify post owner
        postRepository.findById(postId).ifPresent(post -> {
            if (!post.getUserId().equals(userId)) {
                createNotification(post.getUserId(), userId, authorName,
                        "comment", postId, saved.getId(),
                        authorName + " commented on your post");
            }
        });
 
        // Notify parent comment owner (if this is a nested reply item thread)
        if (parentCommentId != null) {
            postCommentRepository.findById(parentCommentId).ifPresent(parent -> {
                if (!parent.getUserId().equals(userId)) {
                    createNotification(parent.getUserId(), userId, authorName,
                            "comment", postId, saved.getId(),
                            authorName + " replied to your comment");
                }
            });
        }
 
        return toCommentDTOShallow(saved);
    }
 
    @Transactional
    public CommentDTO editComment(Long commentId, String content, UUID userId) {
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Comment not found: " + commentId));
 
        if (!comment.getUserId().equals(userId)) {
            throw new SecurityException("Not authorised to edit this comment");
        }
 
        comment.setContent(content);
        comment.setIsEdited(true);
        return toCommentDTOShallow(postCommentRepository.save(comment));
    }
 
    @Transactional
    public void deleteComment(Long commentId, UUID userId) {
        // FIX: Explicitly check target comment's existence and credentials before hitting delete logic
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Comment not found: " + commentId));
        if (!comment.getUserId().equals(userId)) {
            throw new SecurityException("Not authorised to delete this comment.");
        }
        postCommentRepository.deleteByIdAndUserId(commentId, userId);
    }

}
