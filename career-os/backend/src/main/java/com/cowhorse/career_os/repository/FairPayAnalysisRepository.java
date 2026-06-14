package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.FairPayAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FairPayAnalysisRepository extends JpaRepository<FairPayAnalysis, UUID> {
    List<FairPayAnalysis> findBySupabaseUidOrderByCreatedAtDesc(String supabaseUid);
    void deleteBySupabaseUidAndJobTitleIgnoreCase(String supabaseUid, String jobTitle);
}
