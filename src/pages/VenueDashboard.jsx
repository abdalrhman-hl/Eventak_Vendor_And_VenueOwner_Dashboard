import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, CalendarCheck, CalendarDays, ClipboardList } from "lucide-react";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import { useLanguage } from "../lib/language.jsx";
import { displayEventName, eventStatusLabels, fetchVenueEvents, formatEventDate, formatEventTime } from "../lib/venueEventRequests.js";
import { fetchMyVenues, fetchVenueRequests } from "../lib/venues.js";

function StatCard({ icon: Icon, label, value, accent }) {
  return <div className="dashboard-card stat-card"><div className="stat-icon" style={{ background: accent }}><Icon size={22} /></div><div className="stat-meta"><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div></div>;
}

export default function VenueDashboard() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [requests, setRequests] = useState([]);
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
    Promise.all([
      fetchMyVenues(token, controller.signal),
      fetchVenueRequests(token, controller.signal),
      fetchVenueEvents(token, controller.signal),
    ])
      .then(([venuePayload, requestPayload, eventPayload]) => {
        setVenues(venuePayload.data);
        setRequests(requestPayload.data);
        setEvents(eventPayload.data);
      })
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

  const activeEvents = events.filter((event) => !["completed", "cancelled"].includes(event.status));
  const upcoming = [...activeEvents].sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`)).slice(0, 3);
  const recent = events.slice(0, 3);
  const stats = [
    { icon: Building2, label: ar ? "إجمالي الصالات" : "Total Venues", value: venues.length, accent: "linear-gradient(135deg,#22819a,#1b6a80)" },
    { icon: ClipboardList, label: ar ? "طلبات الصالات المعلقة" : "Pending Venue Requests", value: requests.length, accent: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { icon: CalendarDays, label: ar ? "طلبات الفعاليات المعلقة" : "Pending Event Requests", value: events.filter((event) => event.status === "pending").length, accent: "linear-gradient(135deg,#7c5bf6,#6a47ea)" },
    { icon: CalendarCheck, label: ar ? "الفعاليات القادمة" : "Upcoming Events", value: activeEvents.length, accent: "linear-gradient(135deg,#16a34a,#15803d)" },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="heading-xl">{ar ? "مرحباً بك في Eventak" : "Welcome to Eventak"}</h1><p className="mt-2 subtle">{ar ? "نظرة عامة على نشاط صالاتك وحجوزاتك القادمة" : "Overview of your venue activity and upcoming bookings"}</p></div>
      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}
      {loading ? <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>{ar ? "جاري تحميل لوحة التحكم..." : "Loading dashboard..."}</div> : <>
        <div className="stat-grid">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</div>
        <div className="overview-grid mt-6">
          <div className="dashboard-card"><div className="card-head"><h3 className="card-title">{ar ? "أحدث الفعاليات" : "Recent Events"}</h3><Link className="link-primary small" to="/venue-dashboard/event-requests">{ar ? "عرض الكل" : "View all"}</Link></div>
            <ul className="list-stack">{recent.length ? recent.map((item) => <li key={item.id} className="list-item"><div><div className="list-title">{displayEventName(item.event_name, ar)}</div><div className="list-sub">{item.customer?.name || "-"} · #{item.id}</div></div><div className="list-meta"><span className="status-pill">{eventStatusLabels[item.status]?.[ar ? "ar" : "en"] || item.status || "-"}</span><div className="list-sub xsmall">{formatEventDate(item.date, ar)}</div></div></li>) : <li className="list-item"><span className="subtle">{ar ? "لا توجد فعاليات." : "No events."}</span></li>}</ul>
          </div>
          <div className="dashboard-card"><div className="card-head"><h3 className="card-title">{ar ? "الفعاليات القادمة" : "Upcoming Events"}</h3><Link className="link-primary small" to="/venue-dashboard/event-requests">{ar ? "عرض الكل" : "View all"}</Link></div>
            <ul className="list-stack">{upcoming.length ? upcoming.map((item) => <li key={item.id} className="list-item"><div><div className="list-title">{displayEventName(item.event_name, ar)}</div><div className="list-sub">#{item.id} · {formatEventTime(item.start_time, ar)}</div></div><div className="list-meta"><div className="list-sub xsmall">{formatEventDate(item.date, ar)}</div></div></li>) : <li className="list-item"><span className="subtle">{ar ? "لا توجد فعاليات قادمة." : "No upcoming events."}</span></li>}</ul>
          </div>
        </div>
      </>}
    </div>
  );
}
