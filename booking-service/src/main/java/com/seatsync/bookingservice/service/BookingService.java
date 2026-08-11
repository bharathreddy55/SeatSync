package com.seatsync.bookingservice.service;

import com.seatsync.bookingservice.dto.BookingRequest;
import com.seatsync.bookingservice.dto.BookingResponse;
import com.seatsync.bookingservice.model.Booking;
import com.seatsync.bookingservice.model.BookingStatus;
import com.seatsync.bookingservice.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.RestTemplate;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatLockService seatLockService;
    private final RestTemplate restTemplate;
    private final TransactionTemplate transactionTemplate;

    public BookingService(BookingRepository bookingRepository, SeatLockService seatLockService,
                          RestTemplate restTemplate, PlatformTransactionManager transactionManager) {
        this.bookingRepository = bookingRepository;
        this.seatLockService = seatLockService;
        this.restTemplate = restTemplate;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "createBookingFallback")
    public BookingResponse createBooking(BookingRequest request) {
        // 1. Acquire Redis Distributed Lock to hold the seat (outside transaction)
        boolean lockAcquired = seatLockService.acquireLock(request.getSeatId(), request.getUserId());
        if (!lockAcquired) {
            throw new IllegalStateException("Seat is currently held by another transaction or already booked.");
        }

        try {
            // 2. Call event-service via gateway to verify seat status and set to HELD (outside transaction)
            String seatUrl = "https://api-gateway:8080/api/seats/" + request.getSeatId();
            Map<?, ?> seat = restTemplate.getForObject(seatUrl, Map.class);
            if (seat == null || !"AVAILABLE".equals(seat.get("status"))) {
                seatLockService.releaseLock(request.getSeatId(), request.getUserId());
                throw new IllegalStateException("Seat is not available for booking.");
            }

            // Update status in event-service to HELD (outside transaction)
            restTemplate.put(seatUrl + "/status?status=HELD", null);

            // 3. Create Booking record in local database inside a short-lived transaction
            Booking booking = transactionTemplate.execute(status -> {
                Booking newBooking = Booking.builder()
                        .userId(request.getUserId())
                        .eventId(request.getEventId())
                        .seatId(request.getSeatId())
                        .status(BookingStatus.PENDING)
                        .build();
                return bookingRepository.save(newBooking);
            });

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

    public BookingResponse cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be cancelled.");
        }
        
        // Update booking status inside a short-lived transaction
        Booking updatedBooking = transactionTemplate.execute(status -> {
            Booking b = bookingRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
            b.setStatus(BookingStatus.CANCELLED);
            return bookingRepository.save(b);
        });
        
        // Release lock and mark seat available in event-service (outside transaction)
        String seatUrl = "https://api-gateway:8080/api/seats/" + updatedBooking.getSeatId();
        try {
            restTemplate.put(seatUrl + "/status?status=AVAILABLE", null);
        } catch (Exception e) {
            // log and continue
        }
        
        seatLockService.releaseLock(updatedBooking.getSeatId(), updatedBooking.getUserId());
        
        return mapToResponse(updatedBooking);
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

    public BookingResponse createBookingFallback(BookingRequest request, Throwable t) {
        throw new IllegalStateException("Seat verification service is currently unavailable. Please try again later. (" + t.getMessage() + ")");
    }
}
