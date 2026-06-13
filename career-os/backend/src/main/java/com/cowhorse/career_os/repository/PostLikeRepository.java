package com.cowhorse.career_os.repository;
import com.cowhorse.career_os.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;
 
@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByPostIdAndUserId(Long postId, UUID userId);
    long countByPostId(Long postId);
    boolean existsByPostIdAndUserId(Long postId, UUID userId);
 
    @Transactional
    void deleteByPostIdAndUserId(Long postId, UUID userId);
}