import { ApiError, apiRequest } from "./api.js";
import { resolveLocalizedText } from "./venues.js";

export const vendorOrderStatusLabels = {
  pending: { en: "Pending Decision", ar: "بانتظار القرار" },
  accepted: { en: "Accepted", ar: "مقبولة" },
  rejected: { en: "Rejected", ar: "مرفوضة" },
  completed: { en: "Completed", ar: "مكتملة" },
};

export const vendorOrderStatusClass = {
  pending: "review",
  accepted: "active",
  rejected: "rejected",
  completed: "active",
};

function requireListSuccess(payload) {
  if (payload?.status !== "success" || !Array.isArray(payload.data)) {
    throw new ApiError("The server returned an unexpected response.", { kind: "unexpected_response" });
  }
  return payload;
}

function requireMutationSuccess(payload) {
  if (payload?.status !== "success") {
    throw new ApiError("The server returned an unexpected response.", { kind: "unexpected_response" });
  }
  return payload;
}

export async function fetchVendorOrders(token, signal) {
  return requireListSuccess(await apiRequest("/vendor/orders", { token, signal }));
}

export async function acceptVendorOrder(token, eventId, serviceId) {
  return requireMutationSuccess(await apiRequest(
    `/vendor/orders/${eventId}/services/${serviceId}/accept`,
    { method: "PUT", token },
  ));
}

export async function rejectVendorOrder(token, eventId, serviceId) {
  return requireMutationSuccess(await apiRequest(
    `/vendor/orders/${eventId}/services/${serviceId}/reject`,
    { method: "PUT", token },
  ));
}

export function displayOrderText(value, ar = false, fallback) {
  return resolveLocalizedText(value, ar) || fallback || "-";
}

export function formatEventDate(value, ar) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(ar ? "ar" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatEventTime(value, ar) {
  if (!value) return "-";
  const [hours, minutes] = String(value).split(":");
  const date = new Date();
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return date.toLocaleTimeString(ar ? "ar" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
