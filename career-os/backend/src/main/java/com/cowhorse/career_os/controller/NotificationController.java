package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.dto.NotificationDTO;
import com.cowhorse.career_os.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotifications(@PathVariable UUID userId) {
        // FIX: Returned NotificationDTO instead of leaking raw entity data types
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    /**
     * GET /api/notifications/{userId}/unread-count
     */
    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Long> unreadCount(@PathVariable UUID userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    /**
     * PUT /api/notifications/{userId}/mark-read
     */
    @PutMapping("/{userId}/mark-read")
    public ResponseEntity<Void> markRead(@PathVariable UUID userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build(); // FIX: Explicit 204 No Content response
    }
}
