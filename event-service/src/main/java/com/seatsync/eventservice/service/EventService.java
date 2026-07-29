package com.seatsync.eventservice.service;

import com.seatsync.eventservice.dto.EventRequest;
import com.seatsync.eventservice.model.Event;
import com.seatsync.eventservice.model.Seat;
import com.seatsync.eventservice.model.SeatStatus;
import com.seatsync.eventservice.model.Venue;
import com.seatsync.eventservice.repository.EventRepository;
import com.seatsync.eventservice.repository.SeatRepository;
import com.seatsync.eventservice.repository.VenueRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final SeatRepository seatRepository;

    public EventService(EventRepository eventRepository, VenueRepository venueRepository, SeatRepository seatRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.seatRepository = seatRepository;
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public Event createEvent(EventRequest request) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new IllegalArgumentException("Venue not found"));

        int totalSeatsToCreate = request.getRows() * request.getCols();
        if (totalSeatsToCreate > venue.getCapacity()) {
            throw new IllegalArgumentException("Requested seat layout capacity (" + totalSeatsToCreate + 
                    ") exceeds venue capacity (" + venue.getCapacity() + ")");
        }

        Event event = Event.builder()
                .title(request.getTitle())
                .venue(venue)
                .date(request.getDate())
                .time(request.getTime())
                .description(request.getDescription())
                .status("ACTIVE")
                .build();

        event = eventRepository.save(event);

        List<Seat> seats = new ArrayList<>();
        char rowChar = 'A';
        for (int r = 0; r < request.getRows(); r++) {
            for (int c = 1; c <= request.getCols(); c++) {
                String seatNumber = String.valueOf(rowChar) + c;
                Seat seat = Seat.builder()
                        .eventId(event.getId())
                        .seatNumber(seatNumber)
                        .price(request.getPrice() != null ? request.getPrice() : 100.0)
                        .status(SeatStatus.AVAILABLE)
                        .build();
                seats.add(seat);
            }
            rowChar++;
        }
        seatRepository.saveAll(seats);

        return event;
    }

    @Cacheable(value = "events")
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Cacheable(value = "events", key = "#id")
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + id));
    }

    public List<Event> searchEvents(String query) {
        return eventRepository.findByTitleContainingIgnoreCase(query);
    }

    @CacheEvict(value = "events", key = "#id")
    @Transactional
    public void deleteEvent(Long id) {
        Event event = getEventById(id);
        eventRepository.delete(event);
    }
}
