package com.infotact.foodapp.service;

import com.infotact.foodapp.model.Restaurant;
import com.infotact.foodapp.model.MenuItem;
import com.infotact.foodapp.repository.RestaurantRepository;
import com.infotact.foodapp.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    @Autowired private RestaurantRepository restaurantRepository;
    @Autowired private MenuItemRepository menuItemRepository;

    // Find restaurants within radius (km), sorted by distance
    public List<Restaurant> findNearby(double latitude, double longitude,
                                       double radiusKm, String cuisineType) {
        double radiusMeters = radiusKm * 1000;

        List<Restaurant> results;
        if (cuisineType != null && !cuisineType.isBlank()) {
            results = restaurantRepository.findNearbyRestaurantsByCuisine(
                    longitude, latitude, radiusMeters, cuisineType);
        } else {
            results = restaurantRepository.findNearbyRestaurants(
                    longitude, latitude, radiusMeters);
        }

        // Attach distance to each result
        results.forEach(r -> {
            double dist = calculateDistanceKm(latitude, longitude,
                    r.getLocation()[1], r.getLocation()[0]);
            r.setDeliveryRadius(Math.round(dist * 10.0) / 10.0); // reuse field for display
        });

        return results;
    }

    public Restaurant getById(String id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + id));
    }

    public Restaurant create(Restaurant restaurant, String ownerId, String ownerEmail) {
        restaurant.setOwnerId(ownerId);
        restaurant.setOwnerEmail(ownerEmail);
        return restaurantRepository.save(restaurant);
    }

    public Restaurant update(String id, Restaurant updated, String ownerId) {
        Restaurant existing = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        if (!existing.getOwnerId().equals(ownerId))
            throw new RuntimeException("Unauthorized");

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setCuisineType(updated.getCuisineType());
        existing.setAddress(updated.getAddress());
        existing.setPhone(updated.getPhone());
        existing.setOpenTime(updated.getOpenTime());
        existing.setCloseTime(updated.getCloseTime());
        existing.setDeliveryFee(updated.getDeliveryFee());
        existing.setMinimumOrderAmount(updated.getMinimumOrderAmount());
        existing.setAcceptingOrders(updated.isAcceptingOrders());
        existing.setAcceptingReservations(updated.isAcceptingReservations());
        return restaurantRepository.save(existing);
    }

    public List<MenuItem> getMenu(String restaurantId) {
        return menuItemRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId);
    }

    public MenuItem addMenuItem(MenuItem item, String restaurantId) {
        item.setRestaurantId(restaurantId);
        return menuItemRepository.save(item);
    }

    public MenuItem updateMenuItem(String itemId, MenuItem updated, String restaurantId) {
        MenuItem existing = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        if (!existing.getRestaurantId().equals(restaurantId))
            throw new RuntimeException("Unauthorized");
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        existing.setAvailable(updated.isAvailable());
        return menuItemRepository.save(existing);
    }

    public void deleteMenuItem(String itemId, String restaurantId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        if (!item.getRestaurantId().equals(restaurantId))
            throw new RuntimeException("Unauthorized");
        menuItemRepository.delete(item);
    }

    public void updateRating(String restaurantId, double newRating) {
        Restaurant r = getById(restaurantId);
        int total = r.getTotalReviews();
        double updated = ((r.getAverageRating() * total) + newRating) / (total + 1);
        r.setAverageRating(Math.round(updated * 10.0) / 10.0);
        r.setTotalReviews(total + 1);
        restaurantRepository.save(r);
    }

    public List<Restaurant> getAll() {
        return restaurantRepository.findByIsOpenTrue();
    }

    // Haversine formula for distance calculation
    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
