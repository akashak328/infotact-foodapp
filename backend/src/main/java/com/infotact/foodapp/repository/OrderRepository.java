package com.infotact.foodapp.repository;

import com.infotact.foodapp.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    List<Order> findByRestaurantIdOrderByCreatedAtDesc(String restaurantId);
    List<Order> findByRestaurantIdAndStatus(String restaurantId, String status);
    List<Order> findByCourierIdAndStatus(String courierId, String status);
    Page<Order> findByCustomerId(String customerId, Pageable pageable);
}
