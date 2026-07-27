package com.seatsync.eventservice.service;

import com.seatsync.eventservice.model.Seat;
import com.seatsync.eventservice.model.SeatStatus;
import com.seatsync.eventservice.repository.SeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SeatService {

    private final SeatRepository seatRepository;

    public SeatService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    public List<Seat> getSeatsByEventId(Long eventId) {
        return seatRepository.findByEventId(eventId);
    }

    public Seat getSeatById(Long seatId) {
        return seatRepository.findById(seatId)
                .orElseThrow(() -> new IllegalArgumentException("Seat not found with ID: " + seatId));
    }

    @Transactional
    public Seat updateSeatStatus(Long seatId, SeatStatus status) {
        Seat seat = getSeatById(seatId);
        seat.setStatus(status);
        return seatRepository.save(seat);
    }
}
