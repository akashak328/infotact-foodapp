package com.infotact.foodapp.controller;

import com.infotact.foodapp.dto.OrderDTO.*;
import com.infotact.foodapp.service.OrderService;
import com.infotact.foodapp.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired private OrderService orderService;
    @Autowired private UserRepository userRepository;

    private String getUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest req,
                                          Authentication auth) {
        try {
            return ResponseEntity.ok(orderService.createOrder(req, getUserId(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> myOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.getCustomerOrders(getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id) {
        try {
            return ResponseEntity.ok(orderService.getById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Restaurant/courier update status
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id,
                                           @RequestBody StatusUpdateRequest req,
                                           Authentication auth) {
        try {
            return ResponseEntity.ok(orderService.updateStatus(id, req, getUserId(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Simulate payment
    @PostMapping("/{id}/pay")
    public ResponseEntity<?> pay(@PathVariable String id,
                                  @RequestBody(required = false) PaymentRequest req) {
        try {
            String txnId = req != null ? req.getTransactionId() : null;
            return ResponseEntity.ok(orderService.confirmPayment(id, txnId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Restaurant - get all orders
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> restaurantOrders(@PathVariable String restaurantId) {
        return ResponseEntity.ok(orderService.getRestaurantOrders(restaurantId));
    }

    // Restaurant - get active orders only
    @GetMapping("/restaurant/{restaurantId}/active")
    public ResponseEntity<?> activeOrders(@PathVariable String restaurantId) {
        return ResponseEntity.ok(orderService.getActiveRestaurantOrders(restaurantId));
    }
}
