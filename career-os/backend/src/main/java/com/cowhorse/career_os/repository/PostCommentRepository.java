// package com.cowhorse.career_os.repository;
// import com.cowhorse.career_os.entity.PostComment;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;
// import org.springframework.transaction.annotation.Transactional;
// import java.util.List;
// import java.util.UUID;
 
// @Repository
// public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
//     List<PostComment> findByPostIdAndParentCommentIdIsNullOrderByCreatedAtAsc(Long postId);
//     List<PostComment> findByParentCommentIdOrderByCreatedAtAsc(Long parentCommentId);
//     long countByPostId(Long postId);
 
//     @Transactional
//     void deleteByIdAndUserId(Long id, UUID userId);
// }
package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    
    List<PostComment> findByPostIdAndParentCommentIdIsNullOrderByCreatedAtAsc(Long postId);
    
    List<PostComment> findByParentCommentIdOrderByCreatedAtAsc(Long parentCommentId);
    
    long countByPostId(Long postId);

    @Transactional
    void deleteByIdAndUserId(Long id, UUID userId);
}
