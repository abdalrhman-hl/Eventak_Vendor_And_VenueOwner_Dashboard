import { ApiError, apiRequest } from "./api.js";
import { normalizeBackendMediaUrl } from "./media.js";
import { displayServiceCategoryName } from "./serviceCategories.js";
import { resolveLocalizedText } from "./venues.js";

export const serviceStatusLabels = {
  active: { en: "Active", ar: "نشطة" },
  pending: { en: "Pending Admin Review", ar: "بانتظار مراجعة الإدارة" },
  pending_delete: { en: "Delete Request Pending", ar: "طلب الحذف قيد المراجعة" },
  inactive: { en: "Inactive", ar: "غير نشطة" },
};

export const serviceStatusClass = {
  active: "active",
  pending: "review",
  pending_delete: "rejected",
  inactive: "muted",
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

export function normalizeVendorService(service) {
  if (!service || typeof service !== "object") return service;
  return {
    ...service,
    images: Array.isArray(service.images)
      ? service.images.map(normalizeBackendMediaUrl).filter(Boolean)
      : [],
  };
}

export async function fetchVendorServices(token, signal) {
  const payload = requireListSuccess(await apiRequest("/vendor/services", { token, signal }));
  return { ...payload, data: payload.data.map(normalizeVendorService) };
}

function appendImages(formData, images) {
  for (const image of images || []) {
    if (image instanceof File) formData.append("images[]", image);
  }
}

export async function createVendorService(token, values) {
  const formData = new FormData();
  formData.append("category_id", String(values.category_id));
  formData.append("name", values.name);
  formData.append("description", values.description);
  formData.append("price", String(values.price));
  appendImages(formData, values.images);

  const payload = requireMutationSuccess(await apiRequest("/vendor/services", {
    method: "POST",
    token,
    body: formData,
  }));
  return { ...payload, data: normalizeVendorService(payload.data) };
}

export async function updateVendorService(token, serviceId, values) {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("description", values.description);
  formData.append("price", String(values.price));
  appendImages(formData, values.images);

  const payload = requireMutationSuccess(await apiRequest(`/vendor/services/${serviceId}`, {
    method: "POST",
    token,
    body: formData,
  }));
  return { ...payload, data: normalizeVendorService(payload.data) };
}

export async function requestDeleteVendorService(token, serviceId) {
  return requireMutationSuccess(await apiRequest(`/vendor/services/${serviceId}`, {
    method: "DELETE",
    token,
  }));
}

export function canModifyService(status) {
  return status === "active" || status === "inactive";
}

export function displayServiceName(value, ar = false) {
  return resolveLocalizedText(value, ar)
    || (ar ? "خدمة بدون اسم" : "Unnamed service");
}

export function displayServiceDescription(value, ar = false) {
  return resolveLocalizedText(value, ar)
    || (ar ? "لا يوجد وصف." : "No description.");
}

export function categoryName(service, ar = false) {
  return displayServiceCategoryName(
    service?.category || { id: service?.category_id, name: null },
    ar,
  );
}

export function formatServiceDate(value, ar) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(ar ? "ar" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
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
