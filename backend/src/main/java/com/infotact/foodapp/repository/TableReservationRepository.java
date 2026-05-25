package com.infotact.foodapp.repository;

import com.infotact.foodapp.model.TableReservation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface TableReservationRepository extends MongoRepository<TableReservation, String> {
    List<TableReservation> findByRestaurantId(String restaurantId);
    List<TableReservation> findByCustomerId(String customerId);
    List<TableReservation> findByRestaurantIdAndStatus(String restaurantId, String status);
    List<TableReservation> findByRestaurantIdAndReservationDateTimeBetween(
        String restaurantId, LocalDateTime start, LocalDateTime end);
}
