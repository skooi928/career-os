package com.cowhorse.career_os.controller;
 
import com.cowhorse.career_os.dto.*;
import com.cowhorse.career_os.service.ForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {
 
    private final ForumService forumService;
 
    // ══ HELPERS ══════════════════════════════════════════════════════════════
 
    /** Extract caller's UUID safely from header. Returns null if missing or invalid instead of crashing. */
    private UUID currentUserId(String raw) {
        if (raw == null || raw.isBlank() || "null".equalsIgnoreCase(raw.trim())) {
            return null;
        }
        try { 
            return UUID.fromString(raw.trim()); 
        } catch (IllegalArgumentException e) {
            // Log warning internally, but return null so public guest feeds still display
            return null; 
        }
    }
 
    /** Validates required headers. Throws IllegalArgumentException caught by handler below. */
    private UUID requiredUserId(String raw) {
        if (raw == null || raw.isBlank() || "null".equalsIgnoreCase(raw.trim())) {
            throw new IllegalArgumentException("X-User-Id header is required for this operation.");
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format in X-User-Id header.");
        }
    }
 
    // ══ POSTS ════════════════════════════════════════════════════════════════
 
    @GetMapping("/feed")
    public ResponseEntity<Page<PostDTO>> getFeed(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
 
        return ResponseEntity.ok(forumService.getFeed(page, size, currentUserId(userId)));
    }
 
    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostDTO> getPost(
            @PathVariable Long postId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
 
        return ResponseEntity.ok(forumService.getPostById(postId, currentUserId(userId)));
    }
 
    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<List<PostDTO>> getUserPosts(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) String currentUser) {
 
        return ResponseEntity.ok(forumService.getPostsByUser(userId, currentUserId(currentUser)));
    }
 
    @GetMapping("/users/{userId}/cv-posts")
    public ResponseEntity<List<PostDTO>> getCvPosts(@PathVariable UUID userId) {
        return ResponseEntity.ok(forumService.getCvPosts(userId));
    }
 
    @PostMapping("/posts")
    public ResponseEntity<PostDTO> createPost(
            @RequestBody CreatePostRequest request,
            @RequestParam("supabaseUid") String userId) {
 
        PostDTO created = forumService.createPost(
                request,
                UUID.fromString(userId),
                ""
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
 
    @PutMapping("/posts/{postId}")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long postId,
            @RequestBody  CreatePostRequest request,
            @RequestParam("supabaseUid") String userId) {
 
        return ResponseEntity.ok(
                forumService.updatePost(postId, request, UUID.fromString(userId)));
    }
 
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            @RequestParam("supabaseUid") String userId) {
 
        forumService.deletePost(postId, UUID.fromString(userId));
        return ResponseEntity.noContent().build();
    }
 
    // ══ LIKES ════════════════════════════════════════════════════════════════
 
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<Void> toggleLike(
            @PathVariable Long postId,
            @RequestParam("supabaseUid")   String userId){
 
        forumService.toggleLike(postId, UUID.fromString(userId), "");
        return ResponseEntity.ok().build();
    }
 
    // ══ COMMENTS ═════════════════════════════════════════════════════════════
 
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(forumService.getComments(postId));
    }
 
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable Long postId,
            @RequestBody  CommentDTO request, // FIX: Replaced untyped Map with structured Request DTO
            @RequestParam("supabaseUid") String userId) {
 
        CommentDTO comment = forumService.addComment(
                postId, 
                request.getContent(), 
                request.getParentCommentId(),
                UUID.fromString(userId), 
                ""
        );
 
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }
 
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentDTO> editComment(
            @PathVariable Long commentId,
            @RequestBody  Map<String, String> body, // Keep simple maps if text-only, but ensure fallback safety
            @RequestHeader("supabaseUid") String userId) {
 
        String content = body != null ? body.get("content") : null;
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Comment content cannot be empty.");
        }
        return ResponseEntity.ok(forumService.editComment(commentId, content, UUID.fromString(userId)));
    }
 
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestHeader("supabaseUid") String userId) {
 
        forumService.deleteComment(commentId, UUID.fromString(userId));
        return ResponseEntity.noContent().build();
    }

    // ══ GLOBAL ERROR LOCAL HANDLER ═══════════════════════════════════════════
    
    /** Catch illegal input or missing headers and return a clean HTTP 400 Bad Request */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }
}