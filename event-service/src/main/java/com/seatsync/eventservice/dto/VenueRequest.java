package com.seatsync.eventservice.dto;

public class VenueRequest {
    private String name;
    private String location;
    private Integer capacity;

    public VenueRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
}
