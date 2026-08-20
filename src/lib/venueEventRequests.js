import { ApiError, apiRequest } from "./api.js";
import { resolveLocalizedText } from "./venues.js";

function requireSuccess(payload, expectList = false) {
  if (payload?.status !== "success" || (expectList && !Array.isArray(payload.data))) {
    throw new ApiError("The server returned an unexpected response.", { kind: "unexpected_response" });
  }
  return payload;
}

export async function fetchVenueEvents(token, signal) {
  return requireSuccess(await apiRequest("/venue-owner/events", { token, signal }), true);
}

export async function acceptVenueEvent(token, eventId) {
  return requireSuccess(await apiRequest(`/venue-owner/events/${eventId}/accept`, { method: "PUT", token }));
}

export async function rejectVenueEvent(token, eventId, rejectionReason) {
  return requireSuccess(await apiRequest(`/venue-owner/events/${eventId}/reject`, {
    method: "PUT", token, body: { rejection_reason: rejectionReason },
  }));
}

export async function completeVenueEvent(token, eventId) {
  return requireSuccess(await apiRequest(`/venue-owner/events/${eventId}/complete`, { method: "PUT", token }));
}

export const eventStatusLabels = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  venue_pending: { en: "Waiting for Venue", ar: "بانتظار الصالة" },
  vendor_pending: { en: "Waiting for Vendors", ar: "بانتظار الموردين" },
  confirmed: { en: "Confirmed", ar: "مؤكد" },
  paid: { en: "Paid", ar: "مدفوع" },
  completed: { en: "Completed", ar: "مكتمل" },
  cancelled: { en: "Cancelled", ar: "ملغى" },
};

export const eventStatusClass = {
  pending: "review", venue_pending: "review", vendor_pending: "info",
  confirmed: "confirmed", paid: "paid", completed: "active", cancelled: "rejected",
};

export function canRejectVenueEvent(status) {
  return !["paid", "completed", "cancelled"].includes(status);
}

export function formatEventDate(iso, ar) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(ar ? "ar-EG" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export function formatEventTime(time, ar) {
  if (!time) return "-";
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(ar ? "ar-EG" : "en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export function displayEventName(name, ar = false) {
  return resolveLocalizedText(name, ar)
    || (ar ? "فعالية بدون اسم" : "Unnamed event");
}

export function displayEventText(value, ar = false, fallback = "-") {
  return resolveLocalizedText(value, ar) || fallback;
}
