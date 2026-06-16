package com.saaspm.controller;

import com.saaspm.dto.AppMapper;
import com.saaspm.dto.AuthDtos.ChangePasswordRequest;
import com.saaspm.dto.AuthDtos.UpdateProfileRequest;
import com.saaspm.dto.AuthDtos.UserResponse;
import com.saaspm.domain.User;
import com.saaspm.error.ApiException;
import com.saaspm.repository.UserRepository;
import com.saaspm.service.CurrentUserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final CurrentUserService currentUserService;
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public UserController(CurrentUserService currentUserService, UserRepository users, PasswordEncoder encoder) {
        this.currentUserService = currentUserService;
        this.users = users;
        this.encoder = encoder;
    }

    @GetMapping("/me")
    public UserResponse me() {
        return AppMapper.toUser(currentUserService.get());
    }

    @PutMapping("/me")
    @Transactional
    public UserResponse updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        User user = currentUserService.get();
        String email = request.email().trim().toLowerCase();
        users.findByEmail(email)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
                });
        user.setName(request.name().trim());
        user.setEmail(email);
        return AppMapper.toUser(users.save(user));
    }

    @PostMapping("/me/password")
    @Transactional
    public Map<String, String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = currentUserService.get();
        if (!encoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        user.setPasswordHash(encoder.encode(request.newPassword()));
        users.save(user);
        return Map.of("message", "Password updated");
    }

    @GetMapping
    public List<UserResponse> list() {
        return users.findAll().stream().map(AppMapper::toUser).toList();
    }
}
