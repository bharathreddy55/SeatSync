package com.seatsync.eventservice.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime time;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String status;

    public Event() {}

    public Event(Long id, String title, Venue venue, LocalDate date, LocalTime time, String description, String status) {
        this.id = id;
        this.title = title;
        this.venue = venue;
        this.date = date;
        this.time = time;
        this.description = description;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Venue getVenue() { return venue; }
    public void setVenue(Venue venue) { this.venue = venue; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static EventBuilder builder() {
        return new EventBuilder();
    }

    public static class EventBuilder {
        private Long id;
        private String title;
        private Venue venue;
        private LocalDate date;
        private LocalTime time;
        private String description;
        private String status;

        public EventBuilder id(Long id) { this.id = id; return this; }
        public EventBuilder title(String title) { this.title = title; return this; }
        public EventBuilder venue(Venue venue) { this.venue = venue; return this; }
        public EventBuilder date(LocalDate date) { this.date = date; return this; }
        public EventBuilder time(LocalTime time) { this.time = time; return this; }
        public EventBuilder description(String description) { this.description = description; return this; }
        public EventBuilder status(String status) { this.status = status; return this; }

        public Event build() {
            return new Event(id, title, venue, date, time, description, status);
        }
    }
}
