package com.saaspm.service;

import com.saaspm.auth.JwtService;
import com.saaspm.domain.Organization;
import com.saaspm.domain.Role;
import com.saaspm.domain.User;
import com.saaspm.dto.AppMapper;
import com.saaspm.dto.AuthDtos.*;
import com.saaspm.error.ApiException;
import com.saaspm.repository.OrganizationRepository;
import com.saaspm.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final OrganizationRepository organizations;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository users, OrganizationRepository organizations, PasswordEncoder encoder,
                       JwtService jwtService, AuthenticationManager authenticationManager) {
        this.users = users;
        this.organizations = organizations;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }
        Organization org = new Organization();
        org.setName(request.organizationName() == null || request.organizationName().isBlank()
                ? request.name() + " Organization"
                : request.organizationName());
        organizations.save(org);

        User user = new User();
        user.setName(request.name());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(request.password()));
        user.setRole(Role.MANAGER);
        user.setOrganization(org);
        users.save(user);
        return new AuthResponse(jwtService.generate(user), AppMapper.toUser(user));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = users.findByEmail(email).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        return new AuthResponse(jwtService.generate(user), AppMapper.toUser(user));
    }
}
