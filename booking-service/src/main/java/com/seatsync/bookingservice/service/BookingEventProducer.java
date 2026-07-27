package com.seatsync.bookingservice.service;

import com.seatsync.bookingservice.dto.BookingNotificationEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class BookingEventProducer {

    private static final String TOPIC = "booking-notifications";
    private final KafkaTemplate<String, BookingNotificationEvent> kafkaTemplate;

    public BookingEventProducer(KafkaTemplate<String, BookingNotificationEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendBookingNotification(BookingNotificationEvent event) {
        kafkaTemplate.send(TOPIC, String.valueOf(event.getBookingId()), event);
    }
}
