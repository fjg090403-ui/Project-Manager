package com.saaspm.dto;

import com.saaspm.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @Size(min = 6) String password,
            String organizationName
    ) {}

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record AuthResponse(String accessToken, UserResponse user) {}

    public record UserResponse(Long id, String name, String email, Role role, Long organizationId, String organizationName) {}

    public record UpdateProfileRequest(@NotBlank String name, @Email @NotBlank String email) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @Size(min = 6) String newPassword
    ) {}
}
