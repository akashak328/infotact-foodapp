import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

export const connectWebSocket = (onConnected, onError) => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('WebSocket connected');
      if (onConnected) onConnected();
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame);
      if (onError) onError(frame);
    }
  });
  stompClient.activate();
  return stompClient;
};

export const subscribeToOrder = (orderId, callback) => {
  if (!stompClient || !stompClient.connected) return null;
  return stompClient.subscribe(`/topic/order/${orderId}`, (msg) => {
    callback(JSON.parse(msg.body));
  });
};

export const subscribeToOrderLocation = (orderId, callback) => {
  if (!stompClient || !stompClient.connected) return null;
  return stompClient.subscribe(`/topic/order/${orderId}/location`, (msg) => {
    callback(JSON.parse(msg.body));
  });
};

export const subscribeToRestaurantOrders = (restaurantId, callback) => {
  if (!stompClient || !stompClient.connected) return null;
  return stompClient.subscribe(`/topic/restaurant/${restaurantId}/orders`, (msg) => {
    callback(JSON.parse(msg.body));
  });
};

export const subscribeToRestaurantUpdates = (restaurantId, callback) => {
  if (!stompClient || !stompClient.connected) return null;
  return stompClient.subscribe(`/topic/restaurant/${restaurantId}/updates`, (msg) => {
    callback(JSON.parse(msg.body));
  });
};

export const sendCourierLocation = (orderId, lat, lng) => {
  if (!stompClient || !stompClient.connected) return;
  stompClient.publish({
    destination: '/app/courier/location',
    body: JSON.stringify({ orderId, latitude: lat, longitude: lng, timestamp: new Date() })
  });
};

export const disconnectWebSocket = () => {
  if (stompClient) stompClient.deactivate();
};
