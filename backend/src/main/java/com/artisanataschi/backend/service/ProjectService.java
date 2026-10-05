package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Project;
import com.artisanataschi.backend.dto.ProjectRequestDto;
import com.artisanataschi.backend.repository.ProjectRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Cacheable(value = "projects")
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<Project> getProjectsByCategory(String category) {
        if (category == null || category.isEmpty() || category.equalsIgnoreCase("Tout")) {
            return getAllProjects();
        }
        return projectRepository.findByCategory(category);
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    @Transactional
    @CacheEvict(value = "projects", allEntries = true)
    public Project createProject(ProjectRequestDto dto) {
        Project project = new Project();
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setCategory(dto.getCategory());
        project.setLocation(dto.getLocation());
        project.setDetails(dto.getDetails());
        project.setImageUrl(dto.getImageUrl());
        project.setVideoUrl(dto.getVideoUrl());
        return projectRepository.save(project);
    }

    @Transactional
    @CacheEvict(value = "projects", allEntries = true)
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    @Transactional
    @CacheEvict(value = "projects", allEntries = true)
    public Project updateProject(Long id, ProjectRequestDto dto) {
        Project project = getProjectById(id);
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setCategory(dto.getCategory());
        project.setLocation(dto.getLocation());
        project.setDetails(dto.getDetails());
        project.setImageUrl(dto.getImageUrl());
        project.setVideoUrl(dto.getVideoUrl());
        return projectRepository.save(project);
    }

    @Transactional
    @CacheEvict(value = "projects", allEntries = true)
    public Project updateProject(Long id, Project projectDetails) {
        Project project = getProjectById(id);
        project.setTitle(projectDetails.getTitle());
        project.setDescription(projectDetails.getDescription());
        project.setCategory(projectDetails.getCategory());
        project.setLocation(projectDetails.getLocation());
        project.setDetails(projectDetails.getDetails());
        project.setImageUrl(projectDetails.getImageUrl());
        project.setVideoUrl(projectDetails.getVideoUrl());
        return projectRepository.save(project);
    }

    @Transactional
    @CacheEvict(value = "projects", allEntries = true)
    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        projectRepository.delete(project);
    }
}
