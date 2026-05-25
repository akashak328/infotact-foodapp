package com.infotact.foodapp.controller;

import com.infotact.foodapp.model.*;
import com.infotact.foodapp.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.infotact.foodapp.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired private RestaurantService restaurantService;
    @Autowired private UserRepository userRepository;

    // Public - find nearby restaurants
    @GetMapping("/nearby")
    public ResponseEntity<?> findNearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius,
            @RequestParam(required = false) String cuisine) {
        return ResponseEntity.ok(restaurantService.findNearby(lat, lng, radius, cuisine));
    }

    // Public - get all open restaurants
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(restaurantService.getAll());
    }

    // Public - get restaurant by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(restaurantService.getById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Public - get menu
    @GetMapping("/{id}/menu")
    public ResponseEntity<List<MenuItem>> getMenu(@PathVariable String id) {
        return ResponseEntity.ok(restaurantService.getMenu(id));
    }

    // Partner only - create restaurant
    @PostMapping
    @PreAuthorize("hasRole('RESTAURANT_PARTNER')")
    public ResponseEntity<?> create(@RequestBody Restaurant restaurant, Authentication auth) {
        try {
            var user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(restaurantService.create(restaurant, user.getId(), user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Partner only - update restaurant
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT_PARTNER')")
    public ResponseEntity<?> update(@PathVariable String id,
                                    @RequestBody Restaurant restaurant,
                                    Authentication auth) {
        try {
            var user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(restaurantService.update(id, restaurant, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Partner only - add menu item
    @PostMapping("/{id}/menu")
    @PreAuthorize("hasRole('RESTAURANT_PARTNER')")
    public ResponseEntity<?> addMenuItem(@PathVariable String id,
                                         @RequestBody MenuItem item) {
        return ResponseEntity.ok(restaurantService.addMenuItem(item, id));
    }

    // Partner only - update menu item
    @PutMapping("/{restaurantId}/menu/{itemId}")
    @PreAuthorize("hasRole('RESTAURANT_PARTNER')")
    public ResponseEntity<?> updateMenuItem(@PathVariable String restaurantId,
                                            @PathVariable String itemId,
                                            @RequestBody MenuItem item) {
        return ResponseEntity.ok(restaurantService.updateMenuItem(itemId, item, restaurantId));
    }

    // Partner only - delete menu item
    @DeleteMapping("/{restaurantId}/menu/{itemId}")
    @PreAuthorize("hasRole('RESTAURANT_PARTNER')")
    public ResponseEntity<?> deleteMenuItem(@PathVariable String restaurantId,
                                            @PathVariable String itemId) {
        restaurantService.deleteMenuItem(itemId, restaurantId);
        return ResponseEntity.ok("Item deleted");
    }
}
