import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarClock, CheckCircle2, Eye } from "lucide-react";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import { useLanguage } from "../lib/language.jsx";
import { displayEventName, eventStatusClass, eventStatusLabels, fetchVenueEvents, formatEventDate, formatEventTime } from "../lib/venueEventRequests.js";
import { displayVenueName } from "../lib/venues.js";

const FILTERS = [
  { key: "all", en: "All", ar: "الكل" },
  { key: "pending", en: "Pending", ar: "قيد الانتظار" },
  { key: "venue_pending", en: "Waiting for Venue", ar: "بانتظار الصالة" },
  { key: "vendor_pending", en: "Waiting for Vendors", ar: "بانتظار الموردين" },
  { key: "confirmed", en: "Confirmed", ar: "مؤكد" },
  { key: "paid", en: "Paid", ar: "مدفوع" },
  { key: "completed", en: "Completed", ar: "مكتمل" },
  { key: "cancelled", en: "Cancelled", ar: "ملغى" },
];

export default function VenueEventRequests() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState("all");
  const [flash, setFlash] = useState(location.state?.flash || "");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const token = getAuthToken();
    if (!token) {
      clearAuthSession();
      navigate("/account-type", { replace: true });
      return () => controller.abort();
    }
    fetchVenueEvents(token, controller.signal)
      .then((payload) => setEvents(payload.data))
      .catch((requestError) => {
        if (requestError?.name === "AbortError") return;
        if (requestError?.status === 401) {
          clearAuthSession();
          navigate("/account-type", { replace: true });
        } else setError(getApiErrorMessage(requestError, language));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [language, navigate]);

  useEffect(() => {
    if (!flash) return undefined;
    const timer = setTimeout(() => setFlash(""), 4000);
    return () => clearTimeout(timer);
  }, [flash]);

  const visible = filter === "all" ? events : events.filter((event) => event.status === filter);
  return (
    <div>
      <div className="mb-6"><h1 className="heading-xl">{ar ? "طلبات الفعاليات" : "Event Requests"}</h1><p className="mt-2 subtle">{ar ? "راجع وأدر جميع طلبات الحجز المرتبطة بصالاتك." : "Review and manage all booking requests related to your venues."}</p></div>
      {flash && <div role="status" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(16, 185, 129, 0.1)", color: "#047857", border: "1px solid rgba(16, 185, 129, 0.3)", marginBottom: 16, fontSize: 14, fontWeight: 500 }}><CheckCircle2 size={18} /><span>{flash}</span></div>}
      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>{FILTERS.map((item) => {
        const active = filter === item.key;
        return <button key={item.key} type="button" onClick={() => setFilter(item.key)} className="segmented-item" style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 999, background: active ? "var(--primary)" : "transparent", color: active ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>{ar ? item.ar : item.en}</button>;
      })}</div>
      {loading ? <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>{ar ? "جاري تحميل طلبات الفعاليات..." : "Loading event requests..."}</div> : events.length === 0 && !error ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}><CalendarClock size={32} color="var(--muted-foreground)" /><h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>{ar ? "لا توجد طلبات فعاليات حتى الآن." : "No event requests yet."}</h3><p className="subtle" style={{ marginTop: 6 }}>{ar ? "ستظهر هنا طلبات الحجز المرتبطة بصالاتك." : "Booking requests related to your venues will appear here."}</p></div>
      ) : (
        <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}><div style={{ overflowX: "auto" }}><table className="vr-table">
          <thead><tr><th>{ar ? "رقم الفعالية" : "Event ID"}</th><th>{ar ? "اسم الفعالية" : "Event Name"}</th><th>{ar ? "اسم الصالة" : "Venue Name"}</th><th>{ar ? "اسم الزبون" : "Customer Name"}</th><th>{ar ? "رقم الزبون" : "Customer Phone"}</th><th>{ar ? "التاريخ" : "Date"}</th><th>{ar ? "وقت البداية" : "Start Time"}</th><th>{ar ? "وقت النهاية" : "End Time"}</th><th>{ar ? "عدد الضيوف" : "Guests Count"}</th><th>{ar ? "الحالة" : "Status"}</th><th></th></tr></thead>
          <tbody>{visible.length === 0 ? <tr><td colSpan={11} style={{ textAlign: "center", padding: 32, color: "var(--muted-foreground)" }}>{ar ? "لا توجد طلبات لعرضها." : "No requests to display."}</td></tr> : visible.map((event) => <tr key={event.id}>
            <td>#{event.id}</td><td style={{ fontWeight: 600 }}>{displayEventName(event.event_name, ar)}</td><td>{displayVenueName(event.venue?.name, ar)}</td><td>{event.customer?.name || "-"}</td><td style={{ direction: "ltr" }}>{event.customer?.phone || "-"}</td><td>{formatEventDate(event.date, ar)}</td><td>{formatEventTime(event.start_time, ar)}</td><td>{formatEventTime(event.end_time, ar)}</td><td>{event.guests_count ?? "-"}</td><td><span className={`status-badge ${eventStatusClass[event.status] || "review"}`}>{eventStatusLabels[event.status]?.[ar ? "ar" : "en"] || event.status || "-"}</span></td><td><Link to={`/venue-dashboard/event-requests/${event.id}`} className="btn-venue" style={{ padding: "8px 12px", fontSize: 13, textDecoration: "none" }}><Eye size={14} /><span>{ar ? "عرض التفاصيل" : "View Details"}</span></Link></td>
          </tr>)}</tbody>
        </table></div></div>
      )}
    </div>
  );
}
