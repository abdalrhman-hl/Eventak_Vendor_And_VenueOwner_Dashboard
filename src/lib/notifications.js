// Frontend-only mock notifications matching the Laravel database notification shape.
// notification.type is the Laravel class name and MUST NOT drive UI logic.
// Only notification.data.type is used for icons, labels and navigation.

export const vendorNotifications = [
  {
    id: "vn-001",
    type: "App\\Notifications\\ServiceResultNotification",
    data: {
      type: "service_result_approved",
      service_id: 5,
      title: "Service approved",
      message: "Your Photography Service has been approved by Admin.",
    },
    read_at: null,
    created_at: "2026-08-15T14:30:00.000000Z",
  },
  {
    id: "vn-002",
    type: "App\\Notifications\\ServiceResultNotification",
    data: {
      type: "service_result_rejected",
      service_id: 8,
      title: "Service rejected",
      message: "Your Luxury Wedding Car service was rejected by Admin.",
    },
    read_at: "2026-08-15T15:00:00.000000Z",
    created_at: "2026-08-15T13:10:00.000000Z",
  },
  {
    id: "vn-003",
    type: "App\\Notifications\\ServiceResultNotification",
    data: {
      type: "service_result_delete_approved",
      service_id: 10,
      title: "Service delete approved",
      message: "Your request to delete DJ and Sound System service has been approved.",
    },
    read_at: null,
    created_at: "2026-08-14T18:20:00.000000Z",
  },
  {
    id: "vn-004",
    type: "App\\Notifications\\BookingCancelledNotification",
    data: {
      type: "booking_cancelled_by_customer",
      event_id: 15,
      title: "Booking cancelled",
      message: "The customer cancelled a booking related to one of your services.",
    },
    read_at: null,
    created_at: "2026-08-14T17:45:00.000000Z",
  },
  {
    id: "vn-005",
    type: "App\\Notifications\\InvoicePaidNotification",
    data: {
      type: "invoice_paid",
      event_id: 17,
      payment_id: 3,
      title: "Invoice paid",
      message: "The customer paid the invoice for an event that includes your service.",
    },
    read_at: "2026-08-14T19:00:00.000000Z",
    created_at: "2026-08-14T16:15:00.000000Z",
  },
];

export const venueNotifications = [
  {
    id: "on-001",
    type: "App\\Notifications\\NewEventRequestNotification",
    data: {
      type: "new_event_request",
      event_id: 15,
      title: "New booking request",
      message: "A customer created a new booking request for Royal Wedding Hall.",
    },
    read_at: null,
    created_at: "2026-08-15T14:30:00.000000Z",
  },
  {
    id: "on-002",
    type: "App\\Notifications\\BookingCancelledNotification",
    data: {
      type: "booking_cancelled_by_customer",
      event_id: 16,
      title: "Booking cancelled",
      message: "The customer cancelled a booking request for one of your venues.",
    },
    read_at: "2026-08-15T15:00:00.000000Z",
    created_at: "2026-08-15T13:10:00.000000Z",
  },
  {
    id: "on-003",
    type: "App\\Notifications\\InvoicePaidNotification",
    data: {
      type: "invoice_paid",
      event_id: 17,
      payment_id: 3,
      title: "Invoice paid",
      message: "The customer paid the invoice for a booking in one of your venues.",
    },
    read_at: null,
    created_at: "2026-08-14T18:20:00.000000Z",
  },
  {
    id: "on-004",
    type: "App\\Notifications\\VenueResultNotification",
    data: {
      type: "venue_result_approved",
      venue_request_id: 9,
      title: "Venue request approved",
      message: "Your venue request has been approved by Admin.",
    },
    read_at: null,
    created_at: "2026-08-14T17:45:00.000000Z",
  },
  {
    id: "on-005",
    type: "App\\Notifications\\VenueResultNotification",
    data: {
      type: "venue_result_rejected",
      venue_request_id: 10,
      title: "Venue request rejected",
      message: "Your venue request was rejected by Admin. Please review the request details.",
    },
    read_at: "2026-08-14T20:00:00.000000Z",
    created_at: "2026-08-14T16:20:00.000000Z",
  },
];

export const vendorNotificationRoutes = {
  service_result_approved: "/vendor-dashboard/service-requests",
  service_result_rejected: "/vendor-dashboard/service-requests",
  service_result_delete_approved: "/vendor-dashboard/service-requests",
  service_result_delete_rejected: "/vendor-dashboard/service-requests",
  booking_cancelled_by_customer: "/vendor-dashboard/event-requests",
  invoice_paid: "/vendor-dashboard/event-requests",
};

export const venueNotificationRoutes = {
  new_event_request: "/venue-dashboard/event-requests",
  booking_cancelled_by_customer: "/venue-dashboard/event-requests",
  invoice_paid: "/venue-dashboard/event-requests",
  venue_result_approved: "/venue-dashboard/venue-requests",
  venue_result_rejected: "/venue-dashboard/venue-requests",
};

export const notificationTypeLabels = {
  service_result_approved: { en: "Service Approved", ar: "تمت الموافقة على الخدمة" },
  service_result_rejected: { en: "Service Rejected", ar: "تم رفض الخدمة" },
  service_result_delete_approved: { en: "Service Delete Approved", ar: "تمت الموافقة على حذف الخدمة" },
  service_result_delete_rejected: { en: "Service Delete Rejected", ar: "تم رفض حذف الخدمة" },
  booking_cancelled_by_customer: { en: "Booking Cancelled", ar: "تم إلغاء الحجز" },
  invoice_paid: { en: "Invoice Paid", ar: "تم دفع الفاتورة" },
  new_event_request: { en: "New Event Request", ar: "طلب فعالية جديد" },
  venue_result_approved: { en: "Venue Request Approved", ar: "تمت الموافقة على طلب الصالة" },
  venue_result_rejected: { en: "Venue Request Rejected", ar: "تم رفض طلب الصالة" },
};

export const mockUnreadCount = 3;
