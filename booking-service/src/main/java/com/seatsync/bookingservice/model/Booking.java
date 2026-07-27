package com.seatsync.bookingservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "seat_id", nullable = false)
    private Long seatId;

    @Column(name = "payment_id")
    private Long paymentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(name = "booking_time", nullable = false)
    private LocalDateTime bookingTime;

    @PrePersist
    protected void onCreate() {
        this.bookingTime = LocalDateTime.now();
    }

    public Booking() {}

    public Booking(Long id, Long userId, Long eventId, Long seatId, Long paymentId, BookingStatus status, LocalDateTime bookingTime) {
        this.id = id;
        this.userId = userId;
        this.eventId = eventId;
        this.seatId = seatId;
        this.paymentId = paymentId;
        this.status = status;
        this.bookingTime = bookingTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public Long getSeatId() { return seatId; }
    public void setSeatId(Long seatId) { this.seatId = seatId; }
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }

    public static BookingBuilder builder() {
        return new BookingBuilder();
    }

    public static class BookingBuilder {
        private Long id;
        private Long userId;
        private Long eventId;
        private Long seatId;
        private Long paymentId;
        private BookingStatus status;
        private LocalDateTime bookingTime;

        public BookingBuilder id(Long id) { this.id = id; return this; }
        public BookingBuilder userId(Long userId) { this.userId = userId; return this; }
        public BookingBuilder eventId(Long eventId) { this.eventId = eventId; return this; }
        public BookingBuilder seatId(Long seatId) { this.seatId = seatId; return this; }
        public BookingBuilder paymentId(Long paymentId) { this.paymentId = paymentId; return this; }
        public BookingBuilder status(BookingStatus status) { this.status = status; return this; }
        public BookingBuilder bookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; return this; }

        public Booking build() {
            return new Booking(id, userId, eventId, seatId, paymentId, status, bookingTime);
        }
    }
}
