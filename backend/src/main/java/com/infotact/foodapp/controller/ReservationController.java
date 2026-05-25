package com.infotact.foodapp.controller;

import com.infotact.foodapp.model.TableReservation;
import com.infotact.foodapp.service.ReservationService;
import com.infotact.foodapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired private ReservationService reservationService;
    @Autowired private UserRepository userRepository;

    private String getUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody TableReservation req, Authentication auth) {
        try {
            return ResponseEntity.ok(reservationService.createReservation(req, getUserId(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id,
                                           @RequestParam String status,
                                           Authentication auth) {
        try {
            return ResponseEntity.ok(reservationService.updateStatus(id, status, getUserId(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<?> myReservations(Authentication auth) {
        return ResponseEntity.ok(reservationService.getCustomerReservations(getUserId(auth)));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> restaurantReservations(@PathVariable String restaurantId) {
        return ResponseEntity.ok(reservationService.getRestaurantReservations(restaurantId));
    }
}
