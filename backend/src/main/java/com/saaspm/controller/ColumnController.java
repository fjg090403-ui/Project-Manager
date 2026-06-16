package com.saaspm.controller;

import com.saaspm.dto.ApiDtos.*;
import com.saaspm.dto.AppMapper;
import com.saaspm.service.ProjectManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/columns")
public class ColumnController {
    private final ProjectManagementService service;

    public ColumnController(ProjectManagementService service) { this.service = service; }

    @GetMapping
    public List<ColumnResponse> list() { return service.columns().stream().map(AppMapper::toColumn).toList(); }

    @PostMapping
    public ColumnResponse create(@Valid @RequestBody ColumnRequest request) { return AppMapper.toColumn(service.createColumn(request)); }
}
