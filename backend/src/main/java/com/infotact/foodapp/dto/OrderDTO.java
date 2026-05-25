package com.infotact.foodapp.dto;

import com.infotact.foodapp.model.Order;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.util.List;

public class OrderDTO {

    @Data
    public static class CreateOrderRequest {
        @NotBlank
        private String restaurantId;

        @NotEmpty
        private List<OrderItemRequest> items;

        @NotBlank
        private String deliveryAddress;

        private double deliveryLatitude;
        private double deliveryLongitude;

        @NotBlank
        private String orderType; // DELIVERY, DINE_IN

        @NotBlank
        private String paymentMethod; // CASH, CARD, UPI

        private String specialInstructions;
    }

    @Data
    public static class OrderItemRequest {
        @NotBlank
        private String menuItemId;

        @Min(1)
        private int quantity;

        private String specialNote;
    }

    @Data
    public static class StatusUpdateRequest {
        @NotBlank
        private String status;
        private String courierId;
    }

    @Data
    public static class PaymentRequest {
        @NotBlank
        private String orderId;
        @NotBlank
        private String paymentMethod;
        private String transactionId;
    }
}
