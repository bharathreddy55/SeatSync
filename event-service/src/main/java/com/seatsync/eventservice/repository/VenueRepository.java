package com.seatsync.eventservice.repository;

import com.seatsync.eventservice.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {
}
