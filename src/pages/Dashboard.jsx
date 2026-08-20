import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, ClipboardList, CalendarCheck, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import {
  displayServiceName,
  fetchVendorServices,
  serviceStatusLabels,
  formatServiceDate,
} from "../lib/vendorServices.js";
import {
  displayOrderText,
  fetchVendorOrders,
  vendorOrderStatusLabels,
  formatEventDate,
} from "../lib/vendorOrders.js";

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

export default function Dashboard() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
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
      fetchVendorServices(token, controller.signal),
      fetchVendorOrders(token, controller.signal),
    ])
      .then(([servicesPayload, ordersPayload]) => {
        setServices(servicesPayload.data);
        setOrders(ordersPayload.data);
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

  const activeServices = services.filter((s) => s.status === "active");
  const pendingServiceRequests = services.filter(
    (s) => s.status === "pending" || s.status === "pending_delete"
  );

  const stats = [
    {
      icon: Package,
      label: ar ? "إجمالي الخدمات" : "Total Services",
      value: services.length,
      accent: "linear-gradient(135deg,#22819a,#1b6a80)",
    },
    {
      icon: CheckCircle2,
      label: ar ? "الخدمات النشطة" : "Active Services",
      value: activeServices.length,
      accent: "linear-gradient(135deg,#10b981,#047857)",
    },
    {
      icon: ClipboardList,
      label: ar ? "طلبات الخدمات المعلقة" : "Pending Service Requests",
      value: pendingServiceRequests.length,
      accent: "linear-gradient(135deg,#f59e0b,#d97706)",
    },
    {
      icon: CalendarCheck,
      label: ar ? "طلبات الفعاليات المعلقة" : "Pending Event Requests",
      value: orders.length,
      accent: "linear-gradient(135deg,#7c5bf6,#6a47ea)",
    },
  ];

  const recentServiceRequests = pendingServiceRequests.slice(0, 3);
  const recentOrders = orders.slice(0, 3);

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "مرحبًا بك في Eventak" : "Welcome to Eventak"}</h1>
        <p className="mt-2 subtle">
          {ar ? "نظرة عامة على خدماتك وطلباتك الأخيرة" : "Overview of your services and recent requests"}
        </p>
      </div>

      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}
      {loading && <div className="dashboard-card" style={{ textAlign: "center", marginBottom: 16 }}>{ar ? "جاري تحميل لوحة التحكم..." : "Loading dashboard..."}</div>}

      <div className="stat-grid">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="overview-grid mt-6">
        <div className="dashboard-card">
          <div className="card-head">
            <h3 className="card-title">{ar ? "أحدث طلبات الخدمات" : "Recent Service Requests"}</h3>
            <Link className="link-primary small" to="/vendor-dashboard/service-requests">
              {ar ? "عرض الكل" : "View all"}
            </Link>
          </div>
          {recentServiceRequests.length === 0 ? (
            <p className="subtle" style={{ fontSize: 14 }}>
              {ar ? "لا توجد طلبات خدمات قيد المراجعة." : "No pending service requests."}
            </p>
          ) : (
            <ul className="list-stack">
              {recentServiceRequests.map((s) => (
                <li key={s.id} className="list-item">
                  <div>
                    <div className="list-title">{displayServiceName(s.name, ar)}</div>
                    <div className="list-sub">#{s.id}</div>
                  </div>
                  <div className="list-meta">
                    <span className="status-pill">
                      {serviceStatusLabels[s.status]?.[ar ? "ar" : "en"] || s.status}
                    </span>
                    <div className="list-sub xsmall">{formatServiceDate(s.updated_at, ar)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-head">
            <h3 className="card-title">{ar ? "أحدث طلبات الفعاليات" : "Recent Event Requests"}</h3>
            <Link className="link-primary small" to="/vendor-dashboard/event-requests">
              {ar ? "عرض الكل" : "View all"}
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="subtle" style={{ fontSize: 14 }}>
              {ar ? "لا توجد طلبات فعاليات قيد الانتظار." : "No pending event requests."}
            </p>
          ) : (
            <ul className="list-stack">
              {recentOrders.map((o) => (
                <li key={o.id} className="list-item">
                  <div>
                    <div className="list-title">{displayOrderText(o.service?.name, ar, ar ? "خدمة بدون اسم" : "Unnamed service")}</div>
                    <div className="list-sub">{o.event?.customer?.name || "-"} · #{o.event_id}</div>
                  </div>
                  <div className="list-meta">
                    <span className="status-pill">
                      {vendorOrderStatusLabels[o.status]?.[ar ? "ar" : "en"] || o.status}
                    </span>
                    <div className="list-sub xsmall">{formatEventDate(o.event?.date, ar)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
