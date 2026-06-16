package com.saaspm.controller;

import com.saaspm.dto.ApiDtos.*;
import com.saaspm.dto.AppMapper;
import com.saaspm.service.ProjectManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectManagementService service;

    public ProjectController(ProjectManagementService service) { this.service = service; }

    @GetMapping
    public List<ProjectResponse> list() { return service.projects().stream().map(AppMapper::toProject).toList(); }

    @PostMapping
    public ProjectResponse create(@Valid @RequestBody ProjectRequest request) { return AppMapper.toProject(service.createProject(request)); }
}
