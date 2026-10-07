package com.mohanraj.jobtracker.service;

import com.mohanraj.jobtracker.dto.AuthResponseDTO;
import com.mohanraj.jobtracker.dto.LoginRequestDTO;
import com.mohanraj.jobtracker.dto.RegisterRequestDTO;
import com.mohanraj.jobtracker.model.AppUser;
import com.mohanraj.jobtracker.repository.AppUserRepository;
import com.mohanraj.jobtracker.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final com.mohanraj.jobtracker.security.AppUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            com.mohanraj.jobtracker.security.AppUserDetailsService userDetailsService,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    public AuthResponseDTO register(RegisterRequestDTO request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            log.warn("Registration attempt rejected for existing email: {}", email);
            throw new IllegalStateException("An account with this email already exists");
        }

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        log.info("Created account for {}", email);
        return createResponse(userDetailsService.loadUserByUsername(email), email);
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        String email = normalizeEmail(request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        log.info("Successful authentication for {}", email);
        return createResponse(userDetailsService.loadUserByUsername(email), email);
    }

    private AuthResponseDTO createResponse(UserDetails userDetails, String email) {
        return new AuthResponseDTO(
                jwtService.generateToken(userDetails),
                "Bearer",
                jwtService.getExpirationMs(),
                email);
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
