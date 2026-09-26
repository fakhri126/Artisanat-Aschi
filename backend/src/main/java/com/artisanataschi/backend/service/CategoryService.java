package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Category;
import com.artisanataschi.backend.dto.CategoryRequestDto;
import com.artisanataschi.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Cacheable(value = "categories")
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    @CacheEvict(value = "categories", allEntries = true)
    public Category createCategory(CategoryRequestDto dto) {
        if (categoryRepository.findByName(dto.getName()).isPresent()) {
            throw new RuntimeException("Category already exists with name: " + dto.getName());
        }
        Category category = new Category();
        category.setName(dto.getName());
        category.setType(dto.getType());
        if (dto.getParentId() != null) {
            Category parent = getCategoryById(dto.getParentId());
            category.setParentCategory(parent);
        }
        return categoryRepository.save(category);
    }

    @CacheEvict(value = "categories", allEntries = true)
    public Category createCategory(Category category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            throw new RuntimeException("Category already exists with name: " + category.getName());
        }
        return categoryRepository.save(category);
    }

    @CacheEvict(value = "categories", allEntries = true)
    public Category updateCategory(Long id, CategoryRequestDto dto) {
        Category category = getCategoryById(id);
        category.setName(dto.getName());
        category.setType(dto.getType());
        if (dto.getParentId() != null) {
            Category parent = getCategoryById(dto.getParentId());
            category.setParentCategory(parent);
        } else {
            category.setParentCategory(null);
        }
        return categoryRepository.save(category);
    }

    @CacheEvict(value = "categories", allEntries = true)
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = getCategoryById(id);
        category.setName(categoryDetails.getName());
        category.setType(categoryDetails.getType());
        return categoryRepository.save(category);
    }

    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
