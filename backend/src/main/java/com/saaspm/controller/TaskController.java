package com.saaspm.controller;

import com.saaspm.dto.ApiDtos.*;
import com.saaspm.dto.AppMapper;
import com.saaspm.service.ProjectManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final ProjectManagementService service;

    public TaskController(ProjectManagementService service) { this.service = service; }

    @GetMapping
    public List<TaskResponse> list(@RequestParam(required = false) Long columnId) {
        var tasks = columnId == null ? service.tasks() : service.tasksByColumn(columnId);
        return tasks.stream().map(AppMapper::toTask).toList();
    }

    @PostMapping
    public TaskResponse create(@Valid @RequestBody TaskRequest request) { return AppMapper.toTask(service.createTask(request)); }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Long id, @RequestBody TaskUpdateRequest request) {
        return AppMapper.toTask(service.updateTask(id, request));
    }

    @PatchMapping("/{id}/move")
    public TaskResponse move(@PathVariable Long id, @Valid @RequestBody TaskMoveRequest request) {
        return AppMapper.toTask(service.moveTask(id, request));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteTask(id);
    }
}
