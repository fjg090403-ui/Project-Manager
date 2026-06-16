package com.saaspm.controller;

import com.saaspm.dto.ApiDtos.*;
import com.saaspm.dto.AppMapper;
import com.saaspm.service.CurrentUserService;
import com.saaspm.service.ProjectManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    private final ProjectManagementService service;
    private final CurrentUserService currentUserService;

    public CommentController(ProjectManagementService service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<CommentResponse> list(@RequestParam(required = false) Long taskId) {
        return service.comments(taskId).stream().map(AppMapper::toComment).toList();
    }

    @PostMapping
    public CommentResponse create(@Valid @RequestBody CommentRequest request) {
        return AppMapper.toComment(service.createComment(request, currentUserService.get()));
    }
}
