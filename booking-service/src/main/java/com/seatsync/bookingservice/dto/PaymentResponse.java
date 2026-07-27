package com.seatsync.bookingservice.dto;

import java.time.LocalDateTime;

public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private Double amount;
    private String status;
    private String transactionId;
    private String idempotencyKey;
    private LocalDateTime paymentTime;

    public PaymentResponse() {}

    public PaymentResponse(Long id, Long bookingId, Double amount, String status, String transactionId, String idempotencyKey, LocalDateTime paymentTime) {
        this.id = id;
        this.bookingId = bookingId;
        this.amount = amount;
        this.status = status;
        this.transactionId = transactionId;
        this.idempotencyKey = idempotencyKey;
        this.paymentTime = paymentTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public LocalDateTime getPaymentTime() { return paymentTime; }
    public void setPaymentTime(LocalDateTime paymentTime) { this.paymentTime = paymentTime; }

    public static PaymentResponseBuilder builder() {
        return new PaymentResponseBuilder();
    }

    public static class PaymentResponseBuilder {
        private Long id;
        private Long bookingId;
        private Double amount;
        private String status;
        private String transactionId;
        private String idempotencyKey;
        private LocalDateTime paymentTime;

        public PaymentResponseBuilder id(Long id) { this.id = id; return this; }
        public PaymentResponseBuilder bookingId(Long bookingId) { this.bookingId = bookingId; return this; }
        public PaymentResponseBuilder amount(Double amount) { this.amount = amount; return this; }
        public PaymentResponseBuilder status(String status) { this.status = status; return this; }
        public PaymentResponseBuilder transactionId(String transactionId) { this.transactionId = transactionId; return this; }
        public PaymentResponseBuilder idempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; return this; }
        public PaymentResponseBuilder paymentTime(LocalDateTime paymentTime) { this.paymentTime = paymentTime; return this; }

        public PaymentResponse build() {
            return new PaymentResponse(id, bookingId, amount, status, transactionId, idempotencyKey, paymentTime);
        }
    }
}
