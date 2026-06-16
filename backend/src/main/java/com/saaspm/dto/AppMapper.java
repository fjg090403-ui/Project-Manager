package com.saaspm.dto;

import com.saaspm.domain.*;
import com.saaspm.dto.ApiDtos.*;
import com.saaspm.dto.AuthDtos.UserResponse;

public final class AppMapper {
    private AppMapper() {}

    public static UserResponse toUser(User user) {
        Organization org = user.getOrganization();
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                org == null ? null : org.getId(), org == null ? null : org.getName());
    }

    public static OrganizationResponse toOrganization(Organization org) {
        return new OrganizationResponse(org.getId(), org.getName(), org.getCreatedAt());
    }

    public static ProjectResponse toProject(Project project) {
        return new ProjectResponse(project.getId(), project.getName(), project.getDescription(),
                project.getOrganization().getId(), project.getBoard() == null ? null : project.getBoard().getId());
    }

    public static BoardResponse toBoard(Board board) {
        return new BoardResponse(board.getId(), board.getName(), board.getProject().getId());
    }

    public static ColumnResponse toColumn(BoardColumn column) {
        return new ColumnResponse(column.getId(), column.getName(), column.getPosition(), column.getBoard().getId());
    }

    public static TaskResponse toTask(Task task) {
        User assignee = task.getAssignee();
        return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(), task.getStatus(),
                task.getPriority() == null ? TaskPriority.MEDIUM : task.getPriority(), task.getDueDate(), task.getPosition(), task.getColumn().getId(),
                task.getColumn().getBoard().getId(),
                assignee == null ? null : assignee.getId(),
                assignee == null ? null : assignee.getName(),
                task.getCreatedAt(), task.getUpdatedAt());
    }

    public static CommentResponse toComment(Comment comment) {
        return new CommentResponse(comment.getId(), comment.getContent(), comment.getTask().getId(),
                comment.getAuthor().getId(), comment.getAuthor().getName(), comment.getCreatedAt());
    }

    public static NotificationResponse toNotification(Notification notification) {
        return new NotificationResponse(notification.getId(), notification.getMessage(), notification.isRead(), notification.getCreatedAt());
    }
}
