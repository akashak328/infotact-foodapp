package com.infotact.foodapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.geo.Point;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "restaurants")
public class Restaurant {

    @Id
    private String id;

    private String name;
    private String description;
    private String ownerId;
    private String ownerEmail;

    private String cuisineType;   // Indian, Chinese, Italian, etc.
    private String category;      // Fine Dining, Casual, Fast Food, Cafe

    private String address;
    private String city;
    private String pincode;

    // GeoJSON 2dsphere index for geospatial queries
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private double[] location; // [longitude, latitude]

    private String phone;
    private String imageUrl;

    // Rating
    private double averageRating = 0.0;
    private int totalReviews = 0;

    // Operating hours
    private String openTime;  // "09:00"
    private String closeTime; // "22:00"

    // Status
    private boolean isOpen = true;
    private boolean acceptingOrders = true;
    private boolean acceptingReservations = true;

    // Delivery settings
    private double deliveryRadius = 10.0; // km
    private double deliveryFee = 30.0;
    private double minimumOrderAmount = 100.0;
    private int averageDeliveryTime = 30; // minutes

    // Tags
    private List<String> tags;

    @CreatedDate
    private LocalDateTime createdAt;
}
