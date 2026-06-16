package com.saaspm.dto;

import com.saaspm.domain.TaskPriority;
import com.saaspm.domain.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;

public final class ApiDtos {
    private ApiDtos() {}

    public record OrganizationRequest(@NotBlank String name) {}
    public record OrganizationResponse(Long id, String name, Instant createdAt) {}

    public record ProjectRequest(@NotBlank String name, String description, @NotNull Long organizationId) {}
    public record ProjectResponse(Long id, String name, String description, Long organizationId, Long boardId) {}

    public record BoardResponse(Long id, String name, Long projectId) {}

    public record ColumnRequest(@NotBlank String name, @NotNull Long boardId, int position) {}
    public record ColumnResponse(Long id, String name, int position, Long boardId) {}

    public record TaskRequest(@NotBlank String title, String description, @NotNull Long columnId, Long assigneeId, TaskPriority priority, LocalDate dueDate) {}
    public record TaskUpdateRequest(String title, String description, Long assigneeId, Boolean clearAssignee, TaskStatus status,
                                    TaskPriority priority, LocalDate dueDate, Boolean clearDueDate) {}
    public record TaskMoveRequest(@NotNull Long columnId, int position) {}
    public record TaskResponse(Long id, String title, String description, TaskStatus status, TaskPriority priority, LocalDate dueDate,
                               int position, Long columnId, Long boardId, Long assigneeId, String assigneeName,
                               Instant createdAt, Instant updatedAt) {}

    public record CommentRequest(@NotBlank String content, @NotNull Long taskId) {}
    public record CommentResponse(Long id, String content, Long taskId, Long authorId, String authorName, Instant createdAt) {}

    public record NotificationResponse(Long id, String message, boolean read, Instant createdAt) {}
}
