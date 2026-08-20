import { ApiError, apiRequest } from "./api.js";
import { normalizeBackendMediaUrl } from "./media.js";

function requireSuccess(payload) {
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

export function normalizeVenueMedia(record) {
  if (!record || typeof record !== "object") return record;
  return {
    ...record,
    cover_image_url: normalizeBackendMediaUrl(record.cover_image_url),
    images_urls: Array.isArray(record.images_urls)
      ? record.images_urls.map(normalizeBackendMediaUrl).filter(Boolean)
      : [],
  };
}

export async function fetchMyVenues(token, signal) {
  const payload = requireSuccess(await apiRequest("/venue-owner/venues", { token, signal }));
  return { ...payload, data: payload.data.map(normalizeVenueMedia) };
}

export async function createVenueRequest(token, values) {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("capacity", String(values.capacity));
  formData.append("price", String(values.price));
  formData.append("address", values.address);
  if (values.description) formData.append("description", values.description);
  if (values.cover_image instanceof File) formData.append("cover_image", values.cover_image);
  for (const image of values.images || []) formData.append("images[]", image);

  return requireMutationSuccess(await apiRequest("/venue-owner/venue", {
    method: "POST", token, body: formData,
  }));
}

export async function updateVenueRequest(token, venueId, values) {
  return requireMutationSuccess(await apiRequest(`/venue-owner/venue/${venueId}`, {
    method: "PUT",
    token,
    body: {
      name: values.name,
      capacity: values.capacity,
      price: values.price,
      address: values.address,
      description: values.description,
    },
  }));
}

export async function deleteVenueRequest(token, venueId) {
  return requireMutationSuccess(await apiRequest(`/venue-owner/venue/${venueId}`, {
    method: "DELETE", token,
  }));
}

export async function fetchVenueRequests(token, signal) {
  const payload = requireSuccess(await apiRequest("/venue-owner/requests", { token, signal }));
  return { ...payload, data: payload.data.map(normalizeVenueMedia) };
}

export function setVenueFlash(message) {
  try { sessionStorage.setItem("venueRequestFlash", message); } catch { /* optional UX state */ }
}

export function takeVenueFlash() {
  try {
    const message = sessionStorage.getItem("venueRequestFlash");
    if (message) sessionStorage.removeItem("venueRequestFlash");
    return message || "";
  } catch { return ""; }
}

export const REQUEST_TYPE_LABEL = {
  create: { en: "Add Venue", ar: "إضافة صالة" },
  update: { en: "Update Venue", ar: "تعديل صالة" },
  delete: { en: "Delete Venue", ar: "حذف صالة" },
};

export const VENUE_STATUS_LABEL = {
  active: { en: "Active", ar: "نشطة" },
  inactive: { en: "Inactive", ar: "غير نشطة" },
  pending: { en: "Pending", ar: "قيد المراجعة" },
};

export function formatDate(iso, ar) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(ar ? "ar-EG" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export function formatPrice(price) {
  if (price === undefined || price === null || price === "") return "-";
  const numeric = Number(price);
  const display = Number.isFinite(numeric)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(numeric)
    : String(price);
  return `${display} SYP`;
}

export function resolveLocalizedText(value, ar = false) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";

  const preferred = ar ? value.ar : value.en;
  if (typeof preferred === "string" && preferred.trim()) return preferred.trim();

  const fallback = [value.en, value.ar, ...Object.values(value)]
    .find((candidate) => typeof candidate === "string" && candidate.trim());
  return fallback?.trim() || "";
}

export function displayVenueName(name, ar = false) {
  return resolveLocalizedText(name, ar)
    || (ar ? "صالة بدون اسم" : "Unnamed venue");
}

export function displayVenueAddress(address, ar = false) {
  return resolveLocalizedText(address, ar)
    || (ar ? "العنوان غير متاح" : "Address unavailable");
}

export function displayVenueDescription(description, ar = false) {
  return resolveLocalizedText(description, ar)
    || (ar ? "لا يوجد وصف." : "No description.");
}
