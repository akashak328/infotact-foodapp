package com.infotact.foodapp.repository;

import com.infotact.foodapp.model.MenuItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MenuItemRepository extends MongoRepository<MenuItem, String> {
    List<MenuItem> findByRestaurantId(String restaurantId);
    List<MenuItem> findByRestaurantIdAndIsAvailableTrue(String restaurantId);
    List<MenuItem> findByRestaurantIdAndCategory(String restaurantId, String category);
}
