package com.cowhorse.career_os.repository;
import com.cowhorse.career_os.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
 
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Post> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Post> findByUserIdAndIncludeInCvTrue(UUID userId);
    long countByOriginalPostId(Long originalPostId);
    boolean existsByOriginalPostIdAndUserId(Long originalPostId, UUID userId);
 
    @Transactional
    void deleteByIdAndUserId(Long id, UUID userId);
}