package com.infotact.foodapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String name;
    private String phone;

    private String role; // CONSUMER, RESTAURANT_PARTNER, DELIVERY_COURIER, ADMIN

    // Loyalty points for gamified reviews
    private int loyaltyPoints = 0;

    // Address for consumers
    private String address;
    private double latitude;
    private double longitude;

    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;

    // For restaurant partners - their restaurant ID
    private String restaurantId;
}
