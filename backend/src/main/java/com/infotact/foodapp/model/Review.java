package com.infotact.foodapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    private String orderId;
    private String restaurantId;
    private String customerId;
    private String customerName;

    // Rating (1-5)
    private int foodRating;
    private int deliveryRating;
    private int overallRating;

    // Review text
    private String reviewText;
    private int wordCount;

    // Gamification
    private int pointsEarned = 0;
    private String pointsBreakdown; // explanation of how points were calculated

    // Keywords found in review
    private List<String> detectedKeywords;

    // Media
    private List<String> imageUrls;
    private boolean hasMedia = false;

    @CreatedDate
    private LocalDateTime createdAt;
}
