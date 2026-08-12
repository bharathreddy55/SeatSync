package com.seatsync.bookingservice.service;

import com.seatsync.bookingservice.dto.BookingRequest;
import com.seatsync.bookingservice.dto.BookingResponse;
import com.seatsync.bookingservice.model.Booking;
import com.seatsync.bookingservice.model.BookingStatus;
import com.seatsync.bookingservice.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class BookingServiceTests {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private SeatLockService seatLockService;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private PlatformTransactionManager transactionManager;

    @Mock
    private TransactionStatus transactionStatus;

    private BookingService bookingService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        when(transactionManager.getTransaction(any())).thenReturn(transactionStatus);
        bookingService = new BookingService(bookingRepository, seatLockService, restTemplate, transactionManager);
    }

    @Test
    public void testCreateBooking_Success() {
        BookingRequest request = new BookingRequest();
        request.setUserId(1L);
        request.setEventId(2L);
        request.setSeatId(3L);

        Map<String, Object> seatMap = new HashMap<>();
        seatMap.put("status", "AVAILABLE");

        when(seatLockService.acquireLock(3L, 1L)).thenReturn(true);
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(seatMap);
        
        Booking savedBooking = Booking.builder()
                .id(100L)
                .userId(1L)
                .eventId(2L)
                .seatId(3L)
                .status(BookingStatus.PENDING)
                .build();
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponse response = bookingService.createBooking(request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("PENDING", response.getStatus());

        verify(seatLockService, times(1)).acquireLock(3L, 1L);
        verify(restTemplate, times(1)).put(contains("HELD"), any());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    public void testCreateBooking_LockFailed_ThrowsException() {
        BookingRequest request = new BookingRequest();
        request.setUserId(1L);
        request.setSeatId(3L);

        when(seatLockService.acquireLock(3L, 1L)).thenReturn(false);

        assertThrows(IllegalStateException.class, () -> {
            bookingService.createBooking(request);
        });

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    public void testCancelBooking_Success() {
        Long bookingId = 100L;
        Booking booking = Booking.builder()
                .id(bookingId)
                .userId(1L)
                .seatId(3L)
                .status(BookingStatus.PENDING)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.cancelBooking(bookingId);

        assertNotNull(response);
        assertEquals("CANCELLED", response.getStatus());
        verify(restTemplate, times(1)).put(contains("AVAILABLE"), any());
        verify(seatLockService, times(1)).releaseLock(3L, 1L);
    }
}
