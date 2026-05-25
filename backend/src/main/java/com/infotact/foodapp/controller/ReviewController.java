package com.infotact.foodapp.controller;

import com.infotact.foodapp.dto.ReviewDTO.*;
import com.infotact.foodapp.service.ReviewService;
import com.infotact.foodapp.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired private ReviewService reviewService;
    @Autowired private UserRepository userRepository;

    private String getUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    @PostMapping
    public ResponseEntity<?> submit(@Valid @RequestBody CreateReviewRequest req,
                                     Authentication auth) {
        try {
            return ResponseEntity.ok(reviewService.submitReview(req, getUserId(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> restaurantReviews(@PathVariable String restaurantId) {
        return ResponseEntity.ok(reviewService.getRestaurantReviews(restaurantId));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<?> myReviews(Authentication auth) {
        return ResponseEntity.ok(reviewService.getCustomerReviews(getUserId(auth)));
    }
}
