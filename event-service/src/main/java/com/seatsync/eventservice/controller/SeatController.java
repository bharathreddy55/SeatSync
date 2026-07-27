package com.seatsync.eventservice.controller;

import com.seatsync.eventservice.model.Seat;
import com.seatsync.eventservice.model.SeatStatus;
import com.seatsync.eventservice.service.SeatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Seat>> getSeatsByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(seatService.getSeatsByEventId(eventId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Seat> getSeatById(@PathVariable Long id) {
        return ResponseEntity.ok(seatService.getSeatById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Seat> updateSeatStatus(
            @PathVariable Long id,
            @RequestParam SeatStatus status
    ) {
        return ResponseEntity.ok(seatService.updateSeatStatus(id, status));
    }
}
