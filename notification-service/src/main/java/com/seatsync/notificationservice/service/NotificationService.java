package com.seatsync.notificationservice.service;

import com.seatsync.notificationservice.dto.BookingNotificationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    public void sendNotification(BookingNotificationEvent event) {
        sendBookingConfirmationEmail(event);
        sendBookingConfirmationSms(event);
    }

    public void sendBookingConfirmationEmail(BookingNotificationEvent event) {
        log.info("=========================================");
        log.info("SENDING EMAIL NOTIFICATION");
        log.info("To: {}", event.getUserEmail());
        log.info("Subject: Booking Confirmed! - Ticket ID: {}", event.getBookingId());
        log.info("Dear {},", event.getUserName());
        log.info("Your booking for the event '{}' is confirmed.", event.getEventTitle());
        log.info("Seat: {} | Price Paid: ${}", event.getSeatNumber(), event.getPrice());
        log.info("Thank you for choosing SeatSync!");
        log.info("=========================================");
    }

    public void sendBookingConfirmationSms(BookingNotificationEvent event) {
        log.info("-----------------------------------------");
        log.info("SENDING SMS NOTIFICATION (MOCK)");
        log.info("To User ID: {}", event.getUserId());
        log.info("Message: SeatSync: Booking #{} confirmed! Seat {} for '{}'. Enjoy your event!", 
                event.getBookingId(), event.getSeatNumber(), event.getEventTitle());
        log.info("-----------------------------------------");
    }
}
