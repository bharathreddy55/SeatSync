package com.seatsync.notificationservice.consumer;

import com.seatsync.notificationservice.dto.BookingNotificationEvent;
import com.seatsync.notificationservice.service.NotificationService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumer {

    private final NotificationService notificationService;

    public NotificationConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "booking-notifications", groupId = "notification-group")
    public void consumeBookingNotification(BookingNotificationEvent event) {
        notificationService.sendNotification(event);
    }
}
