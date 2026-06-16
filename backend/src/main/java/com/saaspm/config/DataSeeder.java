package com.saaspm.config;

import com.saaspm.domain.*;
import com.saaspm.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedData(UserRepository users, OrganizationRepository organizations, ProjectRepository projects,
                               BoardRepository boards, BoardColumnRepository columns, TaskRepository tasks,
                               NotificationRepository notifications, PasswordEncoder encoder) {
        return args -> {
            if (users.count() > 0) {
                return;
            }

            Organization org = new Organization();
            org.setName("Acme Product Studio");
            organizations.save(org);

            User admin = user("Admin", "admin@example.com", Role.ADMIN, org, encoder);
            User manager = user("Manager", "manager@example.com", Role.MANAGER, org, encoder);
            User member = user("Member", "member@example.com", Role.MEMBER, org, encoder);
            users.save(admin);
            users.save(manager);
            users.save(member);

            Project project = new Project();
            project.setName("Launch SaaS PM");
            project.setDescription("Initial project management workspace.");
            project.setOrganization(org);
            projects.save(project);

            Board board = new Board();
            board.setName("Launch Board");
            board.setProject(project);
            boards.save(board);
            project.setBoard(board);
            projects.save(project);

            BoardColumn todo = column("To do", 0, board);
            BoardColumn progress = column("In progress", 1, board);
            BoardColumn done = column("Done", 2, board);
            columns.save(todo);
            columns.save(progress);
            columns.save(done);

            tasks.save(task("Create onboarding flow", "Design and implement auth screens.", todo, member, 0));
            tasks.save(task("Wire realtime events", "Publish board updates through Socket.IO.", progress, manager, 0));
            tasks.save(task("Prepare demo data", "Seed useful examples for local development.", done, admin, 0));

            Notification notification = new Notification();
            notification.setMessage("Welcome to SaaS Project Manager");
            notification.setRecipient(admin);
            notifications.save(notification);
        };
    }

    private User user(String name, String email, Role role, Organization org, PasswordEncoder encoder) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setRole(role);
        user.setOrganization(org);
        user.setPasswordHash(encoder.encode("password123"));
        return user;
    }

    private BoardColumn column(String name, int position, Board board) {
        BoardColumn column = new BoardColumn();
        column.setName(name);
        column.setPosition(position);
        column.setBoard(board);
        return column;
    }

    private Task task(String title, String description, BoardColumn column, User assignee, int position) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setColumn(column);
        task.setAssignee(assignee);
        task.setPosition(position);
        return task;
    }
}
