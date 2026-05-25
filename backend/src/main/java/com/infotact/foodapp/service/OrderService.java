package com.infotact.foodapp.service;

import com.infotact.foodapp.dto.OrderDTO.*;
import com.infotact.foodapp.model.*;
import com.infotact.foodapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private RestaurantRepository restaurantRepository;
    @Autowired private MenuItemRepository menuItemRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    // Valid state transitions
    private static final Map<String, List<String>> VALID_TRANSITIONS = new HashMap<>();
    static {
        VALID_TRANSITIONS.put("PENDING",          List.of("CONFIRMED", "CANCELLED"));
        VALID_TRANSITIONS.put("CONFIRMED",        List.of("PREPARING", "CANCELLED"));
        VALID_TRANSITIONS.put("PREPARING",        List.of("READY"));
        VALID_TRANSITIONS.put("READY",            List.of("COURIER_ASSIGNED"));
        VALID_TRANSITIONS.put("COURIER_ASSIGNED", List.of("PICKED_UP"));
        VALID_TRANSITIONS.put("PICKED_UP",        List.of("IN_TRANSIT"));
        VALID_TRANSITIONS.put("IN_TRANSIT",       List.of("DELIVERED"));
        VALID_TRANSITIONS.put("DELIVERED",        List.of());
        VALID_TRANSITIONS.put("CANCELLED",        List.of());
    }

    public Order createOrder(CreateOrderRequest req, String customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Restaurant restaurant = restaurantRepository.findById(req.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (!restaurant.isAcceptingOrders())
            throw new RuntimeException("Restaurant is not accepting orders right now");

        // Build order items
        List<Order.OrderItem> orderItems = new ArrayList<>();
        double subtotal = 0;

        for (OrderItemRequest itemReq : req.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemReq.getMenuItemId()));

            if (!menuItem.isAvailable())
                throw new RuntimeException("Item not available: " + menuItem.getName());

            double itemTotal = menuItem.getPrice() * itemReq.getQuantity();
            Order.OrderItem oi = new Order.OrderItem(
                    menuItem.getId(), menuItem.getName(),
                    menuItem.getPrice(), itemReq.getQuantity(),
                    itemTotal, itemReq.getSpecialNote());
            orderItems.add(oi);
            subtotal += itemTotal;
        }

        if (subtotal < restaurant.getMinimumOrderAmount())
            throw new RuntimeException("Minimum order amount is ₹" + restaurant.getMinimumOrderAmount());

        double taxes = Math.round(subtotal * 0.05 * 100.0) / 100.0; // 5% GST
        double deliveryFee = req.getOrderType().equals("DINE_IN") ? 0 : restaurant.getDeliveryFee();
        double total = subtotal + taxes + deliveryFee;

        Order order = new Order();
        order.setCustomerId(customerId);
        order.setCustomerName(customer.getName());
        order.setRestaurantId(restaurant.getId());
        order.setRestaurantName(restaurant.getName());
        order.setItems(orderItems);
        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTaxes(taxes);
        order.setTotalAmount(total);
        order.setDeliveryAddress(req.getDeliveryAddress());
        order.setDeliveryLatitude(req.getDeliveryLatitude());
        order.setDeliveryLongitude(req.getDeliveryLongitude());
        order.setOrderType(req.getOrderType());
        order.setPaymentMethod(req.getPaymentMethod());
        order.setSpecialInstructions(req.getSpecialInstructions());
        order.setStatus("PENDING");
        order.setPaymentStatus("PENDING");
        order.setEstimatedDeliveryTime(
            LocalDateTime.now().plusMinutes(restaurant.getAverageDeliveryTime()));

        Order saved = orderRepository.save(order);

        // Notify restaurant via WebSocket
        messagingTemplate.convertAndSend(
            "/topic/restaurant/" + restaurant.getId() + "/orders",
            Map.of("event", "NEW_ORDER", "order", saved));

        return saved;
    }

    public Order updateStatus(String orderId, StatusUpdateRequest req, String actorId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String currentStatus = order.getStatus();
        String newStatus = req.getStatus().toUpperCase();

        List<String> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, List.of());
        if (!allowed.contains(newStatus))
            throw new RuntimeException(
                "Invalid transition from " + currentStatus + " to " + newStatus);

        order.setStatus(newStatus);

        if (newStatus.equals("COURIER_ASSIGNED") && req.getCourierId() != null)
            order.setCourierId(req.getCourierId());

        Order updated = orderRepository.save(order);

        // Broadcast live update to customer, restaurant and courier
        Map<String, Object> payload = Map.of(
            "event", "ORDER_STATUS_UPDATE",
            "orderId", orderId,
            "status", newStatus,
            "timestamp", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend("/topic/order/" + orderId, payload);

        // Notify restaurant dashboard
        messagingTemplate.convertAndSend(
            "/topic/restaurant/" + order.getRestaurantId() + "/updates", payload);

        return updated;
    }

    public Order confirmPayment(String orderId, String transactionId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaymentStatus("PAID");
        order.setTransactionId(transactionId != null ? transactionId : "TXN-" + System.currentTimeMillis());
        order.setStatus("CONFIRMED");
        Order saved = orderRepository.save(order);

        messagingTemplate.convertAndSend("/topic/order/" + orderId,
            Map.of("event", "PAYMENT_CONFIRMED", "orderId", orderId, "status", "CONFIRMED"));

        return saved;
    }

    public List<Order> getCustomerOrders(String customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<Order> getRestaurantOrders(String restaurantId) {
        return orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }

    public List<Order> getActiveRestaurantOrders(String restaurantId) {
        List<String> activeStatuses = List.of("PENDING","CONFIRMED","PREPARING","READY","COURIER_ASSIGNED");
        return orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream()
                .filter(o -> activeStatuses.contains(o.getStatus()))
                .collect(Collectors.toList());
    }

    public Order getById(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
}
