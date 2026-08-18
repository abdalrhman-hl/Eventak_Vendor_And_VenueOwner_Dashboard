import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ClipboardList, CalendarCheck, Bell } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import {
  getVendorServices,
  subscribeVendorServices,
  serviceStatusLabels,
  formatServiceDate,
} from "../lib/vendorServices.js";
import {
  getVendorOrders,
  subscribeVendorOrders,
  vendorOrderStatusLabels,
  formatEventDate,
} from "../lib/vendorOrders.js";
import { mockUnreadCount } from "../lib/notifications.js";

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
  const [, force] = useState(0);

  useEffect(() => subscribeVendorServices(() => force((n) => n + 1)), []);
  useEffect(() => subscribeVendorOrders(() => force((n) => n + 1)), []);

  const services = getVendorServices();
  const orders = getVendorOrders();

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
    {
      icon: Bell,
      label: ar ? "الإشعارات غير المقروءة" : "Unread Notifications",
      value: mockUnreadCount,
      accent: "linear-gradient(135deg,#ef4444,#dc2626)",
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
                    <div className="list-title">{s.name}</div>
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
                    <div className="list-title">{o.service?.name}</div>
                    <div className="list-sub">{o.customer?.name} · #{o.event_id}</div>
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
