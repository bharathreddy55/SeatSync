package com.seatsync.bookingservice.service;

import com.seatsync.bookingservice.dto.BookingNotificationEvent;
import com.seatsync.bookingservice.dto.PaymentRequest;
import com.seatsync.bookingservice.dto.PaymentResponse;
import com.seatsync.bookingservice.model.Booking;
import com.seatsync.bookingservice.model.BookingStatus;
import com.seatsync.bookingservice.model.Payment;
import com.seatsync.bookingservice.model.PaymentStatus;
import com.seatsync.bookingservice.repository.BookingRepository;
import com.seatsync.bookingservice.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final SeatLockService seatLockService;
    private final BookingEventProducer bookingEventProducer;
    private final RestTemplate restTemplate;

    public PaymentService(PaymentRepository paymentRepository, BookingRepository bookingRepository,
                          SeatLockService seatLockService, BookingEventProducer bookingEventProducer,
                          RestTemplate restTemplate) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.seatLockService = seatLockService;
        this.bookingEventProducer = bookingEventProducer;
        this.restTemplate = restTemplate;
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request, String idempotencyKey) {
        // 1. Idempotency Check: search db for existing idempotency key
        Optional<Payment> existingPayment = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existingPayment.isPresent()) {
            return mapToResponse(existingPayment.get());
        }

        // 2. Fetch booking details
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Booking is not in PENDING state.");
        }

        // 3. Process payment (mock bank processing)
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        String rawCard = request.getCardNumber();
        String maskedCard = "xxxx-xxxx-xxxx-0000";
        if (rawCard != null && rawCard.length() >= 4) {
            maskedCard = "xxxx-xxxx-xxxx-" + rawCard.substring(rawCard.length() - 4);
        }
        
        Payment payment = Payment.builder()
                .bookingId(booking.getId())
                .amount(request.getAmount())
                .status(PaymentStatus.SUCCESS)
                .transactionId(transactionId)
                .idempotencyKey(idempotencyKey)
                .partialCardNumber(maskedCard)
                .build();

        payment = paymentRepository.save(payment);

        // 4. Update Booking details and commit
        booking.setPaymentId(payment.getId());
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // 5. Update seat status in event-service to BOOKED
        String seatUrl = "https://api-gateway:8080/api/seats/" + booking.getSeatId();
        restTemplate.put(seatUrl + "/status?status=BOOKED", null);

        // 6. Release Redis hold lock explicitly
        seatLockService.releaseLock(booking.getSeatId(), booking.getUserId());

        // 7. Fetch user and event details to compile booking event details
        String userUrl = "https://api-gateway:8080/api/auth/profile"; // fetch organiser profiles or profiles
        String eventUrl = "https://api-gateway:8080/api/events/" + booking.getEventId();
        String seatDetailsUrl = "https://api-gateway:8080/api/seats/" + booking.getSeatId();

        String userEmail = "customer@seatsync.com";
        String userName = "Valued Customer";
        String eventTitle = "Live Show";
        String seatNumber = "A1";

        try {
            Map<?, ?> eventMap = restTemplate.getForObject(eventUrl, Map.class);
            if (eventMap != null) {
                eventTitle = (String) eventMap.get("title");
            }
            Map<?, ?> seatMap = restTemplate.getForObject(seatDetailsUrl, Map.class);
            if (seatMap != null) {
                seatNumber = (String) seatMap.get("seatNumber");
            }
        } catch (Exception e) {
            // Log fallback
        }

        // 8. Publish booking confirmation to Kafka
        BookingNotificationEvent notificationEvent = BookingNotificationEvent.builder()
                .bookingId(booking.getId())
                .userId(booking.getUserId())
                .userEmail(userEmail)
                .userName(userName)
                .seatId(booking.getSeatId())
                .seatNumber(seatNumber)
                .eventId(booking.getEventId())
                .eventTitle(eventTitle)
                .price(request.getAmount())
                .status("CONFIRMED")
                .build();

        bookingEventProducer.sendBookingNotification(notificationEvent);

        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBookingId())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .transactionId(payment.getTransactionId())
                .idempotencyKey(payment.getIdempotencyKey())
                .partialCardNumber(payment.getPartialCardNumber())
                .paymentTime(payment.getPaymentTime())
                .build();
    }
}
