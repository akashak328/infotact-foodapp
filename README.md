<div align="center">

<img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"/>
<img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white"/>
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/WebSocket-STOMP-FF6B35?style=for-the-badge"/>
<img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>

<br/><br/>

# 🍽️ Infotact Food & Hospitality Platform

### Enterprise-grade Full-Stack Food Delivery & Dine-Out Ecosystem

*Built as part of the Infotact Technical Internship Program — Bengaluru, Karnataka*

[Features](#-features) • [Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [WebSocket Events](#-websocket-real-time-events) • [User Guide](#-user-guide) • [GitHub Strategy](#-github-commit-strategy)

</div>

---

## 📌 Overview

Infotact Food Platform is a **production-grade, cloud-native food delivery and hospitality application** that unifies food ordering, real-time delivery tracking, table reservations, and a gamified review system into one cohesive ecosystem.

This platform directly addresses the fragmentation problem in modern food-tech — where consumers juggle multiple apps for delivery, reservations, and discovery. Built with an enterprise Java backend and a reactive React frontend, it mirrors the architecture of industry platforms like Swiggy and Zomato.

> **Evaluation Requirement:** This project maintains **4 weeks of consistent daily GitHub commits** with conventional commit messages, feature branching, and Pull Request workflows — demonstrating professional engineering practices.

---

## ✨ Features

### 🔍 Geospatial Restaurant Discovery
- GPS-based restaurant search using **MongoDB 2dsphere indexing**
- Filter by cuisine type, rating, and delivery radius
- Haversine distance calculation for accurate proximity sorting
- Sub-200ms geospatial query performance

### 📦 Smart Order Management
- Full **8-state order state machine**: `PENDING → CONFIRMED → PREPARING → READY → COURIER_ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED`
- Strict state transition validation — prevents illegal status jumps
- Multi-item cart with restaurant-conflict prevention
- GST calculation (5%), dynamic delivery fee, and order summary

### 📡 Real-Time Order Tracking (WebSocket)
- **STOMP over SockJS** for persistent bidirectional communication
- Live status updates pushed to customer, restaurant, and courier simultaneously
- Courier GPS location streaming
- Zero polling — event-driven architecture

### ⭐ Gamified Review Engine
- Dynamic point scoring based on review word count, keyword density, and media uploads
- Loyalty points accumulate across orders and unlock rewards
- Quality keywords detection: `delicious`, `fresh`, `crispy`, `fast`, `recommend`, and 16 more
- Point breakdown transparency shown to user after each review

### 📅 Table Reservation System
- Datetime-based reservation with ±1 hour conflict detection algorithm
- Maximum concurrent reservation capacity enforcement per slot
- Restaurant partner confirmation/rejection workflow
- Customer cancellation with status tracking

### 🔐 Enterprise Security
- **Stateless JWT authentication** with configurable expiration
- **Role-Based Access Control (RBAC)** for 3 distinct user roles
- BCrypt password hashing with salt rounds
- Secured REST endpoints with Spring Security filter chain

### 🏪 Restaurant Partner Dashboard
- Live incoming order feed via WebSocket subscription
- Real-time reservation management
- Order status progression controls
- Menu item availability toggling

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│   React 18 SPA (Port 3000)                                       │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│   │ Auth     │ │ Cart     │ │ Pages    │ │ WebSocket Client   │ │
│   │ Context  │ │ Context  │ │ (Router) │ │ (STOMP + SockJS)   │ │
│   └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │
│          │ HTTP (Axios + JWT)          │ ws://                   │
└──────────┼─────────────────────────────┼────────────────────────┘
           │                             │
           ▼                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│              Nginx Reverse Proxy (Port 80)                       │
│    /api/*  ──────────────► :8080    /ws/* ───────────► :8080    │
└──────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    SPRING BOOT BACKEND (Port 8080)               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  Security Filter Chain                      │ │
│  │   JwtAuthFilter → Spring Security → RBAC Authorization     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐  │
│  │  Auth    │ │Restaurant│ │  Order   │ │Review  │ │Reserve │  │
│  │Controller│ │Controller│ │Controller│ │Control.│ │Control.│  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ └───┬────┘  │
│       │            │            │            │          │       │
│  ┌────▼─────┐ ┌────▼─────┐ ┌───▼──────┐ ┌───▼────┐ ┌───▼────┐  │
│  │  Auth    │ │Restaurant│ │  Order   │ │Review  │ │Reserve │  │
│  │ Service  │ │ Service  │ │ Service  │ │Service │ │Service │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ └───┬────┘  │
│       │            │            │  WebSocket │          │       │
│       │            │            │  Broadcast │          │       │
│  ┌────▼─────────────▼────────────▼────────────▼──────────▼────┐  │
│  │                  Repository Layer (MongoDB)                 │  │
│  │  UserRepo  RestaurantRepo  OrderRepo  ReviewRepo  ResvRepo  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          WebSocket Broker (STOMP)                        │   │
│  │  /topic/order/{id}  /topic/restaurant/{id}/orders        │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     DATA LAYER (Port 27017)                      │
│                         MongoDB 6.0                              │
│                                                                  │
│  ┌───────────┐ ┌─────────────┐ ┌────────────┐ ┌─────────────┐  │
│  │   users   │ │ restaurants │ │ menu_items │ │   orders    │  │
│  └───────────┘ └──────┬──────┘ └────────────┘ └─────────────┘  │
│                        │ 2dsphere                               │
│                   geospatial index                              │
│  ┌───────────┐ ┌─────────────┐                                  │
│  │  reviews  │ │table_resvns │                                  │
│  └───────────┘ └─────────────┘                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Backend Language** | Java | 17 LTS | Type-safe, enterprise-grade server logic |
| **Backend Framework** | Spring Boot | 3.2.0 | Auto-configuration, embedded Tomcat |
| **Security** | Spring Security + JWT | 6.x / 0.11.5 | Stateless auth, RBAC, BCrypt hashing |
| **Real-Time** | WebSocket (STOMP + SockJS) | — | Bidirectional live order tracking |
| **Database** | MongoDB | 6.0 | Flexible schema + 2dsphere geospatial |
| **ORM** | Spring Data MongoDB | 3.2 | Repository pattern, index management |
| **Build Tool** | Maven | 3.9.6 | Dependency management, packaging |
| **Frontend** | React.js | 18.2 | Component-based SPA |
| **HTTP Client** | Axios | 1.6 | JWT interceptor, API calls |
| **Routing** | React Router DOM | 6.20 | Client-side navigation, protected routes |
| **WS Client** | @stomp/stompjs + SockJS | 7.0 | WebSocket subscription management |
| **Containerization** | Docker + Docker Compose | Latest | Environment parity, one-command deploy |
| **Reverse Proxy** | Nginx | Alpine | API proxying, SPA routing fallback |
| **Boilerplate** | Lombok | — | Reduces Java boilerplate code |

---

## 📂 Project Structure

```
foodapp/
│
├── backend/                                    # Spring Boot Application
│   ├── Dockerfile                              # Multi-stage build (Maven → JRE)
│   ├── pom.xml                                 # Maven dependencies
│   └── src/main/java/com/infotact/foodapp/
│       ├── FoodAppApplication.java             # Entry point
│       ├── config/
│       │   ├── SecurityConfig.java             # Spring Security filter chain
│       │   ├── WebSocketConfig.java            # STOMP broker configuration
│       │   └── MongoConfig.java                # 2dsphere index on startup
│       ├── controller/
│       │   ├── AuthController.java             # POST /api/auth/register, /login
│       │   ├── RestaurantController.java       # Geospatial + CRUD endpoints
│       │   ├── OrderController.java            # Order lifecycle endpoints
│       │   ├── ReviewController.java           # Gamified review submission
│       │   └── ReservationController.java      # Table booking endpoints
│       ├── dto/
│       │   ├── AuthDTO.java                    # Register/Login request-response
│       │   ├── OrderDTO.java                   # Order creation, status update
│       │   └── ReviewDTO.java                  # Review request + points response
│       ├── model/
│       │   ├── User.java                       # @Document — users collection
│       │   ├── Restaurant.java                 # @Document — 2dsphere location field
│       │   ├── MenuItem.java                   # @Document — menu_items collection
│       │   ├── Order.java                      # @Document — order state machine
│       │   ├── Review.java                     # @Document — gamification scores
│       │   └── TableReservation.java           # @Document — reservation slots
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── RestaurantRepository.java       # @Query geospatial $nearSphere
│       │   ├── MenuItemRepository.java
│       │   ├── OrderRepository.java
│       │   ├── ReviewRepository.java
│       │   └── TableReservationRepository.java
│       ├── security/
│       │   ├── JwtUtil.java                    # Token generation + validation
│       │   ├── JwtAuthFilter.java              # OncePerRequestFilter
│       │   └── CustomUserDetailsService.java   # UserDetailsService impl
│       ├── service/
│       │   ├── AuthService.java                # Register, login, BCrypt
│       │   ├── RestaurantService.java          # Haversine distance, geo search
│       │   ├── OrderService.java               # State machine + WS broadcast
│       │   ├── ReviewService.java              # Keyword scoring, points award
│       │   └── ReservationService.java         # Conflict detection algorithm
│       └── websocket/
│           └── OrderTrackingController.java    # @MessageMapping handlers
│
├── frontend/                                   # React Application
│   ├── Dockerfile                              # Node build → Nginx serve
│   ├── nginx.conf                              # SPA routing + API proxy
│   ├── package.json
│   └── src/
│       ├── App.js                              # Routes + protected routes
│       ├── index.js                            # React DOM entry
│       ├── components/
│       │   └── Navbar.js                       # Role-aware navigation
│       ├── pages/
│       │   ├── HomePage.js                     # GPS discovery + restaurant grid
│       │   ├── RestaurantPage.js               # Menu, reserve table, reviews
│       │   ├── CartPage.js                     # Cart with quantity controls
│       │   ├── CheckoutPage.js                 # Payment + order placement
│       │   ├── OrderTrackingPage.js            # Live 8-step progress tracker
│       │   ├── MyOrdersPage.js                 # Order history
│       │   ├── MyReservationsPage.js           # Reservation management
│       │   ├── ReviewPage.js                   # Points-earning review form
│       │   ├── RestaurantDashboard.js          # Partner live order feed
│       │   ├── ProfilePage.js                  # Loyalty points display
│       │   ├── LoginPage.js                    # JWT login
│       │   └── RegisterPage.js                 # Role-based registration
│       ├── services/
│       │   ├── api.js                          # Axios instance + JWT interceptor
│       │   └── websocket.js                    # STOMP client + subscriptions
│       └── store/
│           ├── AuthContext.js                  # Global auth state
│           └── CartContext.js                  # Cart state + restaurant guard
│
├── seed.js                                     # MongoDB demo data script
├── docker-compose.yml                          # 3-service orchestration
└── README.md
```

---

## 🚀 Quick Start

### Option A — Docker Compose (Recommended)

> One command runs MongoDB + Spring Boot + React together.

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/infotact-foodapp.git
cd infotact-foodapp

# 2. Start all services
docker-compose up --build

# First build: ~8 minutes (downloads Maven + Node dependencies)
# Subsequent starts: ~30 seconds

# 3. Seed demo data (in a new terminal)
docker cp seed.js infotact_mongodb:/seed.js
docker exec -it infotact_mongodb mongosh infotact_foodapp /seed.js

# 4. Open browser
# Frontend  → http://localhost:3000
# Backend   → http://localhost:8080
```

---

### Option B — Manual Setup (3 terminals)

#### Prerequisites

```bash
java -version    # Must be 17+
mvn -version     # Must be 3.8+
node -version    # Must be 18+
mongod --version # Must be 6.0+
```

#### Terminal 1 — Start MongoDB

```bash
# Windows (if installed as service)
net start MongoDB

# Mac (Homebrew)
brew services start mongodb-community@6.0

# Linux
sudo systemctl start mongod

# Verify
mongosh --eval "db.runCommand({ ping: 1 })"
```

#### Terminal 2 — Start Backend

```bash
cd backend
mvn dependency:resolve          # First time: downloads all dependencies (~3 min)
mvn spring-boot:run

# Wait for:
# ✅ MongoDB indexes created successfully
# Started FoodAppApplication in X.XXX seconds
```

#### Terminal 3 — Start Frontend

```bash
cd frontend
npm install                     # First time only
npm start

# Browser opens at http://localhost:3000
```

---

### Seed Demo Data

```bash
# With mongosh installed locally
mongosh infotact_foodapp seed.js

# Or via Docker
docker cp seed.js infotact_mongodb:/seed.js
docker exec -it infotact_mongodb mongosh infotact_foodapp /seed.js
```

**Expected output:**
```
✅ Users seeded (3)
✅ Restaurants seeded (5)
✅ Menu items seeded (32)
✅ Geospatial 2dsphere index created
✅ Performance indexes created
```

---

## 🌐 API Reference

**Base URL:** `http://localhost:8080/api`

**Authentication:** All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | Public | Create account (CONSUMER / RESTAURANT_PARTNER / DELIVERY_COURIER) |
| `POST` | `/auth/login` | Public | Login, returns JWT + user info |

**Register Request:**
```json
POST /api/auth/register
{
  "name": "Akash Kumar",
  "email": "akash@example.com",
  "password": "yourpassword",
  "role": "CONSUMER",
  "phone": "9876543210",
  "address": "Salem, Tamil Nadu"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": "650abc123...",
  "name": "Akash Kumar",
  "email": "akash@example.com",
  "role": "CONSUMER",
  "loyaltyPoints": 0
}
```

---

### Restaurants

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/restaurants` | Public | All open restaurants |
| `GET` | `/restaurants/nearby?lat=&lng=&radius=&cuisine=` | Public | GPS-based geospatial search |
| `GET` | `/restaurants/{id}` | Public | Restaurant details |
| `GET` | `/restaurants/{id}/menu` | Public | Available menu items |
| `POST` | `/restaurants` | Partner | Create new restaurant |
| `PUT` | `/restaurants/{id}` | Partner | Update restaurant details |
| `POST` | `/restaurants/{id}/menu` | Partner | Add menu item |
| `PUT` | `/restaurants/{id}/menu/{itemId}` | Partner | Update menu item |
| `DELETE` | `/restaurants/{id}/menu/{itemId}` | Partner | Remove menu item |

**Geospatial Search Example:**
```
GET /api/restaurants/nearby?lat=11.6643&lng=78.1460&radius=10&cuisine=Fast Food

# Returns restaurants within 10km of Salem, filtered by Fast Food cuisine
# Sorted by distance (nearest first) using MongoDB $nearSphere
```

---

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/orders` | Customer | Place new order |
| `GET` | `/orders/my-orders` | Customer | Order history |
| `GET` | `/orders/{id}` | Any | Order details + items |
| `PATCH` | `/orders/{id}/status` | Partner/Courier | Advance order status |
| `POST` | `/orders/{id}/pay` | Customer | Simulate payment |
| `GET` | `/orders/restaurant/{id}` | Partner | All restaurant orders |
| `GET` | `/orders/restaurant/{id}/active` | Partner | Active orders only |

**Create Order Request:**
```json
POST /api/orders
{
  "restaurantId": "650000000000000000000013",
  "items": [
    { "menuItemId": "abc123", "quantity": 2, "specialNote": "Extra spicy" },
    { "menuItemId": "def456", "quantity": 1, "specialNote": "" }
  ],
  "deliveryAddress": "14, Salem Main Road, Salem",
  "deliveryLatitude": 11.6643,
  "deliveryLongitude": 78.1460,
  "orderType": "DELIVERY",
  "paymentMethod": "UPI",
  "specialInstructions": "Ring the bell twice"
}
```

**Order State Machine:**
```
PENDING ──► CONFIRMED ──► PREPARING ──► READY ──► COURIER_ASSIGNED
                                                         │
                                               PICKED_UP ◄──────┘
                                                   │
                                              IN_TRANSIT
                                                   │
                                              DELIVERED
                                                   │
                              (any state) ──► CANCELLED
```

**Status Update Request:**
```json
PATCH /api/orders/{id}/status
{
  "status": "PREPARING",
  "courierId": null
}
```

---

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/reviews` | Customer | Submit gamified review |
| `GET` | `/reviews/restaurant/{id}` | Public | Restaurant reviews |
| `GET` | `/reviews/my-reviews` | Customer | My submitted reviews |

**Submit Review Request:**
```json
POST /api/reviews
{
  "orderId": "abc123xyz",
  "foodRating": 5,
  "deliveryRating": 4,
  "overallRating": 5,
  "reviewText": "Absolutely delicious! The naatukozhi biriyani was very fresh and aromatic. Fast delivery and excellent packaging. Highly recommend to everyone!",
  "imageUrls": []
}
```

**Points Calculation Response:**
```json
{
  "reviewId": "rev_789",
  "pointsEarned": 58,
  "pointsBreakdown": "Base: +10 | 50+ words: +20 | 5-star: +5 | Keywords(3): +9 | Photo: +0",
  "newTotalPoints": 178,
  "message": "Review submitted! You earned 58 loyalty points 🎉"
}
```

---

### Reservations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/reservations` | Customer | Book a table |
| `PATCH` | `/reservations/{id}/status?status=` | Any | Confirm / Cancel |
| `GET` | `/reservations/my-reservations` | Customer | My bookings |
| `GET` | `/reservations/restaurant/{id}` | Partner | All bookings for restaurant |

**Book Table Request:**
```json
POST /api/reservations
{
  "restaurantId": "650000000000000000000014",
  "reservationDateTime": "2026-06-01T19:30:00",
  "numberOfGuests": 4,
  "customerPhone": "9080238836",
  "specialRequests": "Window seat preferred, birthday celebration"
}
```

---

## 📡 WebSocket Real-Time Events

**Connection:** `ws://localhost:8080/ws` (SockJS fallback enabled)

**Protocol:** STOMP over WebSocket

### Subscribe Topics (Client listens)

| Topic | Triggered When |
|---|---|
| `/topic/order/{orderId}` | Any order status change |
| `/topic/order/{orderId}/location` | Courier sends GPS update |
| `/topic/restaurant/{id}/orders` | New order arrives |
| `/topic/restaurant/{id}/updates` | Order status change in restaurant |

### Publish Destinations (Client sends)

| Destination | Payload | Description |
|---|---|---|
| `/app/courier/location` | `{ orderId, latitude, longitude }` | Stream courier GPS |
| `/app/order/status` | `{ orderId, status }` | Push status change |

**Status Update Event Shape:**
```json
{
  "event": "ORDER_STATUS_UPDATE",
  "orderId": "abc123",
  "status": "IN_TRANSIT",
  "timestamp": "2026-05-25T18:30:00"
}
```

**JavaScript Connection Example:**
```javascript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  onConnect: () => {
    // Subscribe to live order updates
    client.subscribe(`/topic/order/${orderId}`, (msg) => {
      const update = JSON.parse(msg.body);
      console.log('Status:', update.status); // e.g. "PREPARING"
    });
  }
});
client.activate();
```

---

## 👤 User Guide

### Role 1 — Customer

```
Register → Browse restaurants → Add items to cart
→ Checkout → Track order live → Write review → Earn points
```

1. Go to `http://localhost:3000/register` → Select **Customer**
2. Browse restaurants on the home page
3. Click **📍 Find Near Me** to enable GPS-based discovery
4. Open a restaurant → Add items → Go to Cart
5. Checkout → Enter delivery address → Place Order
6. Watch the **Live Tracking** page — status updates in real time via WebSocket
7. After delivery → Write a review → Earn 10–65+ loyalty points
8. Book tables via **📅 Reserve Table** tab on any restaurant page

---

### Role 2 — Restaurant Partner

```
Register → Create restaurant → Add menu → Manage orders live → Confirm reservations
```

1. Register as **Restaurant Partner**
2. Go to `/dashboard` → Create your restaurant profile with location
3. Add menu items with categories, prices, and prep times
4. Incoming orders appear live in the dashboard (WebSocket push)
5. Click **Mark as PREPARING** → **READY** → **COURIER_ASSIGNED** to progress orders
6. Switch to **Reservations** tab to confirm or decline bookings

---

### Role 3 — Delivery Courier

```
Register → Accept dispatches → Update status → Complete delivery
```

1. Register as **Delivery Courier**
2. Use the API or dashboard to update order status from `COURIER_ASSIGNED` → `PICKED_UP` → `IN_TRANSIT` → `DELIVERED`
3. Stream GPS location via WebSocket `/app/courier/location`

---

## ⭐ Gamification — Loyalty Points Engine

Points are calculated automatically when a review is submitted:

| Action | Points |
|---|---|
| Submitting any review | +10 |
| Review with 15–29 words | +5 |
| Review with 30–49 words | +10 |
| Review with 50+ words | +20 |
| Giving a 5-star overall rating | +5 |
| Each quality keyword detected | +3 (max +15) |
| Uploading a photo | +15 |
| **Maximum possible per review** | **65 pts** |

**Quality keywords detected:** `delicious`, `fresh`, `hot`, `crispy`, `flavorful`, `tasty`, `excellent`, `amazing`, `fast`, `quick`, `prompt`, `courteous`, `packaging`, `hygienic`, `value`, `recommend`, `authentic`, `spicy`, `juicy`, `tender`

---

## 📅 GitHub Commit Strategy

The evaluation requires **4 weeks of consistent daily commits** with at least **3–5 meaningful commits per day**.

### Conventional Commit Format

```
feat:     new feature
fix:      bug fix
refactor: code restructure
docs:     documentation
test:     unit or integration test
chore:    build config, dependency update
```

### Weekly Breakdown

**Week 1 — Foundation & Auth**
```bash
git commit -m "feat: initialize Spring Boot project with Maven"
git commit -m "feat: add MongoDB User model with @Document annotation"
git commit -m "feat: implement JwtUtil with HS256 signing"
git commit -m "feat: add JwtAuthFilter as OncePerRequestFilter"
git commit -m "feat: configure Spring Security stateless filter chain"
git commit -m "feat: implement AuthService with BCrypt password hashing"
git commit -m "feat: add AuthController register and login endpoints"
git commit -m "feat: initialize React frontend with routing"
git commit -m "feat: add AuthContext for global JWT state management"
git commit -m "feat: implement Login and Register pages"
```

**Week 2 — Restaurant & Geospatial**
```bash
git commit -m "feat: add Restaurant model with GeoJSON 2dsphere field"
git commit -m "feat: implement geospatial $nearSphere query in repository"
git commit -m "feat: add Haversine distance calculation in RestaurantService"
git commit -m "feat: add nearby search endpoint with radius and cuisine filter"
git commit -m "feat: configure MongoDB 2dsphere index on application startup"
git commit -m "feat: add MenuItem model and menu CRUD endpoints"
git commit -m "feat: implement HomePage with GPS-based restaurant discovery"
git commit -m "feat: add RestaurantPage with menu tabs and add-to-cart logic"
git commit -m "feat: implement CartContext with multi-restaurant guard"
```

**Week 3 — Orders, WebSocket & Reviews**
```bash
git commit -m "feat: add Order model with 8-state state machine"
git commit -m "feat: configure STOMP WebSocket broker with SockJS endpoint"
git commit -m "feat: implement OrderService with state transition validation"
git commit -m "feat: broadcast order updates via SimpMessagingTemplate"
git commit -m "feat: add OrderController with create, pay, and status endpoints"
git commit -m "feat: implement gamified ReviewService with keyword scoring"
git commit -m "feat: add loyalty points accumulation in user profile"
git commit -m "feat: add CheckoutPage with payment simulation"
git commit -m "feat: implement live OrderTrackingPage with STOMP subscription"
git commit -m "feat: add ReviewPage with points breakdown display"
```

**Week 4 — Reservations, Dashboard & Deployment**
```bash
git commit -m "feat: add TableReservation model with conflict detection"
git commit -m "feat: implement ±1hr slot overlap prevention algorithm"
git commit -m "feat: add RestaurantDashboard with live WebSocket order feed"
git commit -m "feat: implement MyOrdersPage and MyReservationsPage"
git commit -m "feat: add ProfilePage with loyalty points badge"
git commit -m "feat: write MongoDB seed script with 5 restaurants and 32 items"
git commit -m "feat: add multi-stage Dockerfile for Spring Boot backend"
git commit -m "feat: add Nginx Dockerfile with SPA routing and API proxy"
git commit -m "feat: configure docker-compose with 3-service orchestration"
git commit -m "docs: write comprehensive README with architecture and API docs"
```

### Branch Workflow

```bash
# Create feature branch
git checkout -b feat/order-state-machine

# Make changes, commit
git add .
git commit -m "feat: implement 8-state order transition with validation"
git push origin feat/order-state-machine

# Open Pull Request on GitHub
# Add PR description explaining: what was built, approach, how to test
# Merge to main after self-review
```

---

## 🐳 Docker Reference

```bash
# Start full stack (build images first time)
docker-compose up --build

# Start without rebuilding (faster)
docker-compose up

# Stop all services
docker-compose down

# Stop and delete all data volumes
docker-compose down -v

# View logs for specific service
docker logs infotact_backend -f
docker logs infotact_mongodb -f
docker logs infotact_frontend -f

# Run command inside MongoDB container
docker exec -it infotact_mongodb mongosh infotact_foodapp

# Check all running containers
docker ps
```

---

## 🔧 Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `Port 8080 already in use` | Another process running | `netstat -ano \| findstr :8080` then `taskkill /PID <n> /F` |
| `Unable to connect to MongoDB` | MongoDB not started | Start MongoDB service first |
| `JAVA_HOME not set` | Java not in PATH | Restart computer after installing Java 17 |
| `npm install fails` | Peer dependency conflict | Run `npm install --legacy-peer-deps` |
| All restaurants show Closed | MongoDB field mapping issue | Run `db.restaurants.updateMany({}, {$set:{isOpen:true}})` |
| Menu items show Unavailable | Same field mapping issue | Run `db.menu_items.updateMany({}, {$set:{isAvailable:true}})` |
| WebSocket not connecting | Backend not fully started | Wait for `Started FoodAppApplication` log line |
| `Non-parseable POM` error | Special character in pom.xml | Replace `&` with `and` in `<name>` tag |
| Docker build fails (Maven) | Wrong base image | Use `FROM maven:3.9.6-eclipse-temurin-17` not `eclipse-temurin:17-jdk-alpine` |

---

## 🗄️ Database Schema

### Collections Overview

| Collection | Key Fields | Indexes |
|---|---|---|
| `users` | email (unique), role, loyaltyPoints | email_1 |
| `restaurants` | name, location [lng,lat], isOpen, cuisineType | location_2dsphere |
| `menu_items` | restaurantId, isAvailable, category, price | restaurantId_1 |
| `orders` | customerId, restaurantId, status, totalAmount | customerId_1, restaurantId_1 |
| `reviews` | orderId (unique), restaurantId, pointsEarned | restaurantId_1 |
| `table_reservations` | restaurantId, reservationDateTime, status | restaurantId_1_reservationDateTime_1 |

---

## 📊 Performance Targets

| Metric | Target | Implementation |
|---|---|---|
| API response time (p95) | < 200ms | MongoDB indexes + connection pooling |
| Geospatial query | < 100ms | 2dsphere index on `restaurants.location` |
| WebSocket update delivery | < 500ms | STOMP in-memory broker |
| Docker cold start | < 90 seconds | Multi-stage build, cached layers |
| Concurrent orders supported | 100+ | Stateless JWT, Spring async |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit with conventional format: `git commit -m "feat: add amazing feature"`
4. Push to branch: `git push origin feat/amazing-feature`
5. Open a Pull Request with a detailed description

---

## 📜 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

**Built with ❤️ for the Infotact Technical Internship Program**

*Demonstrating enterprise-grade Java Spring Boot development with real-world architecture patterns*

⭐ Star this repo if you found it helpful!

</div>
