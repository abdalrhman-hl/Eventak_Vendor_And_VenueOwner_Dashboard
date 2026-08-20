import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, CalendarClock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import {
  displayOrderText,
  fetchVendorOrders,
  vendorOrderStatusLabels,
  vendorOrderStatusClass,
  formatEventDate,
  formatEventTime,
} from "../lib/vendorOrders.js";
import { formatPrice } from "../lib/vendorServices.js";

export default function EventRequests() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const location = useLocation();
  const navigate = useNavigate();
  const [flash, setFlash] = useState(location.state?.flash || "");
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
    fetchVendorOrders(token, controller.signal)
      .then((payload) => setOrders(payload.data))
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
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 6000);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "طلبات الفعاليات" : "Event Requests"}</h1>
        <p className="mt-2 subtle">
          {ar
            ? "راجع طلبات خدمات الفعاليات المرتبطة بخدماتك."
            : "Review event service requests assigned to your services."}
        </p>
      </div>

      {flash && (
        <div role="status" style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10,
          background: "rgba(16, 185, 129, 0.1)", color: "#047857",
          border: "1px solid rgba(16, 185, 129, 0.3)", marginBottom: 12, fontSize: 14, fontWeight: 500,
        }}>
          <CheckCircle2 size={18} />
          <span>{flash}</span>
        </div>
      )}
      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <span
          style={{
            padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 999,
            background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500,
          }}
        >
          {ar ? "بانتظار القرار" : "Pending"}
        </span>
      </div>

      {loading ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>
          {ar ? "جاري تحميل طلبات الفعاليات..." : "Loading event requests..."}
        </div>
      ) : orders.length === 0 && !error ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>
          <CalendarClock size={32} color="var(--muted-foreground)" />
          <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>
            {ar ? "لا توجد طلبات خدمات فعاليات قيد الانتظار." : "No pending event service requests."}
          </h3>
          <p className="subtle" style={{ marginTop: 6 }}>
            {ar
              ? "ستظهر هنا طلبات خدمات الفعاليات المرتبطة بخدماتك."
              : "New event service requests assigned to your services will appear here."}
          </p>
        </div>
      ) : (
        <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="vr-table">
              <thead>
                <tr>
                  <th>{ar ? "رقم الطلب" : "Order ID"}</th>
                  <th>{ar ? "رقم الفعالية" : "Event ID"}</th>
                  <th>{ar ? "نوع الفعالية" : "Event Type"}</th>
                  <th>{ar ? "اسم الخدمة" : "Service Name"}</th>
                  <th>{ar ? "سعر الخدمة" : "Service Price"}</th>
                  <th>{ar ? "اسم الزبون" : "Customer Name"}</th>
                  <th>{ar ? "رقم الزبون" : "Customer Phone"}</th>
                  <th>{ar ? "اسم الصالة" : "Venue Name"}</th>
                  <th>{ar ? "عنوان الصالة" : "Venue Address"}</th>
                  <th>{ar ? "التاريخ" : "Date"}</th>
                  <th>{ar ? "وقت البداية" : "Start Time"}</th>
                  <th>{ar ? "وقت النهاية" : "End Time"}</th>
                  <th>{ar ? "حالة الخدمة" : "Service Status"}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td data-label={ar ? "رقم الطلب" : "Order ID"}>#{o.id}</td>
                    <td data-label={ar ? "رقم الفعالية" : "Event ID"}>#{o.event_id}</td>
                    <td data-label={ar ? "نوع الفعالية" : "Event Type"}>{displayOrderText(o.event?.event_type, ar)}</td>
                    <td data-label={ar ? "اسم الخدمة" : "Service Name"} style={{ fontWeight: 600 }}>{displayOrderText(o.service?.name, ar, ar ? "خدمة بدون اسم" : "Unnamed service")}</td>
                    <td data-label={ar ? "سعر الخدمة" : "Service Price"}>{formatPrice(o.service?.price)}</td>
                    <td data-label={ar ? "اسم الزبون" : "Customer Name"}>{o.event?.customer?.name || "-"}</td>
                    <td data-label={ar ? "رقم الزبون" : "Customer Phone"} style={{ direction: "ltr" }}>{o.event?.customer?.phone || "-"}</td>
                    <td data-label={ar ? "اسم الصالة" : "Venue Name"}>{displayOrderText(o.event?.venue?.name, ar)}</td>
                    <td data-label={ar ? "عنوان الصالة" : "Venue Address"}>{displayOrderText(o.event?.venue?.address, ar)}</td>
                    <td data-label={ar ? "التاريخ" : "Date"}>{formatEventDate(o.event?.date, ar)}</td>
                    <td data-label={ar ? "وقت البداية" : "Start Time"}>{formatEventTime(o.event?.start_time, ar)}</td>
                    <td data-label={ar ? "وقت النهاية" : "End Time"}>{formatEventTime(o.event?.end_time, ar)}</td>
                    <td data-label={ar ? "حالة الخدمة" : "Service Status"}>
                      <span className={`status-badge ${vendorOrderStatusClass[o.status]}`}>
                        {vendorOrderStatusLabels[o.status]?.[ar ? "ar" : "en"] || o.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/vendor-dashboard/event-requests/${o.id}`}
                        className="btn-venue"
                        style={{ padding: "8px 12px", fontSize: 13, textDecoration: "none" }}
                      >
                        <Eye size={14} />
                        <span>{ar ? "عرض التفاصيل" : "View Details"}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
