import { ApiError, apiRequest } from "./api.js";

export const NOTIFICATION_REFRESH_EVENT = "eventak:notifications-refresh";
export const NOTIFICATION_COUNT_EVENT = "eventak:notification-count";
export const NOTIFICATION_LIST_REFRESH_EVENT = "eventak:notification-list-refresh";

let latestUnreadCount = 0;

const NOTIFICATION_TYPES = {
  service_result_approved: {
    icon: "check",
    accent: "linear-gradient(135deg,#10b981,#059669)",
    label: { en: "Service Approved", ar: "تمت الموافقة على الخدمة" },
  },
  service_result_rejected: {
    icon: "reject",
    accent: "linear-gradient(135deg,#ef4444,#dc2626)",
    label: { en: "Service Rejected", ar: "تم رفض الخدمة" },
  },
  service_result_delete_approved: {
    icon: "delete",
    accent: "linear-gradient(135deg,#10b981,#059669)",
    label: { en: "Service Delete Approved", ar: "تمت الموافقة على حذف الخدمة" },
  },
  service_result_delete_rejected: {
    icon: "delete",
    accent: "linear-gradient(135deg,#ef4444,#dc2626)",
    label: { en: "Service Delete Rejected", ar: "تم رفض حذف الخدمة" },
  },
  booking_cancelled_by_customer: {
    icon: "cancelled",
    accent: "linear-gradient(135deg,#f59e0b,#d97706)",
    label: { en: "Booking Cancelled", ar: "تم إلغاء الحجز" },
  },
  invoice_paid: {
    icon: "payment",
    accent: "linear-gradient(135deg,#7c5bf6,#6a47ea)",
    label: { en: "Invoice Paid", ar: "تم دفع الفاتورة" },
  },
  new_event_request: {
    icon: "event",
    accent: "linear-gradient(135deg,#22819a,#1b6a80)",
    label: { en: "New Event Request", ar: "طلب فعالية جديد" },
  },
  venue_result_approved: {
    icon: "check",
    accent: "linear-gradient(135deg,#10b981,#059669)",
    label: { en: "Venue Request Approved", ar: "تمت الموافقة على طلب الصالة" },
  },
  venue_result_rejected: {
    icon: "reject",
    accent: "linear-gradient(135deg,#ef4444,#dc2626)",
    label: { en: "Venue Request Rejected", ar: "تم رفض طلب الصالة" },
  },
};

const GENERIC_META = {
  icon: "generic",
  accent: "linear-gradient(135deg,#22819a,#1b6a80)",
  label: { en: "Notification", ar: "إشعار" },
};

function requireNotificationList(payload) {
  if (payload?.status !== "success" || !Array.isArray(payload.data)) {
    throw new ApiError("The server returned an unexpected response.", {
      kind: "unexpected_response",
    });
  }
  return payload;
}

function requireSuccess(payload) {
  if (payload?.status !== "success") {
    throw new ApiError("The server returned an unexpected response.", {
      kind: "unexpected_response",
    });
  }
  return payload;
}

function normalizeNotification(notification) {
  if (!notification || typeof notification !== "object") return null;
  return {
    ...notification,
    data: notification.data && typeof notification.data === "object" && !Array.isArray(notification.data)
      ? notification.data
      : {},
  };
}

function normalizeList(payload) {
  return {
    ...payload,
    data: payload.data.map(normalizeNotification).filter(Boolean),
  };
}

export async function fetchNotifications(token, signal) {
  return normalizeList(requireNotificationList(await apiRequest("/notifications", { token, signal })));
}

export async function fetchUnreadNotifications(token, signal) {
  return normalizeList(requireNotificationList(await apiRequest("/notifications/unread", { token, signal })));
}

export async function markNotificationAsRead(token, notificationId) {
  return requireSuccess(await apiRequest(`/notifications/${notificationId}/read`, {
    method: "PUT",
    token,
  }));
}

export function getNotificationMeta(notification) {
  return NOTIFICATION_TYPES[notification?.data?.type] || GENERIC_META;
}

export function getNotificationTitle(notification, ar = false) {
  const backendTitle = notification?.data?.title;
  if (typeof backendTitle === "string" && backendTitle.trim()) return backendTitle.trim();
  return getNotificationMeta(notification).label[ar ? "ar" : "en"];
}

export function getNotificationMessage(notification, ar = false) {
  const backendMessage = notification?.data?.message;
  if (typeof backendMessage === "string" && backendMessage.trim()) return backendMessage.trim();
  return ar ? "لديك تحديث جديد." : "You have a new update.";
}

export function getNotificationRoute(notification, role) {
  const data = notification?.data || {};
  const type = data.type;

  if (role === "vendor") {
    if (type?.startsWith("service_result_")) {
      return "/vendor-dashboard/service-requests";
    }
    if (type === "booking_cancelled_by_customer" || type === "invoice_paid") {
      return "/vendor-dashboard/event-requests";
    }
    return null;
  }

  if (role === "venue_owner") {
    if (["new_event_request", "booking_cancelled_by_customer", "invoice_paid"].includes(type)) {
      return data.event_id
        ? `/venue-dashboard/event-requests/${data.event_id}`
        : "/venue-dashboard/event-requests";
    }
    if (type === "venue_result_approved" || type === "venue_result_rejected") {
      return data.venue_request_id
        ? `/venue-dashboard/venue-requests/${data.venue_request_id}`
        : "/venue-dashboard/venue-requests";
    }
  }

  return null;
}

export function formatNotificationDate(value, ar = false) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(ar ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getLatestUnreadCount() {
  return latestUnreadCount;
}

export function publishUnreadCount(count) {
  latestUnreadCount = Number.isFinite(Number(count)) ? Math.max(0, Number(count)) : 0;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_COUNT_EVENT, {
      detail: { count: latestUnreadCount },
    }));
  }
}

export function requestNotificationRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATION_REFRESH_EVENT));
  }
}

export function requestNotificationListRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATION_LIST_REFRESH_EVENT));
  }
}
