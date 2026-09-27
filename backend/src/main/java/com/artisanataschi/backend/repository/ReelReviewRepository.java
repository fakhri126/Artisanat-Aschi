package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.ReelReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReelReviewRepository extends JpaRepository<ReelReview, Long> {
    List<ReelReview> findByReelConfigIdOrderByTimeAsc(Long reelConfigId);
}
