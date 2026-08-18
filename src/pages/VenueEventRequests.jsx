import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, CheckCircle2, CalendarClock } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import {
  getVenueEventRequests,
  subscribeVenueEventRequests,
  eventStatusLabels,
  eventStatusClass,
  formatEventDate,
  formatEventTime,
} from "../lib/venueEventRequests.js";

const FILTERS = [
  { key: "all", en: "All", ar: "الكل" },
  { key: "pending", en: "Pending", ar: "قيد الانتظار" },
  { key: "vendor_pending", en: "Waiting for Vendors", ar: "بانتظار الموردين" },
  { key: "confirmed", en: "Confirmed", ar: "مؤكد" },
  { key: "paid", en: "Paid", ar: "مدفوع" },
  { key: "completed", en: "Completed", ar: "مكتمل" },
  { key: "cancelled", en: "Cancelled", ar: "ملغى" },
];

export default function VenueEventRequests() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const [filter, setFilter] = useState("all");
  const [, force] = useState(0);
  const location = useLocation();
  const [flash, setFlash] = useState(location.state?.flash || "");

  useEffect(() => subscribeVenueEventRequests(() => force((n) => n + 1)), []);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  // GET /api/venue-owner/events (mock)
  const events = getVenueEventRequests();
  const visible = filter === "all" ? events : events.filter((e) => e.status === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "طلبات الفعاليات" : "Event Requests"}</h1>
        <p className="mt-2 subtle">
          {ar
            ? "راجع وأدر جميع طلبات الحجز المرتبطة بصالاتك."
            : "Review and manage all booking requests related to your venues."}
        </p>
      </div>

      {flash && (
        <div role="status" style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10,
          background: "rgba(16, 185, 129, 0.1)", color: "#047857",
          border: "1px solid rgba(16, 185, 129, 0.3)", marginBottom: 16, fontSize: 14, fontWeight: 500,
        }}>
          <CheckCircle2 size={18} />
          <span>{flash}</span>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="segmented-item"
              style={{
                padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 999,
                background: active ? "var(--primary)" : "transparent",
                color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
            >
              {ar ? f.ar : f.en}
            </button>
          );
        })}
      </div>

      {events.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>
          <CalendarClock size={32} color="var(--muted-foreground)" />
          <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>
            {ar ? "لا توجد طلبات فعاليات حتى الآن." : "No event requests yet."}
          </h3>
          <p className="subtle" style={{ marginTop: 6 }}>
            {ar
              ? "ستظهر هنا طلبات الحجز المرتبطة بصالاتك."
              : "Booking requests related to your venues will appear here."}
          </p>
        </div>
      ) : (
        <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="vr-table">
              <thead>
                <tr>
                  <th>{ar ? "رقم الفعالية" : "Event ID"}</th>
                  <th>{ar ? "اسم الفعالية" : "Event Name"}</th>
                  <th>{ar ? "اسم الصالة" : "Venue Name"}</th>
                  <th>{ar ? "اسم الزبون" : "Customer Name"}</th>
                  <th>{ar ? "رقم الزبون" : "Customer Phone"}</th>
                  <th>{ar ? "التاريخ" : "Date"}</th>
                  <th>{ar ? "وقت البداية" : "Start Time"}</th>
                  <th>{ar ? "وقت النهاية" : "End Time"}</th>
                  <th>{ar ? "عدد الضيوف" : "Guests Count"}</th>
                  <th>{ar ? "الحالة" : "Status"}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center", padding: 32, color: "var(--muted-foreground)" }}>
                      {ar ? "لا توجد طلبات لعرضها." : "No requests to display."}
                    </td>
                  </tr>
                ) : (
                  visible.map((e) => (
                    <tr key={e.id}>
                      <td data-label={ar ? "رقم الفعالية" : "Event ID"}>#{e.id}</td>
                      <td data-label={ar ? "اسم الفعالية" : "Event Name"} style={{ fontWeight: 600 }}>{e.event_name}</td>
                      <td data-label={ar ? "اسم الصالة" : "Venue Name"}>{e.venue?.name}</td>
                      <td data-label={ar ? "اسم الزبون" : "Customer Name"}>{e.customer?.name}</td>
                      <td data-label={ar ? "رقم الزبون" : "Customer Phone"} style={{ direction: "ltr" }}>{e.customer?.phone}</td>
                      <td data-label={ar ? "التاريخ" : "Date"}>{formatEventDate(e.date, ar)}</td>
                      <td data-label={ar ? "وقت البداية" : "Start Time"}>{formatEventTime(e.start_time, ar)}</td>
                      <td data-label={ar ? "وقت النهاية" : "End Time"}>{formatEventTime(e.end_time, ar)}</td>
                      <td data-label={ar ? "عدد الضيوف" : "Guests Count"}>{e.guests_count}</td>
                      <td data-label={ar ? "الحالة" : "Status"}>
                        <span className={`status-badge ${eventStatusClass[e.status]}`}>
                          {eventStatusLabels[e.status]?.[ar ? "ar" : "en"] || e.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/venue-dashboard/event-requests/${e.id}`}
                          className="btn-venue"
                          style={{ padding: "8px 12px", fontSize: 13, textDecoration: "none" }}
                        >
                          <Eye size={14} />
                          <span>{ar ? "عرض التفاصيل" : "View Details"}</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
