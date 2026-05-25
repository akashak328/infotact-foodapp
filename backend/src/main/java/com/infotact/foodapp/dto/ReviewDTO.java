package com.infotact.foodapp.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.util.List;

public class ReviewDTO {

    @Data
    public static class CreateReviewRequest {
        @NotBlank
        private String orderId;

        @Min(1) @Max(5)
        private int foodRating;

        @Min(1) @Max(5)
        private int deliveryRating;

        @Min(1) @Max(5)
        private int overallRating;

        @NotBlank
        @Size(min = 20, message = "Review must be at least 20 characters")
        private String reviewText;

        private List<String> imageUrls;
    }

    @Data
    public static class ReviewResponse {
        private String reviewId;
        private int pointsEarned;
        private String pointsBreakdown;
        private int newTotalPoints;
        private String message;
    }
}
