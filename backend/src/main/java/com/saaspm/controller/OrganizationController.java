package com.saaspm.controller;

import com.saaspm.dto.ApiDtos.*;
import com.saaspm.dto.AppMapper;
import com.saaspm.service.ProjectManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final ProjectManagementService service;

    public OrganizationController(ProjectManagementService service) { this.service = service; }

    @GetMapping
    public List<OrganizationResponse> list() { return service.organizations().stream().map(AppMapper::toOrganization).toList(); }

    @PostMapping
    public OrganizationResponse create(@Valid @RequestBody OrganizationRequest request) {
        return AppMapper.toOrganization(service.createOrganization(request));
    }
}
