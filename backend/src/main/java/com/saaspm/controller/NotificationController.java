package com.saaspm.controller;

import com.saaspm.dto.ApiDtos.NotificationResponse;
import com.saaspm.dto.AppMapper;
import com.saaspm.service.CurrentUserService;
import com.saaspm.service.ProjectManagementService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final ProjectManagementService service;
    private final CurrentUserService currentUserService;

    public NotificationController(ProjectManagementService service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<NotificationResponse> list() {
        return service.notifications(currentUserService.get()).stream().map(AppMapper::toNotification).toList();
    }
}
