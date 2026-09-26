package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @Override
    @NonNull
    @EntityGraph(attributePaths = {"images", "category", "category.parentCategory"})
    Optional<Product> findById(@NonNull Long id);

    @Override
    @NonNull
    @EntityGraph(attributePaths = {"images", "category", "category.parentCategory"})
    List<Product> findAll();

    @Override
    @NonNull
    @EntityGraph(attributePaths = {"images", "category", "category.parentCategory"})
    List<Product> findAll(Specification<Product> spec);

    @Override
    @NonNull
    @EntityGraph(attributePaths = {"images", "category", "category.parentCategory"})
    Page<Product> findAll(Specification<Product> spec, @NonNull Pageable pageable);

    @Override
    @NonNull
    @EntityGraph(attributePaths = {"images", "category", "category.parentCategory"})
    Page<Product> findAll(@NonNull Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category", "category.parentCategory"})
    List<Product> findByType(String type);

    @EntityGraph(attributePaths = {"images", "category", "category.parentCategory"})
    Page<Product> findByType(String type, Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category", "category.parentCategory"})
    List<Product> findByIsFeaturedTrue();

    @EntityGraph(attributePaths = {"images", "category", "category.parentCategory"})
    List<Product> findTop6ByIsFeaturedTrue();

    @EntityGraph(attributePaths = {"images", "category", "category.parentCategory"})
    List<Product> findTop5ByOrderByIdDesc();

    @EntityGraph(attributePaths = {"images", "category", "category.parentCategory"})
    List<Product> findTop3ByOrderByIdDesc();
}
