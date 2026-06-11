package com.cowhorse.career_os.repository;
import com.cowhorse.career_os.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
    List<PostMedia> findByPostId(Long postId);
 
    @org.springframework.transaction.annotation.Transactional
    void deleteByPostId(Long postId);
}