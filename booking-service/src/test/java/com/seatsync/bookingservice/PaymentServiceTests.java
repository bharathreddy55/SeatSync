package com.seatsync.bookingservice;

import com.seatsync.bookingservice.dto.PaymentRequest;
import com.seatsync.bookingservice.dto.PaymentResponse;
import com.seatsync.bookingservice.model.Booking;
import com.seatsync.bookingservice.model.BookingStatus;
import com.seatsync.bookingservice.model.Payment;
import com.seatsync.bookingservice.model.PaymentStatus;
import com.seatsync.bookingservice.repository.BookingRepository;
import com.seatsync.bookingservice.repository.PaymentRepository;
import com.seatsync.bookingservice.service.BookingEventProducer;
import com.seatsync.bookingservice.service.PaymentService;
import com.seatsync.bookingservice.service.SeatLockService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class PaymentServiceTests {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private SeatLockService seatLockService;

    @Mock
    private BookingEventProducer bookingEventProducer;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private PlatformTransactionManager transactionManager;

    @Mock
    private TransactionStatus transactionStatus;

    private PaymentService paymentService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        when(transactionManager.getTransaction(any())).thenReturn(transactionStatus);
        paymentService = new PaymentService(paymentRepository, bookingRepository, seatLockService, bookingEventProducer, restTemplate, transactionManager);
    }

    @Test
    public void testProcessPayment_IdempotencyKey_ReturnsExistingResponse() {
        String key = "test-idempotency-key";
        PaymentRequest request = new PaymentRequest();
        request.setBookingId(1L);
        request.setAmount(100.0);

        Payment existingPayment = Payment.builder()
                .id(99L)
                .bookingId(1L)
                .amount(100.0)
                .status(PaymentStatus.SUCCESS)
                .transactionId("TXN-12345")
                .idempotencyKey(key)
                .paymentTime(LocalDateTime.now())
                .build();

        // Mock payment repository to return existing payment
        when(paymentRepository.findByIdempotencyKey(key)).thenReturn(Optional.of(existingPayment));

        PaymentResponse response = paymentService.processPayment(request, key);

        assertNotNull(response);
        assertEquals(99L, response.getId());
        assertEquals("TXN-12345", response.getTransactionId());
        assertEquals(PaymentStatus.SUCCESS.name(), response.getStatus());

        // Verify that booking repository was NEVER called to load booking, and no new payment was saved
        verify(bookingRepository, never()).findById(anyLong());
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    public void testProcessPayment_SuccessFlow() {
        String key = "new-idempotency-key";
        PaymentRequest request = new PaymentRequest();
        request.setBookingId(1L);
        request.setAmount(150.0);
        request.setCardNumber("1234567812345678");

        Booking pendingBooking = Booking.builder()
                .id(1L)
                .userId(10L)
                .eventId(20L)
                .seatId(30L)
                .status(BookingStatus.PENDING)
                .build();

        when(paymentRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pendingBooking));
        
        Payment savedPayment = Payment.builder()
                .id(500L)
                .bookingId(1L)
                .amount(150.0)
                .status(PaymentStatus.SUCCESS)
                .transactionId("TXN-999")
                .idempotencyKey(key)
                .build();
        
        when(paymentRepository.save(any(Payment.class))).thenReturn(savedPayment);

        Map<String, Object> mockMap = new HashMap<>();
        mockMap.put("title", "Concert");
        mockMap.put("seatNumber", "B12");
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(mockMap);

        PaymentResponse response = paymentService.processPayment(request, key);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals(PaymentStatus.SUCCESS.name(), response.getStatus());

        verify(bookingRepository, times(2)).findById(1L);
        verify(paymentRepository, times(1)).save(any(Payment.class));
        verify(restTemplate, times(1)).put(contains("BOOKED"), any());
        verify(seatLockService, times(1)).releaseLock(30L, 10L);
        verify(bookingEventProducer, times(1)).sendBookingNotification(any());
    }
}
