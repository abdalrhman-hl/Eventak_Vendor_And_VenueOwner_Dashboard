import { useState } from "react";
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
import { notificationTypeLabels } from "../lib/notifications.js";

const ICONS = {
  service_result_approved: { icon: CheckCircle2, accent: "linear-gradient(135deg,#10b981,#059669)" },
  service_result_rejected: { icon: XCircle, accent: "linear-gradient(135deg,#ef4444,#dc2626)" },
  service_result_delete_approved: { icon: Trash2, accent: "linear-gradient(135deg,#10b981,#059669)" },
  service_result_delete_rejected: { icon: Trash2, accent: "linear-gradient(135deg,#ef4444,#dc2626)" },
  booking_cancelled_by_customer: { icon: CalendarX, accent: "linear-gradient(135deg,#f59e0b,#d97706)" },
  invoice_paid: { icon: CreditCard, accent: "linear-gradient(135deg,#7c5bf6,#6a47ea)" },
  new_event_request: { icon: CalendarPlus, accent: "linear-gradient(135deg,#22819a,#1b6a80)" },
  venue_result_approved: { icon: CheckCircle2, accent: "linear-gradient(135deg,#10b981,#059669)" },
  venue_result_rejected: { icon: XCircle, accent: "linear-gradient(135deg,#ef4444,#dc2626)" },
};

const FILTERS = [
  { key: "All", en: "All", ar: "الكل" },
  { key: "Unread", en: "Unread", ar: "غير مقروء" },
  { key: "Read", en: "Read", ar: "مقروء" },
];

function formatDate(iso, ar) {
  try {
    return new Date(iso).toLocaleString(ar ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="dashboard-card stat-card">
      <div className="stat-icon" style={{ background: accent }}>
        <Icon size={22} />
      </div>
      <div className="stat-meta">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

export default function NotificationsView({ notifications, routes, subtitle, subtitleAr, emptyDesc, emptyDescAr }) {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState("All");

  const total = items.length;
  const unreadCount = items.filter((n) => !n.read_at).length;
  const readCount = total - unreadCount;

  const visible = items.filter((n) =>
    filter === "All" ? true : filter === "Unread" ? !n.read_at : !!n.read_at
  );

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })));

  const openNotification = (n) => {
    setItems((prev) =>
      prev.map((x) => (x.id === n.id && !x.read_at ? { ...x, read_at: new Date().toISOString() } : x))
    );
    const route = routes[n.data.type];
    if (route) navigate(route);
  };

  return (
    <div>
      <div
        className="mb-6"
        style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <div>
          <h1 className="heading-xl">{ar ? "الإشعارات" : "Notifications"}</h1>
          <p className="mt-2 subtle">{ar ? subtitleAr : subtitle}</p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="btn-venue"
          style={{
            padding: "10px 14px",
            fontSize: 13,
            opacity: unreadCount === 0 ? 0.5 : 1,
            cursor: unreadCount === 0 ? "not-allowed" : "pointer",
          }}
        >
          <CheckCheck size={16} />
          <span>{ar ? "تحديد الكل كمقروء" : "Mark all as read"}</span>
        </button>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={Bell}
          label={ar ? "إجمالي الإشعارات" : "Total Notifications"}
          value={total}
          accent="linear-gradient(135deg,#22819a,#1b6a80)"
        />
        <StatCard
          icon={BellRing}
          label={ar ? "إشعارات غير مقروءة" : "Unread Notifications"}
          value={unreadCount}
          accent="linear-gradient(135deg,#f59e0b,#d97706)"
        />
        <StatCard
          icon={BellOff}
          label={ar ? "إشعارات مقروءة" : "Read Notifications"}
          value={readCount}
          accent="linear-gradient(135deg,#10b981,#059669)"
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              style={{
                padding: "8px 16px",
                border: "1px solid var(--border)",
                borderRadius: 999,
                background: active ? "var(--primary)" : "transparent",
                color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {ar ? f.ar : f.en}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="dashboard-card" style={{ padding: 48, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--muted)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              color: "var(--muted-foreground)",
            }}
          >
            <Bell size={26} />
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            {ar ? "لا توجد إشعارات حتى الآن." : "No notifications yet."}
          </h3>
          <p className="subtle" style={{ marginTop: 6 }}>{ar ? emptyDescAr : emptyDesc}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visible.map((n) => {
            const meta = ICONS[n.data.type] || { icon: Bell, accent: "linear-gradient(135deg,#22819a,#1b6a80)" };
            const Icon = meta.icon;
            const label = notificationTypeLabels[n.data.type];
            const isRead = !!n.read_at;
            return (
              <div
                key={n.id}
                onClick={() => openNotification(n)}
                className="dashboard-card"
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: 16,
                  cursor: "pointer",
                  borderInlineStart: isRead ? "3px solid transparent" : "3px solid var(--primary)",
                  background: isRead ? "var(--card)" : "color-mix(in srgb, var(--primary) 6%, var(--card))",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: meta.accent,
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{n.data.title}</span>
                      {!isRead && (
                        <span
                          aria-label={ar ? "غير مقروء" : "Unread"}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--primary)",
                            display: "inline-block",
                          }}
                        />
                      )}
                    </div>
                    <span className="subtle" style={{ fontSize: 12 }}>
                      {ar ? "التاريخ" : "Date"}: {formatDate(n.created_at, ar)}
                    </span>
                  </div>

                  <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--muted-foreground)" }}>
                    {n.data.message}
                  </p>

                  <div
                    style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
                  >
                    <span
                      className="status-badge"
                      style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                    >
                      {ar ? "النوع" : "Type"}: {label ? (ar ? label.ar : label.en) : n.data.type}
                    </span>
                    <span className={`status-badge ${isRead ? "active" : "review"}`}>
                      {ar ? "الحالة" : "Status"}: {isRead ? (ar ? "مقروء" : "Read") : ar ? "غير مقروء" : "Unread"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNotification(n);
                      }}
                      className="btn-venue"
                      style={{ padding: "6px 12px", fontSize: 12, marginInlineStart: "auto" }}
                    >
                      <span>{ar ? "عرض" : "View"}</span>
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
