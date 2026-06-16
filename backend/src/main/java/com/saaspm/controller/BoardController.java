package com.saaspm.controller;

import com.saaspm.dto.ApiDtos.BoardResponse;
import com.saaspm.dto.AppMapper;
import com.saaspm.service.ProjectManagementService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/boards")
public class BoardController {
    private final ProjectManagementService service;

    public BoardController(ProjectManagementService service) { this.service = service; }

    @GetMapping
    public List<BoardResponse> list() { return service.boards().stream().map(AppMapper::toBoard).toList(); }
}
