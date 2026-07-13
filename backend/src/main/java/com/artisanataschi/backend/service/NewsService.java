package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.News;
import com.artisanataschi.backend.repository.NewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NewsService {

    @Autowired
    private NewsRepository newsRepository;

    public List<News> getAllNews() {
        return newsRepository.findAllByOrderByCreatedDateDesc();
    }

    public News getNewsById(Long id) {
        return newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found with id: " + id));
    }

    public News createNews(News news) {
        if (news.getCreatedDate() == null) {
            news.setCreatedDate(LocalDateTime.now());
        }
        return newsRepository.save(news);
    }

    public News updateNews(Long id, News newsDetails) {
        News news = getNewsById(id);
        news.setTitle(newsDetails.getTitle());
        news.setContent(newsDetails.getContent());
        news.setImageUrl(newsDetails.getImageUrl());
        return newsRepository.save(news);
    }

    public void deleteNews(Long id) {
        News news = getNewsById(id);
        newsRepository.delete(news);
    }
}
