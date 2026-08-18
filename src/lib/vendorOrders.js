// Mock store for Vendor Event Requests (event_services pivot records).
// Future Laravel routes (not called here):
//   GET /api/vendor/orders
//   PUT /api/vendor/orders/{eventId}/services/{serviceId}/accept
//   PUT /api/vendor/orders/{eventId}/services/{serviceId}/reject

const listeners = new Set();

export const vendorOrderStatusLabels = {
  pending: { en: "Pending Decision", ar: "بانتظار القرار" },
  accepted: { en: "Accepted", ar: "مقبولة" },
  rejected: { en: "Rejected", ar: "مرفوضة" },
};

export const vendorOrderStatusClass = {
  pending: "review",
  accepted: "active",
  rejected: "rejected",
};

let orders = [
  {
    id: 501,
    event_id: 15,
    service_id: 1,
    vendor_id: 7,
    status: "pending",
    created_at: "2026-08-16T10:30:00.000000Z",
    event: {
      id: 15,
      customer_id: 1,
      venue_id: 1,
      date: "2026-09-01",
      start_time: "18:00",
      end_time: "23:00",
      event_type: "Wedding",
    },
    service: {
      id: 1,
      name: "Wedding Photography Package",
      price: 400,
      description: "Professional wedding photography service with full event coverage.",
    },
    customer: { id: 1, name: "Ahmad Khaled", phone: "+963944123456" },
    venue: { id: 1, name: "Royal Wedding Hall", address: "Damascus - Mazzeh" },
    mock_all_vendor_services_accepted_after_accept: false,
  },
  {
    id: 502,
    event_id: 16,
    service_id: 2,
    vendor_id: 7,
    status: "pending",
    created_at: "2026-08-15T13:10:00.000000Z",
    event: {
      id: 16,
      customer_id: 2,
      venue_id: 2,
      date: "2026-09-05",
      start_time: "17:00",
      end_time: "21:00",
      event_type: "Engagement",
    },
    service: {
      id: 2,
      name: "Luxury Flower Decoration",
      price: 250,
      description: "Premium floral decoration for engagement parties.",
    },
    customer: { id: 2, name: "Sara Mahmoud", phone: "+963933456789" },
    venue: { id: 2, name: "Crystal Ballroom", address: "Damascus - Abu Rummaneh" },
    mock_all_vendor_services_accepted_after_accept: true,
  },
];

const notify = () => listeners.forEach((cb) => cb());

export function subscribeVendorOrders(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// GET /api/vendor/orders — pending service decisions only
export function getVendorOrders() {
  return orders.filter((o) => o.status === "pending");
}

export function getVendorOrderById(id) {
  return orders.find((o) => String(o.id) === String(id));
}

// PUT /api/vendor/orders/{eventId}/services/{serviceId}/accept|reject (mock)
export function updateVendorOrderStatus(id, status) {
  orders = orders.map((o) => (String(o.id) === String(id) ? { ...o, status } : o));
  notify();
}

export function formatEventDate(value, ar) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(ar ? "ar" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatEventTime(value, ar) {
  if (!value) return "-";
  const [h, m] = String(value).split(":");
  const d = new Date();
  d.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
  return d.toLocaleTimeString(ar ? "ar" : "en-GB", { hour: "2-digit", minute: "2-digit" });
}
