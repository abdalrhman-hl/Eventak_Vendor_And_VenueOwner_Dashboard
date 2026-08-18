import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, CheckCircle2, X } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import {
  getVenueRequests,
  takeVenueFlash,
  REQUEST_TYPE_LABEL,
  VENUE_STATUS_LABEL,
  formatDate,
  formatPrice,
} from "../lib/venues.js";

// GET /api/venue-owner/requests -> pending requests only.
export default function VenueRequests() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();
  const [flash, setFlash] = useState("");
  const requests = getVenueRequests();

  useEffect(() => {
    setFlash(takeVenueFlash());
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "طلبات الصالات" : "Venue Requests"}</h1>
        <p className="mt-2 subtle">
          {ar
            ? "تابع طلبات إضافة وتعديل وحذف الصالات قيد المراجعة."
            : "Track your pending venue create, update, and delete requests."}
        </p>
      </div>

      {flash && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            marginBottom: 16,
            borderRadius: 12,
            background: "color-mix(in srgb, var(--primary) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
            color: "var(--foreground)",
            fontSize: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={18} color="var(--primary)" />
            <span>{flash}</span>
          </div>
          <button
            type="button"
            onClick={() => setFlash("")}
            style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--muted-foreground)" }}
            aria-label={ar ? "إغلاق" : "Dismiss"}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="vr-table">
            <thead>
              <tr>
                <th>{ar ? "رقم الطلب" : "Request ID"}</th>
                <th>{ar ? "نوع الطلب" : "Request Type"}</th>
                <th>{ar ? "اسم الصالة" : "Venue Name"}</th>
                <th>{ar ? "السعة" : "Capacity"}</th>
                <th>{ar ? "السعر" : "Price"}</th>
                <th>{ar ? "العنوان" : "Address"}</th>
                <th>{ar ? "الحالة" : "Status"}</th>
                <th>{ar ? "تاريخ الإرسال" : "Submitted Date"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 32, color: "var(--muted-foreground)" }}>
                    {ar ? "لا توجد طلبات قيد المراجعة." : "No pending requests to display."}
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id}>
                    <td data-label={ar ? "رقم الطلب" : "Request ID"}>#{r.id}</td>
                    <td data-label={ar ? "نوع الطلب" : "Request Type"}>
                      {REQUEST_TYPE_LABEL[r.type]?.[ar ? "ar" : "en"] || r.type}
                    </td>
                    <td data-label={ar ? "اسم الصالة" : "Venue Name"} style={{ fontWeight: 600 }}>
                      {r.name}
                    </td>
                    <td data-label={ar ? "السعة" : "Capacity"}>{r.capacity}</td>
                    <td data-label={ar ? "السعر" : "Price"}>{formatPrice(r.price)}</td>
                    <td data-label={ar ? "العنوان" : "Address"}>{r.address}</td>
                    <td data-label={ar ? "الحالة" : "Status"}>
                      <span className="status-badge review">
                        {VENUE_STATUS_LABEL.pending[ar ? "ar" : "en"]}
                      </span>
                    </td>
                    <td data-label={ar ? "تاريخ الإرسال" : "Submitted Date"}>
                      {formatDate(r.created_at, ar)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-venue"
                        onClick={() => navigate(`/venue-dashboard/venue-requests/${r.id}`)}
                        style={{ padding: "8px 12px", fontSize: 13 }}
                      >
                        <Eye size={14} />
                        <span>{ar ? "عرض التفاصيل" : "View Details"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
