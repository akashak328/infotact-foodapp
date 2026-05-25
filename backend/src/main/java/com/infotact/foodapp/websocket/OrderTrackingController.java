package com.infotact.foodapp.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class OrderTrackingController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Courier sends GPS location updates
    @MessageMapping("/courier/location")
    public void updateCourierLocation(@Payload Map<String, Object> payload) {
        String orderId = (String) payload.get("orderId");
        // Broadcast GPS update to customer tracking topic
        messagingTemplate.convertAndSend("/topic/order/" + orderId + "/location", payload);
    }

    // Restaurant sends order status change
    @MessageMapping("/order/status")
    public void statusUpdate(@Payload Map<String, Object> payload) {
        String orderId = (String) payload.get("orderId");
        messagingTemplate.convertAndSend("/topic/order/" + orderId, payload);
    }
}
