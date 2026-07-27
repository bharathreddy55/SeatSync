package com.seatsync.bookingservice.dto;

import java.time.LocalDateTime;

public class BookingResponse {
    private Long id;
    private Long userId;
    private Long eventId;
    private Long seatId;
    private Long paymentId;
    private String status;
    private LocalDateTime bookingTime;

    public BookingResponse() {}

    public BookingResponse(Long id, Long userId, Long eventId, Long seatId, Long paymentId, String status, LocalDateTime bookingTime) {
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }

    public static BookingResponseBuilder builder() {
        return new BookingResponseBuilder();
    }

    public static class BookingResponseBuilder {
        private Long id;
        private Long userId;
        private Long eventId;
        private Long seatId;
        private Long paymentId;
        private String status;
        private LocalDateTime bookingTime;

        public BookingResponseBuilder id(Long id) { this.id = id; return this; }
        public BookingResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public BookingResponseBuilder eventId(Long eventId) { this.eventId = eventId; return this; }
        public BookingResponseBuilder seatId(Long seatId) { this.seatId = seatId; return this; }
        public BookingResponseBuilder paymentId(Long paymentId) { this.paymentId = paymentId; return this; }
        public BookingResponseBuilder status(String status) { this.status = status; return this; }
        public BookingResponseBuilder bookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; return this; }

        public BookingResponse build() {
            return new BookingResponse(id, userId, eventId, seatId, paymentId, status, bookingTime);
        }
    }
}
