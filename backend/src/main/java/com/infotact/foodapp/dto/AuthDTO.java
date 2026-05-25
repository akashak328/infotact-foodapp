package com.infotact.foodapp.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

public class AuthDTO {

    @Data
    public static class RegisterRequest {
        @NotBlank
        @Email
        private String email;

        @NotBlank
        @Size(min = 6)
        private String password;

        @NotBlank
        private String name;

        private String phone;

        @NotBlank
        // CONSUMER, RESTAURANT_PARTNER, DELIVERY_COURIER
        private String role;

        private String address;
        private double latitude;
        private double longitude;
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String userId;
        private String name;
        private String email;
        private String role;
        private int loyaltyPoints;

        public AuthResponse(String token, String userId, String name,
                            String email, String role, int loyaltyPoints) {
            this.token = token;
            this.userId = userId;
            this.name = name;
            this.email = email;
            this.role = role;
            this.loyaltyPoints = loyaltyPoints;
        }
    }
}
