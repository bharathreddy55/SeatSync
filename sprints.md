# 🎟️ SeatSync Sprint Roadmap & Tracker

This document tracks the completed and pending sprints for **SeatSync**, a high-concurrency ticket booking microservices system built using Spring Boot, Spring Cloud, PostgreSQL, Redis, Apache Kafka, Docker, and React.

---

## 📋 Sprint Status Overview

| Sprint | Goal / Focus Area | Status | Target / Completion Date |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Core Microservices & JWT Authentication | **Completed** | July 2026 |
| **Sprint 2** | Concurrency, Seat Holds & Version Locking | **Completed** | July 2026 |
| **Sprint 3** | Interactive Frontend, UI/UX Overhaul & Checkout Flow | **Completed** | August 2026 |
| **Sprint 4** | Admin Command Center, Real-Time Analytics & Booking Cancellations | **Completed** | August 2026 |
| **Sprint 5** | Event-Driven Notifications & Kafka Integration | **Completed** | August 2026 |
| **Sprint 6** | Security Hardening & Rate Limiting | **Completed** | August 2026 |
| **Sprint 7** | Testing, CI/CD Pipelines & Kubernetes Deployment | **Completed** | August 2026 |
| **Sprint 8** | Production Readiness, Security Refactoring & Resiliency | **Completed** | August 2026 |
| **Sprint 9** | Event-Driven Authentication Recovery & Password Reset | **Completed** | August 2026 |

---

## 🛠️ Sprint Details & Checklists

### 🟩 Sprint 1: Core Microservices & JWT Authentication (Completed)
*Focus: Establish base architecture, register services, and handle user authentication.*

- [x] Design multi-module Maven structure (`api-gateway`, `discovery-server`, `user-service`, `event-service`, `booking-service`).
- [x] Configure Spring Cloud Gateway and Eureka Discovery Service.
- [x] Implement User Profiles database schema in PostgreSQL.
- [x] Build stateless JWT-based session management.
- [x] Implement Silent Auto-Refresh loop (using long-lived HTTP-only Refresh tokens and short-lived Access tokens).
- [x] Override default Spring Security `AuthenticationEntryPoint` to prevent browser basic auth popup.
- [x] Shift Gateway host port to `8085` to avoid system port conflict with local Oracle databases on `8080`.

### 🟩 Sprint 2: Concurrency, Seat Holds & Version Locking (Completed)
*Focus: Eliminate double-booking race conditions at high concurrency.*

- [x] Implement TTL-based Redis distributed holds (`SETNX`) to lock seats for exactly 5 minutes during checkout.
- [x] Integrate JPA Database Optimistic Locking (`@Version`) on the Seat entity to reject simultaneous DB writes.
- [x] Configure Redis Spring Cache for Event and Venue models to speed up read access.
- [x] Fix serialization errors for Redis-cached data by making Event/Venue serializable, and add `@CacheEvict` hooks.
- [x] Fix instant expiration issues by enforcing UTC timezone parsing on all booking timestamps.

### 🟩 Sprint 3: Interactive Frontend, UI/UX Overhaul & Checkout Flow (Completed)
*Focus: Create a premium, responsive client interface for seat booking.*

- [x] Bootstrap React + Vite frontend with TypeScript and Tailwind CSS v4.
- [x] Design premium dark-mode glassmorphic interface featuring glowing effects, ticket stubs, and card mockups.
- [x] Build dynamic seating grid with visual representations of available, held, and booked seats.
- [x] Implement multiple seat selection dropdowns and real-time hold countdown timer (5:00).
- [x] Enable interactive credit card/CVV form animations during checkout.
- [x] Align API routes between the frontend Axios client and the `/api/bookings/book` controller endpoint.

### 🟩 Sprint 4: Admin Command Center, Real-Time Analytics & Booking Cancellations (Completed)
*Focus: Enable management controls and monitoring features for event organizers.*

- [x] Create administrative dashboard (`Admin Organizer Dashboard`) inside React frontend.
- [x] Build backend `PUT /cancel` endpoint to cancel bookings and release Redis holds instantly.
- [x] Implement live sales analytics visual charts (revenue graphs, seat utilization).
- [x] Create Live Seating Monitor popup for event cards to view seating configurations on-the-fly.

### 🟩 Sprint 5: Event-Driven Notifications & Kafka Integration (Completed)
*Focus: Build asynchronous workflows using messaging queues.*

- [x] Configure Apache Kafka cluster using Docker Compose (Zookeeper + Kafka Broker).
- [x] Implement Kafka producer inside `booking-service` to publish `booking-confirmed` and `booking-cancelled` events.
- [x] Create `notification-service` to consume Kafka messages asynchronously.
- [x] Integrate JavaMailSender / SMTP to dispatch actual email confirmation receipts to users.
- [x] Implement SMS dispatch integrations using Twilio API (Optional stub).

### 🟩 Sprint 6: Security Hardening & Rate Limiting (Completed)
*Focus: Defend system endpoints from bot scalping and load spikes.*

- [x] Implement Spring Cloud Gateway Request Rate Limiting using Redis Token Bucket algorithm.
- [x] Enforce SSL/TLS certificates across microservice interfaces.
- [x] Implement encryption for sensitive DB fields (partial card details, phone numbers).
- [x] Set up CORS (Cross-Origin Resource Sharing) whitelist policies on the API Gateway.

### 🟩 Sprint 7: Testing, CI/CD Pipelines & Kubernetes Deployment (Completed)
*Focus: Orchestrate service container environments and pipeline validations.*

- [x] Add backend integration tests using Testcontainers (spinning up real Redis and PostgreSQL instances in Docker).
- [x] Configure GitHub Actions CI pipeline to compile, test, and package JAR services on merge.
- [x] Build multi-stage Dockerfiles for optimized, lightweight runner images.
- [x] Create Kubernetes manifests (`deployment.yml`, `service.yml`, `configmap.yml`, `secrets.yml`) for local Minikube testing.
- [x] Add Prometheus Actuator endpoints and Grafana dashboards for monitoring system health.

### 🟩 Sprint 8: Production Readiness, Security Refactoring & Resiliency (Completed)
*Focus: Address critical security vulnerabilities, concurrency bugs, and database connection starvation risk.*

- [x] Transition database encryption converter from hardcoded AES/ECB to dynamic AES/GCM/NoPadding with random IVs.
- [x] Implement Redis-backed Token Blacklisting for immediate logout/revocation support.
- [x] Refactor `SeatLockService` lock release operation to use atomic Redis Lua scripting.
- [x] Extract inter-service HTTP REST calls out of active `@Transactional` database methods.
- [x] Add Resilience4j circuit breakers and timeout controls to client templates.
- [x] Configure manual offsets (Ack) for Kafka consumers in `notification-service` to prevent message loss.

### 🟩 Sprint 9: Event-Driven Authentication Recovery & Password Reset (Completed)
*Focus: Add secure, asynchronous, event-driven forgot password and password reset features.*

- [x] Configure Kafka producer properties and dependency in `user-service/pom.xml` and `application.yml`.
- [x] Implement password reset token handling in `UserService.java` with a 15-minute Redis-backed TTL.
- [x] Create DTOs (`ForgotPasswordRequest`, `ResetPasswordRequest`, `PasswordResetEvent`) for API payload parsing.
- [x] Map public-facing `/forgot-password` and `/reset-password` endpoints in `AuthController.java` and expose them in `SecurityConfig.java`.
- [x] Build `PasswordResetEvent` consumer listener in `NotificationConsumer.java` with manual offset acknowledgement.
- [x] Implement SimpleMailMessage SMTP reset email generation template inside `NotificationService.java`.
- [x] Create `ForgotPassword.tsx` and `ResetPassword.tsx` components in the React frontend with full dark-theme Outfit aesthetics.
- [x] Integrate navigation routes in `App.tsx` and link to `/forgot-password` from the Login form.
