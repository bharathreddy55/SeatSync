package com.seatsync.notificationservice.service;

import com.seatsync.notificationservice.dto.BookingNotificationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final JavaMailSender mailSender;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNotification(BookingNotificationEvent event) {
        sendBookingConfirmationEmail(event);
        sendBookingConfirmationSms(event);
    }

    public void sendBookingConfirmationEmail(BookingNotificationEvent event) {
        log.info("=========================================");
        log.info("PREPARING EMAIL NOTIFICATION");
        log.info("To: {}", event.getUserEmail());
        log.info("Subject: Booking Confirmed! - Ticket ID: {}", event.getBookingId());
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@seatsync.com");
            message.setTo(event.getUserEmail());
            message.setSubject("SeatSync Booking Confirmation - #" + event.getBookingId());
            
            String body = String.format(
                "Dear %s,\n\n" +
                "Your ticket reservation for '%s' has been successfully confirmed!\n\n" +
                "Booking Details:\n" +
                "-----------------------------------------\n" +
                "Ticket Reference: #%d\n" +
                "Event: %s\n" +
                "Seat Assigned: %s\n" +
                "Amount Paid: $%s\n" +
                "Status: %s\n" +
                "-----------------------------------------\n\n" +
                "Thank you for choosing SeatSync!\n\n" +
                "Best Regards,\n" +
                "The SeatSync Team",
                event.getUserName(),
                event.getEventTitle(),
                event.getBookingId(),
                event.getEventTitle(),
                event.getSeatNumber(),
                event.getPrice(),
                event.getStatus()
            );
            
            message.setText(body);
            mailSender.send(message);
            
            log.info("EMAIL SENT SUCCESSFULLY via JavaMailSender");
        } catch (Exception e) {
            log.error("FAILED to send email notification to {}: {}", event.getUserEmail(), e.getMessage());
        }
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
