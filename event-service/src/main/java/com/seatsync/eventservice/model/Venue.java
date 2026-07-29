package com.seatsync.eventservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "venues")
public class Venue implements java.io.Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private Integer capacity;

    public Venue() {}

    public Venue(Long id, String name, String location, Integer capacity) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.capacity = capacity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public static VenueBuilder builder() {
        return new VenueBuilder();
    }

    public static class VenueBuilder {
        private Long id;
        private String name;
        private String location;
        private Integer capacity;

        public VenueBuilder id(Long id) { this.id = id; return this; }
        public VenueBuilder name(String name) { this.name = name; return this; }
        public VenueBuilder location(String location) { this.location = location; return this; }
        public VenueBuilder capacity(Integer capacity) { this.capacity = capacity; return this; }

        public Venue build() {
            return new Venue(id, name, location, capacity);
        }
    }
}
