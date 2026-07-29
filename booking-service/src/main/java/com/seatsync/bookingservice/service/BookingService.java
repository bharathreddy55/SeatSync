package com.seatsync.bookingservice.service;

import com.seatsync.bookingservice.dto.BookingRequest;
import com.seatsync.bookingservice.dto.BookingResponse;
import com.seatsync.bookingservice.model.Booking;
import com.seatsync.bookingservice.model.BookingStatus;
import com.seatsync.bookingservice.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatLockService seatLockService;
    private final RestTemplate restTemplate;

    public BookingService(BookingRepository bookingRepository, SeatLockService seatLockService, RestTemplate restTemplate) {
        this.bookingRepository = bookingRepository;
        this.seatLockService = seatLockService;
        this.restTemplate = restTemplate;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        // 1. Acquire Redis Distributed Lock to hold the seat
        boolean lockAcquired = seatLockService.acquireLock(request.getSeatId(), request.getUserId());
        if (!lockAcquired) {
            throw new IllegalStateException("Seat is currently held by another transaction or already booked.");
        }

        try {
            // 2. Call event-service via gateway to verify seat status and set to HELD
            String seatUrl = "http://api-gateway:8080/api/seats/" + request.getSeatId();
            Map<?, ?> seat = restTemplate.getForObject(seatUrl, Map.class);
            if (seat == null || !"AVAILABLE".equals(seat.get("status"))) {
                seatLockService.releaseLock(request.getSeatId(), request.getUserId());
                throw new IllegalStateException("Seat is not available for booking.");
            }

            // Update status in event-service to HELD
            restTemplate.put(seatUrl + "/status?status=HELD", null);

            // 3. Create Booking record in local database
            Booking booking = Booking.builder()
                    .userId(request.getUserId())
                    .eventId(request.getEventId())
                    .seatId(request.getSeatId())
                    .status(BookingStatus.PENDING)
                    .build();

            booking = bookingRepository.save(booking);

            return mapToResponse(booking);
        } catch (Exception e) {
            // Rollback Redis lock in case of errors
            seatLockService.releaseLock(request.getSeatId(), request.getUserId());
            throw e;
        }
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be cancelled.");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        
        // Release lock and mark seat available in event-service
        String seatUrl = "http://api-gateway:8080/api/seats/" + booking.getSeatId();
        try {
            restTemplate.put(seatUrl + "/status?status=AVAILABLE", null);
        } catch (Exception e) {
            // log and continue
        }
        
        seatLockService.releaseLock(booking.getSeatId(), booking.getUserId());
        
        return mapToResponse(booking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .eventId(booking.getEventId())
                .seatId(booking.getSeatId())
                .paymentId(booking.getPaymentId())
                .status(booking.getStatus().name())
                .bookingTime(booking.getBookingTime())
                .build();
    }
}
