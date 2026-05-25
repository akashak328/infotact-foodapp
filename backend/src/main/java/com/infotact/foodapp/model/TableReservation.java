package com.infotact.foodapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "table_reservations")
public class TableReservation {

    @Id
    private String id;

    private String restaurantId;
    private String restaurantName;
    private String customerId;
    private String customerName;
    private String customerPhone;

    private LocalDateTime reservationDateTime;
    private int numberOfGuests;
    private String tableNumber;

    // PENDING, CONFIRMED, CANCELLED, COMPLETED
    private String status = "PENDING";

    private String specialRequests;

    @CreatedDate
    private LocalDateTime createdAt;
}
