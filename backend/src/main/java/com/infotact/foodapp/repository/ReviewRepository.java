package com.infotact.foodapp.repository;

import com.infotact.foodapp.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByRestaurantId(String restaurantId);
    List<Review> findByCustomerId(String customerId);
    Optional<Review> findByOrderId(String orderId);
    boolean existsByOrderId(String orderId);
}
