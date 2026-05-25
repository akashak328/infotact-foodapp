package com.infotact.foodapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String customerId;
    private String customerName;
    private String restaurantId;
    private String restaurantName;
    private String courierId;

    private List<OrderItem> items;

    // Pricing
    private double subtotal;
    private double deliveryFee;
    private double taxes;
    private double totalAmount;
    private double discountAmount = 0;

    // Delivery address
    private String deliveryAddress;
    private double deliveryLatitude;
    private double deliveryLongitude;

    // Order type
    private String orderType; // DELIVERY, DINE_IN

    // State Machine Status
    // PENDING -> CONFIRMED -> PREPARING -> READY -> COURIER_ASSIGNED
    //   -> PICKED_UP -> IN_TRANSIT -> DELIVERED
    // or CANCELLED
    private String status = "PENDING";

    // Payment
    private String paymentMethod; // CASH, CARD, UPI
    private String paymentStatus = "PENDING"; // PENDING, PAID, FAILED, REFUNDED
    private String transactionId;

    // Special instructions
    private String specialInstructions;

    // Review submitted
    private boolean reviewSubmitted = false;

    // Estimated delivery time
    private LocalDateTime estimatedDeliveryTime;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String menuItemId;
        private String name;
        private double price;
        private int quantity;
        private double totalPrice;
        private String specialNote;
    }
}
