// Mock store for Venue Owner Event Requests (backend-compatible shape).
// Future Laravel routes (not called here):
//   GET  /api/venue-owner/events
//   PUT  /api/venue-owner/events/{id}/accept
//   PUT  /api/venue-owner/events/{id}/reject
//   PUT  /api/venue-owner/events/{id}/complete

const listeners = new Set();

export const eventStatusLabels = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  vendor_pending: { en: "Waiting for Vendors", ar: "بانتظار الموردين" },
  confirmed: { en: "Confirmed", ar: "مؤكد" },
  paid: { en: "Paid", ar: "مدفوع" },
  completed: { en: "Completed", ar: "مكتمل" },
  cancelled: { en: "Cancelled", ar: "ملغى" },
};

export const eventStatusClass = {
  pending: "review",
  vendor_pending: "info",
  confirmed: "confirmed",
  paid: "paid",
  completed: "active",
  cancelled: "rejected",
};

let events = [
  {
    id: 15,
    event_name: "Royal Wedding Reception",
    event_type: "Wedding",
    venue_id: 1,
    date: "2026-09-01",
    start_time: "18:00",
    end_time: "23:00",
    guests_count: 250,
    total_price: 7000,
    note: "Please prepare the main hall.",
    status: "pending",
    rejection_reason: null,
    has_services: true,
    customer: { id: 1, name: "Ahmad Khaled", email: "ahmad@example.com", phone: "+963944123456" },
    venue: { id: 1, name: "Royal Wedding Hall" },
    created_at: "2026-08-16T10:30:00.000000Z",
  },
  {
    id: 16,
    event_name: "Engagement Ceremony",
    event_type: "Engagement",
    venue_id: 2,
    date: "2026-09-05",
    start_time: "17:00",
    end_time: "21:00",
    guests_count: 120,
    total_price: 4500,
    note: "Need simple decoration.",
    status: "vendor_pending",
    rejection_reason: null,
    has_services: true,
    customer: { id: 2, name: "Sara Mahmoud", email: "sara@example.com", phone: "+963933456789" },
    venue: { id: 2, name: "Crystal Ballroom" },
    created_at: "2026-08-15T13:10:00.000000Z",
  },
  {
    id: 17,
    event_name: "Corporate Gala",
    event_type: "Corporate",
    venue_id: 1,
    date: "2026-09-10",
    start_time: "19:00",
    end_time: "22:00",
    guests_count: 180,
    total_price: 6000,
    note: "Business event with dinner.",
    status: "confirmed",
    rejection_reason: null,
    has_services: false,
    customer: { id: 3, name: "Omar Hassan", email: "omar@example.com", phone: "+963955789123" },
    venue: { id: 1, name: "Royal Wedding Hall" },
    created_at: "2026-08-14T18:20:00.000000Z",
  },
  {
    id: 18,
    event_name: "Family Celebration",
    event_type: "Private Party",
    venue_id: 2,
    date: "2026-09-12",
    start_time: "16:00",
    end_time: "20:00",
    guests_count: 90,
    total_price: 3500,
    note: null,
    status: "paid",
    rejection_reason: null,
    has_services: false,
    customer: { id: 4, name: "Lina Ali", email: "lina@example.com", phone: "+963988112233" },
    venue: { id: 2, name: "Crystal Ballroom" },
    created_at: "2026-08-13T12:00:00.000000Z",
  },
  {
    id: 19,
    event_name: "Graduation Party",
    event_type: "Graduation",
    venue_id: 1,
    date: "2026-09-15",
    start_time: "18:00",
    end_time: "22:00",
    guests_count: 150,
    total_price: 4800,
    note: "Stage and sound system required.",
    status: "completed",
    rejection_reason: null,
    has_services: true,
    customer: { id: 5, name: "Nour Ahmad", email: "nour@example.com", phone: "+963977445566" },
    venue: { id: 1, name: "Royal Wedding Hall" },
    created_at: "2026-08-12T09:15:00.000000Z",
  },
  {
    id: 20,
    event_name: "Birthday Party",
    event_type: "Birthday",
    venue_id: 2,
    date: "2026-09-20",
    start_time: "15:00",
    end_time: "18:00",
    guests_count: 60,
    total_price: 2500,
    note: "Small family event.",
    status: "cancelled",
    rejection_reason: "The requested time is not available for this venue.",
    has_services: false,
    customer: { id: 6, name: "Maya Khalil", email: "maya@example.com", phone: "+963966778899" },
    venue: { id: 2, name: "Crystal Ballroom" },
    created_at: "2026-08-11T16:45:00.000000Z",
  },
];

function emit() {
  listeners.forEach((cb) => cb());
}

export function getVenueEventRequests() {
  return events;
}

export function getVenueEventRequestById(id) {
  return events.find((e) => String(e.id) === String(id));
}

export function updateVenueEventRequestStatus(id, status, rejectionReason = null) {
  events = events.map((e) =>
    String(e.id) === String(id)
      ? { ...e, status, rejection_reason: rejectionReason ?? e.rejection_reason }
      : e
  );
  emit();
}

export function subscribeVenueEventRequests(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function formatEventDate(iso, ar) {
  try {
    return new Date(iso).toLocaleDateString(ar ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatEventTime(t, ar) {
  if (!t) return "-";
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(ar ? "ar-EG" : "en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
