package com.seatsync.eventservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "seats")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "seat_number", nullable = false)
    private String seatNumber;

    @Column(nullable = false)
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status;

    @Version
    private Long version;

    public Seat() {}

    public Seat(Long id, Long eventId, String seatNumber, Double price, SeatStatus status, Long version) {
        this.id = id;
        this.eventId = eventId;
        this.seatNumber = seatNumber;
        this.price = price;
        this.status = status;
        this.version = version;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public SeatStatus getStatus() { return status; }
    public void setStatus(SeatStatus status) { this.status = status; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public static SeatBuilder builder() {
        return new SeatBuilder();
    }

    public static class SeatBuilder {
        private Long id;
        private Long eventId;
        private String seatNumber;
        private Double price;
        private SeatStatus status;
        private Long version;

        public SeatBuilder id(Long id) { this.id = id; return this; }
        public SeatBuilder eventId(Long eventId) { this.eventId = eventId; return this; }
        public SeatBuilder seatNumber(String seatNumber) { this.seatNumber = seatNumber; return this; }
        public SeatBuilder price(Double price) { this.price = price; return this; }
        public SeatBuilder status(SeatStatus status) { this.status = status; return this; }
        public SeatBuilder version(Long version) { this.version = version; return this; }

        public Seat build() {
            return new Seat(id, eventId, seatNumber, price, status, version);
        }
    }
}
