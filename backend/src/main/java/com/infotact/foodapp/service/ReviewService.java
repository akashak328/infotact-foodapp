package com.infotact.foodapp.service;

import com.infotact.foodapp.dto.ReviewDTO.*;
import com.infotact.foodapp.model.*;
import com.infotact.foodapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RestaurantService restaurantService;

    // Keywords that earn bonus points
    private static final List<String> QUALITY_KEYWORDS = List.of(
        "delicious", "fresh", "hot", "crispy", "flavorful", "tasty", "excellent",
        "amazing", "fast", "quick", "prompt", "courteous", "packaging", "hygienic",
        "value", "recommend", "authentic", "spicy", "juicy", "tender"
    );

    public ReviewResponse submitReview(CreateReviewRequest req, String customerId) {
        if (reviewRepository.existsByOrderId(req.getOrderId()))
            throw new RuntimeException("Review already submitted for this order");

        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getCustomerId().equals(customerId))
            throw new RuntimeException("Unauthorized");

        if (!order.getStatus().equals("DELIVERED"))
            throw new RuntimeException("Can only review delivered orders");

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // --- Gamification Engine ---
        String text = req.getReviewText().toLowerCase();
        String[] words = text.split("\\s+");
        int wordCount = words.length;

        int points = 0;
        StringBuilder breakdown = new StringBuilder();

        // Base points
        points += 10;
        breakdown.append("Base review: +10pts | ");

        // Word count bonus
        if (wordCount >= 50) { points += 20; breakdown.append("50+ words: +20pts | "); }
        else if (wordCount >= 30) { points += 10; breakdown.append("30+ words: +10pts | "); }
        else if (wordCount >= 15) { points += 5; breakdown.append("15+ words: +5pts | "); }

        // Rating bonus
        if (req.getOverallRating() == 5) { points += 5; breakdown.append("5-star: +5pts | "); }

        // Keyword detection bonus
        List<String> foundKeywords = QUALITY_KEYWORDS.stream()
                .filter(kw -> text.contains(kw))
                .collect(Collectors.toList());
        int kwBonus = Math.min(foundKeywords.size() * 3, 15);
        if (kwBonus > 0) {
            points += kwBonus;
            breakdown.append("Keywords(").append(foundKeywords.size()).append("): +").append(kwBonus).append("pts | ");
        }

        // Media bonus
        boolean hasMedia = req.getImageUrls() != null && !req.getImageUrls().isEmpty();
        if (hasMedia) { points += 15; breakdown.append("Photo: +15pts"); }

        // Save review
        Review review = new Review();
        review.setOrderId(req.getOrderId());
        review.setRestaurantId(order.getRestaurantId());
        review.setCustomerId(customerId);
        review.setCustomerName(customer.getName());
        review.setFoodRating(req.getFoodRating());
        review.setDeliveryRating(req.getDeliveryRating());
        review.setOverallRating(req.getOverallRating());
        review.setReviewText(req.getReviewText());
        review.setWordCount(wordCount);
        review.setPointsEarned(points);
        review.setPointsBreakdown(breakdown.toString());
        review.setDetectedKeywords(foundKeywords);
        review.setImageUrls(req.getImageUrls());
        review.setHasMedia(hasMedia);
        reviewRepository.save(review);

        // Mark order as reviewed
        order.setReviewSubmitted(true);
        orderRepository.save(order);

        // Award points to customer
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
        userRepository.save(customer);

        // Update restaurant average rating
        restaurantService.updateRating(order.getRestaurantId(), req.getOverallRating());

        ReviewResponse response = new ReviewResponse();
        response.setReviewId(review.getId());
        response.setPointsEarned(points);
        response.setPointsBreakdown(breakdown.toString());
        response.setNewTotalPoints(customer.getLoyaltyPoints());
        response.setMessage("Review submitted! You earned " + points + " loyalty points 🎉");

        return response;
    }

    public List<Review> getRestaurantReviews(String restaurantId) {
        return reviewRepository.findByRestaurantId(restaurantId);
    }

    public List<Review> getCustomerReviews(String customerId) {
        return reviewRepository.findByCustomerId(customerId);
    }
}
