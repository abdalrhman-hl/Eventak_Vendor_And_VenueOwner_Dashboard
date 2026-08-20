import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, X } from "lucide-react";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import { useLanguage } from "../lib/language.jsx";
import {
  displayVenueAddress, displayVenueName, fetchVenueRequests, formatDate, formatPrice, REQUEST_TYPE_LABEL,
  takeVenueFlash, VENUE_STATUS_LABEL,
} from "../lib/venues.js";

export default function VenueRequests() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();
  const [flash, setFlash] = useState(() => takeVenueFlash());
  const [requests, setRequests] = useState([]);
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
    fetchVenueRequests(token, controller.signal)
      .then((payload) => setRequests(payload.data))
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "طلبات الصالات" : "Venue Requests"}</h1>
        <p className="mt-2 subtle">{ar ? "تابع طلبات إضافة وتعديل وحذف الصالات قيد المراجعة." : "Track your pending venue create, update, and delete requests."}</p>
      </div>
      {flash && (
        <div role="status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "color-mix(in srgb, var(--primary) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)", color: "var(--foreground)", fontSize: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><CheckCircle2 size={18} color="var(--primary)" /><span>{flash}</span></div>
          <button type="button" onClick={() => setFlash("")} style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--muted-foreground)" }} aria-label={ar ? "إغلاق" : "Dismiss"}><X size={16} /></button>
        </div>
      )}
      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}
      <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="vr-table">
            <thead><tr>
              <th>{ar ? "رقم الطلب" : "Request ID"}</th><th>{ar ? "نوع الطلب" : "Request Type"}</th>
              <th>{ar ? "اسم الصالة" : "Venue Name"}</th><th>{ar ? "السعة" : "Capacity"}</th>
              <th>{ar ? "السعر" : "Price"}</th><th>{ar ? "العنوان" : "Address"}</th>
              <th>{ar ? "الحالة" : "Status"}</th><th>{ar ? "تاريخ الإرسال" : "Submitted Date"}</th><th></th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 32 }}>{ar ? "جاري تحميل الطلبات..." : "Loading requests..."}</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 32, color: "var(--muted-foreground)" }}>{ar ? "لا توجد طلبات قيد المراجعة." : "No pending requests to display."}</td></tr>
              ) : requests.map((request) => (
                <tr key={request.id}>
                  <td>#{request.id}</td><td>{REQUEST_TYPE_LABEL[request.type]?.[ar ? "ar" : "en"] || request.type}</td>
                  <td style={{ fontWeight: 600 }}>{displayVenueName(request.name, ar)}</td><td>{request.capacity ?? "-"}</td>
                  <td>{formatPrice(request.price)}</td><td>{displayVenueAddress(request.address, ar)}</td>
                  <td><span className="status-badge review">{VENUE_STATUS_LABEL[request.status]?.[ar ? "ar" : "en"] || request.status}</span></td>
                  <td>{formatDate(request.created_at, ar)}</td>
                  <td><button type="button" className="btn-venue" onClick={() => navigate(`/venue-dashboard/venue-requests/${request.id}`)} style={{ padding: "8px 12px", fontSize: 13 }}><Eye size={14} /><span>{ar ? "عرض التفاصيل" : "View Details"}</span></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
