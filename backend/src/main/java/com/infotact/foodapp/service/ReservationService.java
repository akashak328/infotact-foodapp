package com.infotact.foodapp.service;

import com.infotact.foodapp.model.*;
import com.infotact.foodapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    @Autowired private TableReservationRepository reservationRepository;
    @Autowired private RestaurantRepository restaurantRepository;
    @Autowired private UserRepository userRepository;

    public TableReservation createReservation(TableReservation req, String customerId) {
        Restaurant restaurant = restaurantRepository.findById(req.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (!restaurant.isAcceptingReservations())
            throw new RuntimeException("Restaurant not accepting reservations");

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check for conflicts in ±1 hour window
        LocalDateTime windowStart = req.getReservationDateTime().minusHours(1);
        LocalDateTime windowEnd = req.getReservationDateTime().plusHours(1);

        List<TableReservation> conflicts = reservationRepository
                .findByRestaurantIdAndReservationDateTimeBetween(
                        req.getRestaurantId(), windowStart, windowEnd);

        long confirmedCount = conflicts.stream()
                .filter(r -> r.getStatus().equals("CONFIRMED")).count();

        // Allow max 10 concurrent reservations per hour slot
        if (confirmedCount >= 10)
            throw new RuntimeException("No tables available for this time slot. Please choose another time.");

        req.setCustomerId(customerId);
        req.setCustomerName(customer.getName());
        req.setRestaurantName(restaurant.getName());
        req.setStatus("PENDING");

        return reservationRepository.save(req);
    }

    public TableReservation updateStatus(String id, String status, String actorId) {
        TableReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        Restaurant restaurant = restaurantRepository.findById(reservation.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        // Only restaurant owner or customer can update
        boolean isOwner = restaurant.getOwnerId().equals(actorId);
        boolean isCustomer = reservation.getCustomerId().equals(actorId);

        if (!isOwner && !isCustomer)
            throw new RuntimeException("Unauthorized");

        reservation.setStatus(status.toUpperCase());
        return reservationRepository.save(reservation);
    }

    public List<TableReservation> getCustomerReservations(String customerId) {
        return reservationRepository.findByCustomerId(customerId);
    }

    public List<TableReservation> getRestaurantReservations(String restaurantId) {
        return reservationRepository.findByRestaurantId(restaurantId);
    }
}
