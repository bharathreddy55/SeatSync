package com.seatsync.notificationservice.service;

import com.seatsync.notificationservice.dto.BookingNotificationEvent;
import com.seatsync.notificationservice.dto.PasswordResetEvent;
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

    public void sendPasswordResetEmail(PasswordResetEvent event) {
        log.info("=========================================");
        log.info("PREPARING PASSWORD RESET EMAIL");
        log.info("To: {}", event.getEmail());
        log.info("Token: {}", event.getToken());
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@seatsync.com");
            message.setTo(event.getEmail());
            message.setSubject("SeatSync Password Reset Request");
            
            String resetUrl = "https://seat-sync-ecru.vercel.app/reset-password?token=" + event.getToken();
            
            String body = String.format(
                "Dear %s,\n\n" +
                "We received a request to reset your password for your SeatSync account.\n" +
                "Please click the link below to set a new password. This link is valid for 15 minutes:\n\n" +
                "%s\n\n" +
                "If you did not request this, you can safely ignore this email.\n\n" +
                "Best Regards,\n" +
                "The SeatSync Team",
                event.getUserName(),
                resetUrl
            );
            
            message.setText(body);
            mailSender.send(message);
            
            log.info("PASSWORD RESET EMAIL SENT SUCCESSFULLY");
        } catch (Exception e) {
            log.error("FAILED to send password reset email to {}: {}", event.getEmail(), e.getMessage());
        }
        log.info("=========================================");
    }
}
