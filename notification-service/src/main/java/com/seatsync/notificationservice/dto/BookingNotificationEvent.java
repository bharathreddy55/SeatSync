package com.seatsync.notificationservice.dto;

public class BookingNotificationEvent {
    private Long bookingId;
    private Long userId;
    private String userEmail;
    private String userName;
    private Long seatId;
    private String seatNumber;
    private Long eventId;
    private String eventTitle;
    private Double price;
    private String status;

    public BookingNotificationEvent() {}

    public BookingNotificationEvent(Long bookingId, Long userId, String userEmail, String userName, Long seatId, String seatNumber, Long eventId, String eventTitle, Double price, String status) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.userEmail = userEmail;
        this.userName = userName;
        this.seatId = seatId;
        this.seatNumber = seatNumber;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.price = price;
        this.status = status;
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public Long getSeatId() { return seatId; }
    public void setSeatId(Long seatId) { this.seatId = seatId; }
    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static BookingNotificationEventBuilder builder() {
        return new BookingNotificationEventBuilder();
    }

    public static class BookingNotificationEventBuilder {
        private Long bookingId;
        private Long userId;
        private String userEmail;
        private String userName;
        private Long seatId;
        private String seatNumber;
        private Long eventId;
        private String eventTitle;
        private Double price;
        private String status;

        public BookingNotificationEventBuilder bookingId(Long bookingId) { this.bookingId = bookingId; return this; }
        public BookingNotificationEventBuilder userId(Long userId) { this.userId = userId; return this; }
        public BookingNotificationEventBuilder userEmail(String userEmail) { this.userEmail = userEmail; return this; }
        public BookingNotificationEventBuilder userName(String userName) { this.userName = userName; return this; }
        public BookingNotificationEventBuilder seatId(Long seatId) { this.seatId = seatId; return this; }
        public BookingNotificationEventBuilder seatNumber(String seatNumber) { this.seatNumber = seatNumber; return this; }
        public BookingNotificationEventBuilder eventId(Long eventId) { this.eventId = eventId; return this; }
        public BookingNotificationEventBuilder eventTitle(String eventTitle) { this.eventTitle = eventTitle; return this; }
        public BookingNotificationEventBuilder price(Double price) { this.price = price; return this; }
        public BookingNotificationEventBuilder status(String status) { this.status = status; return this; }

        public BookingNotificationEvent build() {
            return new BookingNotificationEvent(bookingId, userId, userEmail, userName, seatId, seatNumber, eventId, eventTitle, price, status);
        }
    }
}
