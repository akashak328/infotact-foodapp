package com.infotact.foodapp.service;

import com.infotact.foodapp.dto.AuthDTO.*;
import com.infotact.foodapp.model.User;
import com.infotact.foodapp.repository.UserRepository;
import com.infotact.foodapp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserDetailsService userDetailsService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setName(req.getName());
        user.setPhone(req.getPhone());
        user.setRole(req.getRole().toUpperCase());
        user.setAddress(req.getAddress());
        user.setLatitude(req.getLatitude());
        user.setLongitude(req.getLongitude());
        user.setLoyaltyPoints(0);

        User saved = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtUtil.generateToken(userDetails, saved.getRole());

        return new AuthResponse(token, saved.getId(), saved.getName(),
                saved.getEmail(), saved.getRole(), saved.getLoyaltyPoints());
    }

    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole());

        return new AuthResponse(token, user.getId(), user.getName(),
                user.getEmail(), user.getRole(), user.getLoyaltyPoints());
    }
}
