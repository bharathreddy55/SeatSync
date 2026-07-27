# 🎟️ SeatSync: High-Concurrency Ticket Booking Microservices

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Cloud-2023.0.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>
<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

---

## 💡 The Core Problem: Race Conditions in Seat Selection

In high-demand event ticketing systems (like Taylor Swift's Eras Tour or the Super Bowl), thousands of users select and buy tickets at the exact same second. If two users select the same seat, how do we guarantee that:
1. **The seat is locked for checkout for exactly 5 minutes** so only they can purchase it.
2. **Double bookings are physically impossible** at the database level.
3. **Double payments (duplicate charges) never occur** even under unstable network connections.

**SeatSync** is a production-grade full-stack microservices project built to solve these exact distributed transaction, concurrency, and idempotency challenges.

---

## 🏗️ System Architecture

```
                                  +-----------------------+
                                  |     React Client      |
                                  | (Vite + TS + TW v4)   |
                                  +-----------+-----------+
                                              |
                                              | (Port 8080)
                                              v
                                  +-----------+-----------+
                                  |   Spring Cloud        |
                                  |   API Gateway         |
                                  +-----+-----+-----+-----+
                                        |     |     |
            +---------------------------+     |     +---------------------------+
            | (Port 8081)                     | (Port 8082)                     | (Port 8083)
            v                                 v                                 v
+-----------+-----------+         +-----------+-----------+         +-----------+-----------+
|    User Service       |         |     Event Service     |         |    Booking Service    |
| (Auth, JWT, profiles) |         | (Venues, Events, Seats) |         |  (Locks, Payments)    |
+-----------+-----------+         +-----------+-----------+         +-----------+-----------+
            |                                 |                                 |
            v (Postgres)                      v (Postgres + Redis)              v (Postgres + Redis)
     [seatsync_user_db]               [seatsync_event_db]               [seatsync_booking_db]
                                                                                |
                                                                                | (Publishes Events)
                                                                                v
                                                                    +-----------+-----------+
                                                                    |     Apache Kafka      |
                                                                    +-----------+-----------+
                                                                                |
                                                                                | (Consumes Events)
                                                                                v
                                                                    +-----------+-----------+
                                                                    | Notification Service  |
                                                                    | (SMS & Email Dispatch)|
                                                                    +-----------------------+
```

---

## ⚡ Concurrency & Design Solutions Implemented

### 1. Redis Distributed Seat Holds (TTL Reservation)
When a user selects a seat, `booking-service` attempts to acquire a Redis hold key: `seat:hold:{seatId}` value `userId` with a TTL of 5 minutes (`SETNX`).
* **Acquired:** The seat transitions to `HELD` status. The user has 5 minutes to complete payment.
* **Released on Success:** When payment succeeds, the lock is deleted and the status updates to `BOOKED`.
* **Released on Timeout:** If the user abandons checkout, Redis automatically expires the hold, and the seat is returned back to `AVAILABLE`.

### 2. JPA Database Optimistic Locking
To prevent race conditions at the database write stage, the `Seat` entity uses optimistic locking (`@Version`). If two transactions attempt to commit status changes on the same seat record simultaneously, Hibernate throws an `ObjectOptimisticLockingFailureException`, aborting the secondary transaction.

### 3. Idempotent Payment processing
The `/api/payments` endpoint requires a unique `Idempotency-Key` header.
* On the first request, the transaction is processed and saved to the database.
* If a network timeout occurs and the client retries with the same key, `booking-service` identifies the key in the database and returns the cached payment response immediately without double-charging the user's card.

### 4. Stateless Session Management & Silent Token Refresh
SeatSync employs a stateless authentication architecture using JSON Web Tokens (JWT) to secure access across microservices without relying on server-side session memory:
* **Stateless Sessions:** Upon login, the user receives an `accessToken` (short-lived, e.g. 15 minutes) and a `refreshToken` (long-lived, e.g. 7 days). These are stored in the client's local storage.
* **Securing Requests:** The React client attaches the `Authorization: Bearer <token>` header to all outgoing API requests routed through the Spring Cloud API Gateway.
* **Silent Auto-Refresh Loop:** If a request returns `401 Unauthorized` because the access token expired, an Axios interceptor intercepts the response, makes a request to `/api/auth/refresh` using the refresh token, updates local storage with the new token, and seamlessly retries the original user request without logging them out or forcing a page refresh.

---

## 🛠️ Tech Stack & Features

* **Backend Microservices:** Java 17+, Spring Boot 3.3.2, Spring Cloud Gateway, Eureka Service Registry.
* **Database & Cache:** PostgreSQL (relational storage), Redis (caching and distributed locks), Apache Kafka (event-driven messaging).
* **Interactive React Frontend:** built with **Vite**, **TypeScript**, **Tailwind CSS v4**, and **Lucide Icons** featuring:
  * 🔐 Auto-refreshing JWT authentication loop.
  * 🗺️ Dynamic interactive seating grid (visualizing available, held, and booked seats).
  * ⏱️ Real-time checkout hold countdown timer (5:00 minutes).
  * ⚡ Concurrency & Idempotency simulator (allows triggering double clicks to test backend idempotency).
  * 📊 User Booking history & Admin Organiser dashboards.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
* **Java 17+** (fully supports JDK 21 and JDK 25)
* **Maven 3.8+**
* **Node.js 18+** & **npm**
* **Docker & Docker Compose**

### Step 1: Compile the Backend
From the root workspace directory, run Maven package skipping tests to build the JARs:
```bash
mvn clean package -DskipTests
```

### Step 2: Boot Up the Infrastructure
Start PostgreSQL, Redis, Kafka, Zookeeper, and the 6 microservice containers:
```bash
docker compose up --build
```
*(Wait a minute for databases to initialize. The script in `docker/db-init` automatically creates the user, event, and booking databases on startup).*

### Step 3: Start the React Frontend
Navigate to the frontend directory, install npm packages, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to interact with SeatSync!

---

## 🧪 Verification & Automated Testing

### Running Unit Tests
We have included a mock-based test suite verifying backend payment idempotency behavior. Run the tests using Maven:
```bash
mvn test -pl booking-service
```
*(No Redis or Kafka instance required for tests—uses Mockito class instrumentation).*
