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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
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

    @InjectMocks
    private PaymentService paymentService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
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
}
