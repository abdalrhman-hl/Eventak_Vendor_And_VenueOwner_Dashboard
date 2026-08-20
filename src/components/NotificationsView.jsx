import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  XCircle,
  Trash2,
  CalendarX,
  CalendarPlus,
  CreditCard,
  CheckCheck,
} from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import { getApiErrorMessage } from "../lib/api.js";
import {
  fetchNotifications,
  formatNotificationDate,
  getNotificationMessage,
  getNotificationMeta,
  getNotificationRoute,
  getNotificationTitle,
  markNotificationAsRead,
  NOTIFICATION_LIST_REFRESH_EVENT,
  publishUnreadCount,
  requestNotificationRefresh,
} from "../lib/notifications.js";

const ICONS = {
  check: CheckCircle2,
  reject: XCircle,
  delete: Trash2,
  cancelled: CalendarX,
  payment: CreditCard,
  event: CalendarPlus,
  generic: Bell,
};

const FILTERS = [
  { key: "All", en: "All", ar: "الكل" },
  { key: "Unread", en: "Unread", ar: "غير مقروء" },
  { key: "Read", en: "Read", ar: "مقروء" },
];

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="dashboard-card stat-card">
      <div className="stat-icon" style={{ background: accent }}><Icon size={22} /></div>
      <div className="stat-meta">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

export default function NotificationsView({ role, subtitle, subtitleAr, emptyDesc, emptyDescAr }) {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();
  const mounted = useRef(true);
  const requestNumber = useRef(0);
  const pendingIds = useRef(new Set());
  const markAllPending = useRef(false);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const handleSessionError = useCallback((apiError) => {
    if (apiError?.status !== 401) return false;
    clearAuthSession();
    publishUnreadCount(0);
    navigate("/account-type", { replace: true });
    return true;
  }, [navigate]);

  const loadNotifications = useCallback(async ({ showLoading = false } = {}) => {
    const token = getAuthToken();
    if (!token) {
      clearAuthSession();
      publishUnreadCount(0);
      navigate("/account-type", { replace: true });
      return;
    }

    const currentRequest = ++requestNumber.current;
    if (showLoading) setLoading(true);
    try {
      const payload = await fetchNotifications(token);
      if (!mounted.current || currentRequest !== requestNumber.current) return;
      setItems(payload.data);
      publishUnreadCount(payload.data.filter((notification) => !notification.read_at).length);
      setError("");
    } catch (apiError) {
      if (!mounted.current || currentRequest !== requestNumber.current || handleSessionError(apiError)) return;
      setError(getApiErrorMessage(apiError, language));
    } finally {
      if (mounted.current && currentRequest === requestNumber.current) setLoading(false);
    }
  }, [handleSessionError, language, navigate]);

  useEffect(() => {
    mounted.current = true;
    const refresh = () => void loadNotifications();
    const initialLoadId = window.setTimeout(() => void loadNotifications({ showLoading: true }), 0);
    window.addEventListener(NOTIFICATION_LIST_REFRESH_EVENT, refresh);
    return () => {
      mounted.current = false;
      window.clearTimeout(initialLoadId);
      window.removeEventListener(NOTIFICATION_LIST_REFRESH_EVENT, refresh);
    };
  }, [loadNotifications]);

  const total = items.length;
  const unreadCount = items.filter((notification) => !notification.read_at).length;
  const readCount = total - unreadCount;
  const visible = items.filter((notification) => (
    filter === "All" ? true : filter === "Unread" ? !notification.read_at : Boolean(notification.read_at)
  ));

  async function openNotification(notification) {
    if (pendingIds.current.has(notification.id)) return;
    const route = getNotificationRoute(notification, role);
    if (notification.read_at) {
      if (route) navigate(route);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      clearAuthSession();
      navigate("/account-type", { replace: true });
      return;
    }

    pendingIds.current.add(notification.id);
    setError("");
    try {
      const payload = await markNotificationAsRead(token, notification.id);
      setItems((current) => current.map((item) => (
        item.id === notification.id ? { ...item, ...(payload.data || {}), read_at: payload.data?.read_at || new Date().toISOString() } : item
      )));
      publishUnreadCount(Math.max(0, unreadCount - 1));
      requestNotificationRefresh();
      if (route) navigate(route);
    } catch (apiError) {
      if (!handleSessionError(apiError)) setError(getApiErrorMessage(apiError, language));
    } finally {
      pendingIds.current.delete(notification.id);
    }
  }

  async function markAllRead() {
    if (markAllPending.current || unreadCount === 0) return;
    const token = getAuthToken();
    if (!token) {
      clearAuthSession();
      navigate("/account-type", { replace: true });
      return;
    }

    markAllPending.current = true;
    setIsMarkingAll(true);
    setError("");
    const unread = items.filter((notification) => !notification.read_at);
    const results = await Promise.allSettled(unread.map((notification) => (
      markNotificationAsRead(token, notification.id)
    )));
    const failure = results.find((result) => result.status === "rejected");
    if (failure && !handleSessionError(failure.reason)) {
      setError(getApiErrorMessage(failure.reason, language));
    }
    await loadNotifications();
    markAllPending.current = false;
    setIsMarkingAll(false);
  }

  return (
    <div>
      <div className="mb-6" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="heading-xl">{ar ? "الإشعارات" : "Notifications"}</h1>
          <p className="mt-2 subtle">{ar ? subtitleAr : subtitle}</p>
        </div>
        <button type="button" onClick={markAllRead} disabled={unreadCount === 0 || isMarkingAll} className="btn-venue" style={{ padding: "10px 14px", fontSize: 13, opacity: unreadCount === 0 || isMarkingAll ? 0.5 : 1 }}>
          <CheckCheck size={16} />
          <span>{isMarkingAll ? (ar ? "جارٍ التحديث..." : "Updating...") : (ar ? "تحديد الكل كمقروء" : "Mark all as read")}</span>
        </button>
      </div>

      {error && (
        <div className="dashboard-card" role="alert" style={{ padding: 12, marginBottom: 18, color: "#ef4444" }}>
          {error}
        </div>
      )}

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={Bell} label={ar ? "إجمالي الإشعارات" : "Total Notifications"} value={total} accent="linear-gradient(135deg,#22819a,#1b6a80)" />
        <StatCard icon={BellRing} label={ar ? "إشعارات غير مقروءة" : "Unread Notifications"} value={unreadCount} accent="linear-gradient(135deg,#f59e0b,#d97706)" />
        <StatCard icon={BellOff} label={ar ? "إشعارات مقروءة" : "Read Notifications"} value={readCount} accent="linear-gradient(135deg,#10b981,#059669)" />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {FILTERS.map((item) => (
          <button key={item.key} type="button" onClick={() => setFilter(item.key)} style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 999, background: filter === item.key ? "var(--primary)" : "transparent", color: filter === item.key ? "var(--primary-foreground)" : "var(--muted-foreground)", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {ar ? item.ar : item.en}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="dashboard-card" style={{ padding: 48, textAlign: "center" }}><p className="subtle">{ar ? "جارٍ تحميل الإشعارات..." : "Loading notifications..."}</p></div>
      ) : visible.length === 0 ? (
        <div className="dashboard-card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--muted)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "var(--muted-foreground)" }}><Bell size={26} /></div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{ar ? "لا توجد إشعارات حتى الآن." : "No notifications yet."}</h3>
          <p className="subtle" style={{ marginTop: 6 }}>{ar ? emptyDescAr : emptyDesc}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visible.map((notification) => {
            const meta = getNotificationMeta(notification);
            const Icon = ICONS[meta.icon] || Bell;
            const isRead = Boolean(notification.read_at);
            const route = getNotificationRoute(notification, role);
            return (
              <div key={notification.id} onClick={() => openNotification(notification)} className="dashboard-card" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 16, cursor: "pointer", borderInlineStart: isRead ? "3px solid transparent" : "3px solid var(--primary)", background: isRead ? "var(--card)" : "color-mix(in srgb, var(--primary) 6%, var(--card))" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: meta.accent, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={20} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{getNotificationTitle(notification, ar)}</span>
                      {!isRead && <span aria-label={ar ? "غير مقروء" : "Unread"} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />}
                    </div>
                    <span className="subtle" style={{ fontSize: 12 }}>{ar ? "التاريخ" : "Date"}: {formatNotificationDate(notification.created_at, ar)}</span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--muted-foreground)" }}>{getNotificationMessage(notification, ar)}</p>
                  <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="status-badge" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{ar ? "النوع" : "Type"}: {meta.label[ar ? "ar" : "en"]}</span>
                    <span className={`status-badge ${isRead ? "active" : "review"}`}>{ar ? "الحالة" : "Status"}: {isRead ? (ar ? "مقروء" : "Read") : (ar ? "غير مقروء" : "Unread")}</span>
                    <button type="button" onClick={(event) => { event.stopPropagation(); void openNotification(notification); }} className="btn-venue" style={{ padding: "6px 12px", fontSize: 12, marginInlineStart: "auto" }}>
                      <span>{route ? (ar ? "عرض" : "View") : (isRead ? (ar ? "مقروء" : "Read") : (ar ? "تحديد كمقروء" : "Mark as read"))}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
