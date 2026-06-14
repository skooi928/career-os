// package com.cowhorse.career_os.repository;
// import com.cowhorse.career_os.entity.Notification;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;
// import org.springframework.transaction.annotation.Transactional;
// import java.util.List;
// import java.util.UUID;
 
// @Repository
// public interface NotificationRepository extends JpaRepository<Notification, Long> {
//     List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);
//     long countByUserIdAndIsReadFalse(UUID userId);
 
//     @Transactional
//     void markAllAsReadByUserId(UUID userId);
// }
package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    long countByUserIdAndIsReadFalse(UUID userId);

    /* FIX: Added @Modifying and explicit bulk update query to prevent Spring Boot startup errors */
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId")
    void markAllAsReadByUserId(@Param("userId") UUID userId);
}
