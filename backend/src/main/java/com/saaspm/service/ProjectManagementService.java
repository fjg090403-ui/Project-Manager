package com.saaspm.service;

import com.saaspm.domain.*;
import com.saaspm.dto.ApiDtos.*;
import com.saaspm.error.ApiException;
import com.saaspm.repository.*;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectManagementService {
    private final OrganizationRepository organizations;
    private final ProjectRepository projects;
    private final BoardRepository boards;
    private final BoardColumnRepository columns;
    private final TaskRepository tasks;
    private final CommentRepository comments;
    private final NotificationRepository notifications;
    private final UserRepository users;

    public ProjectManagementService(OrganizationRepository organizations, ProjectRepository projects, BoardRepository boards,
                                    BoardColumnRepository columns, TaskRepository tasks, CommentRepository comments,
                                    NotificationRepository notifications, UserRepository users) {
        this.organizations = organizations;
        this.projects = projects;
        this.boards = boards;
        this.columns = columns;
        this.tasks = tasks;
        this.comments = comments;
        this.notifications = notifications;
        this.users = users;
    }

    public List<Organization> organizations() { return organizations.findAll(); }

    public Organization createOrganization(OrganizationRequest request) {
        Organization org = new Organization();
        org.setName(request.name());
        return organizations.save(org);
    }

    public List<Project> projects() { return projects.findAll(); }

    @Transactional
    public Project createProject(ProjectRequest request) {
        Organization org = organizations.findById(request.organizationId()).orElseThrow(() -> notFound("Organization"));
        Project project = new Project();
        project.setName(request.name());
        project.setDescription(request.description());
        project.setOrganization(org);
        projects.save(project);

        Board board = new Board();
        board.setName(project.getName() + " Board");
        board.setProject(project);
        boards.save(board);

        String[] defaults = {"To do", "In progress", "Done"};
        for (int i = 0; i < defaults.length; i++) {
            BoardColumn column = new BoardColumn();
            column.setName(defaults[i]);
            column.setPosition(i);
            column.setBoard(board);
            columns.save(column);
        }
        project.setBoard(board);
        return project;
    }

    public List<Board> boards() { return boards.findAll(); }

    public List<BoardColumn> columns() { return columns.findAll(); }

    public BoardColumn createColumn(ColumnRequest request) {
        Board board = boards.findById(request.boardId()).orElseThrow(() -> notFound("Board"));
        BoardColumn column = new BoardColumn();
        column.setName(request.name());
        column.setPosition(request.position() <= 0 ? board.getColumns().size() : request.position());
        column.setBoard(board);
        return columns.save(column);
    }

    public List<Task> tasks() { return tasks.findAll(); }

    public List<Task> tasksByColumn(Long columnId) { return tasks.findByColumnIdOrderByPositionAsc(columnId); }

    public Task createTask(TaskRequest request) {
        BoardColumn column = columns.findById(request.columnId()).orElseThrow(() -> notFound("Column"));
        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        if (request.priority() != null) task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setColumn(column);
        task.setPosition(tasks.findByColumnIdOrderByPositionAsc(column.getId()).size());
        if (request.assigneeId() != null) {
            task.setAssignee(users.findById(request.assigneeId()).orElseThrow(() -> notFound("User")));
        }
        return tasks.save(task);
    }

    public Task updateTask(Long id, TaskUpdateRequest request) {
        Task task = tasks.findById(id).orElseThrow(() -> notFound("Task"));
        if (request.title() != null) task.setTitle(request.title());
        if (request.description() != null) task.setDescription(request.description());
        if (request.status() != null) task.setStatus(request.status());
        if (request.priority() != null) task.setPriority(request.priority());
        if (Boolean.TRUE.equals(request.clearDueDate())) task.setDueDate(null);
        if (request.dueDate() != null) task.setDueDate(request.dueDate());
        if (Boolean.TRUE.equals(request.clearAssignee())) task.setAssignee(null);
        if (request.assigneeId() != null) task.setAssignee(users.findById(request.assigneeId()).orElseThrow(() -> notFound("User")));
        return tasks.save(task);
    }

    public Task moveTask(Long id, TaskMoveRequest request) {
        Task task = tasks.findById(id).orElseThrow(() -> notFound("Task"));
        BoardColumn column = columns.findById(request.columnId()).orElseThrow(() -> notFound("Column"));
        task.setColumn(column);
        task.setPosition(request.position());
        return tasks.save(task);
    }

    public void deleteTask(Long id) {
        if (!tasks.existsById(id)) {
            throw notFound("Task");
        }
        tasks.deleteById(id);
    }

    public List<Comment> comments(Long taskId) {
        return taskId == null ? comments.findAll() : comments.findByTaskIdOrderByCreatedAtAsc(taskId);
    }

    public Comment createComment(CommentRequest request, User author) {
        Task task = tasks.findById(request.taskId()).orElseThrow(() -> notFound("Task"));
        Comment comment = new Comment();
        comment.setContent(request.content());
        comment.setTask(task);
        comment.setAuthor(author);
        return comments.save(comment);
    }

    public List<Notification> notifications(User user) {
        return notifications.findByRecipientEmailOrderByCreatedAtDesc(user.getEmail());
    }

    private ApiException notFound(String name) {
        return new ApiException(HttpStatus.NOT_FOUND, name + " not found");
    }
}
