package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.CareerPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CareerPredictionRepository extends JpaRepository<CareerPrediction, Long> {
    List<CareerPrediction> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<CareerPrediction> findBySupabaseUidOrderByCreatedAtDesc(String supabaseUid);
}
