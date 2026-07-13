package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Project;
import com.artisanataschi.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<Project> getProjectsByCategory(String category) {
        if (category == null || category.isEmpty() || category.equalsIgnoreCase("Tout")) {
            return projectRepository.findAll();
        }
        return projectRepository.findByCategory(category);
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public Project updateProject(Long id, Project projectDetails) {
        Project project = getProjectById(id);
        project.setTitle(projectDetails.getTitle());
        project.setDescription(projectDetails.getDescription());
        project.setCategory(projectDetails.getCategory());
        project.setLocation(projectDetails.getLocation());
        project.setDetails(projectDetails.getDetails());
        project.setImageUrl(projectDetails.getImageUrl());
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        projectRepository.delete(project);
    }
}
