package com.cowhorse.career_os.service;

import com.cowhorse.career_os.dto.*;
import com.cowhorse.career_os.entity.Notification;
import com.cowhorse.career_os.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // Helper: build initials inside service to protect against null names
    private String toInitials(String name) {
        if (name == null || name.isBlank()) return "?";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, 1).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toNotificationDTO)
                .collect(Collectors.toList());
    }
 
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
 
    // FIX: Renamed method to match the call inside NotificationController
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
 
    public void markOneRead(Long notificationId, UUID userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
    }
 
    // FIX: Changed from private to PUBLIC so NetworkService can trigger it cleanly
    public void createNotification(UUID recipientUserId, UUID actorId, String actorName,
                                   String type, Long postId, Long commentId, String message) {
        Notification notification = Notification.builder()
                .userId(recipientUserId)
                .actorId(actorId)
                /* 
                 * NOTE FOR ENTIY CLASS: Your V9 SQL script does not contain actorName/actorInitials fields. 
                 * Ensure those fields are tagged with @Transient inside your Notification.java entity class
                 * so Hibernate knows not to look for them in the actual database columns!
                 */
                .actorName(actorName)
                .actorInitials(toInitials(actorName))
                .type(type)
                .postId(postId)
                .commentId(commentId)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }
 
    private NotificationDTO toNotificationDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .actorId(n.getActorId())
                .actorName(n.getActorName() != null ? n.getActorName() : "A User")
                .actorInitials(toInitials(n.getActorName()))
                .type(n.getType())
                .postId(n.getPostId())
                .commentId(n.getCommentId())
                .message(n.getMessage())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
