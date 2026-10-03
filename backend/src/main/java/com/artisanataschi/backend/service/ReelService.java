package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.ReelConfig;
import com.artisanataschi.backend.domain.ReelReview;
import com.artisanataschi.backend.dto.ReelConfigRequestDto;
import com.artisanataschi.backend.dto.ReelConfigResponseDto;
import com.artisanataschi.backend.dto.ReelReviewRequestDto;
import com.artisanataschi.backend.repository.ReelConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReelService {

    @Autowired
    private ReelConfigRepository reelConfigRepository;

    @Cacheable(value = "reels")
    @Transactional(readOnly = true)
    public ReelConfigResponseDto getReelConfig() {
        ReelConfig config = reelConfigRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    // Fallback par défaut si la table est vide
                    ReelConfig defaultCfg = new ReelConfig("/Video-art.mp4");
                    return defaultCfg;
                });
        return ReelConfigResponseDto.fromEntity(config);
    }

    @CacheEvict(value = "reels", allEntries = true)
    @Transactional
    public ReelConfigResponseDto updateReelConfig(ReelConfigRequestDto dto) {
        ReelConfig config = reelConfigRepository.findFirstByOrderByIdAsc()
                .orElseGet(ReelConfig::new);

        config.setVideoUrl(dto.getVideoUrl().trim());

        // Remplacement propre des reviews
        if (config.getReviews() == null) {
            config.setReviews(new ArrayList<>());
        } else {
            config.getReviews().clear();
        }

        if (dto.getReviews() != null) {
            for (ReelReviewRequestDto rDto : dto.getReviews()) {
                ReelReview review = new ReelReview();
                review.setPlatform(rDto.getPlatform());
                review.setName(rDto.getName());
                review.setAvatar(rDto.getAvatar());
                review.setRating(rDto.getRating() != null ? rDto.getRating() : 5);
                review.setText(rDto.getText());
                review.setTime(rDto.getTime() != null ? rDto.getTime() : 0);
                review.setDuration(rDto.getDuration() != null ? rDto.getDuration() : 4);
                review.setPosition(rDto.getPosition() != null ? rDto.getPosition() : "left");
                review.setReelConfig(config);
                config.getReviews().add(review);
            }
        }

        ReelConfig saved = reelConfigRepository.save(config);
        return ReelConfigResponseDto.fromEntity(saved);
    }

    @CacheEvict(value = "reels", allEntries = true)
    @Transactional
    public void deleteReelConfig(Long id) {
        if (reelConfigRepository.existsById(id)) {
            reelConfigRepository.deleteById(id);
        }
    }
}
