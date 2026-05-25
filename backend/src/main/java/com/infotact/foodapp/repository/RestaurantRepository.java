package com.infotact.foodapp.repository;

import com.infotact.foodapp.model.Restaurant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RestaurantRepository extends MongoRepository<Restaurant, String> {

    List<Restaurant> findByCuisineType(String cuisineType);
    List<Restaurant> findByIsOpenTrue();
    List<Restaurant> findByOwnerId(String ownerId);
    Page<Restaurant> findByIsOpenTrue(Pageable pageable);

    @Query("{ 'location': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } }, 'isOpen': true }")
    List<Restaurant> findNearbyRestaurants(double longitude, double latitude, double maxDistanceInMeters);

    @Query("{ 'location': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } }, 'isOpen': true, 'cuisineType': ?3 }")
    List<Restaurant> findNearbyRestaurantsByCuisine(double longitude, double latitude, double maxDistanceInMeters, String cuisineType);
}
