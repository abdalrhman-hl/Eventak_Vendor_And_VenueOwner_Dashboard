import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, ClipboardList, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import {
  getVendorServices,
  subscribeVendorServices,
  serviceStatusLabels,
  serviceStatusClass,
  categoryName,
  formatServiceDate,
  formatPrice,
} from "../lib/vendorServices.js";

const FILTERS = [
  { key: "all", en: "All", ar: "الكل" },
  { key: "pending", en: "Pending Review", ar: "قيد المراجعة" },
  { key: "pending_delete", en: "Pending Delete", ar: "طلبات الحذف" },
];

export default function ServiceRequests() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const location = useLocation();
  const [filter, setFilter] = useState("all");
  const [, force] = useState(0);
  const [flash, setFlash] = useState(location.state?.flash || "");

  useEffect(() => subscribeVendorServices(() => force((n) => n + 1)), []);
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 5000);
    return () => clearTimeout(t);
  }, [flash]);

  // Derived from the Service model status — there is no separate requests table.
  const requests = getVendorServices().filter(
    (s) => s.status === "pending" || s.status === "pending_delete"
  );
  const visible = filter === "all" ? requests : requests.filter((s) => s.status === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "طلبات الخدمات" : "Service Requests"}</h1>
        <p className="mt-2 subtle">
          {ar
            ? "تابع الخدمات التي تنتظر مراجعة الإدارة."
            : "Track services waiting for Admin review."}
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
              style={{
                padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 999, cursor: "pointer",
                background: active ? "var(--primary)" : "transparent",
                color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
                fontSize: 13, fontWeight: 500,
              }}
            >
              {ar ? f.ar : f.en}
            </button>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>
          <ClipboardList size={32} color="var(--muted-foreground)" />
          <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>
            {ar ? "لا توجد طلبات خدمات قيد المراجعة." : "No pending service requests."}
          </h3>
          <p className="subtle" style={{ marginTop: 6 }}>
            {ar
              ? "ستظهر هنا الخدمات التي تنتظر مراجعة الإدارة."
              : "Services waiting for Admin review will appear here."}
          </p>
        </div>
      ) : (
        <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="vr-table">
              <thead>
                <tr>
                  <th>{ar ? "رقم الخدمة" : "Service ID"}</th>
                  <th>{ar ? "اسم الخدمة" : "Service Name"}</th>
                  <th>{ar ? "التصنيف" : "Category"}</th>
                  <th>{ar ? "السعر" : "Price"}</th>
                  <th>{ar ? "الحالة" : "Status"}</th>
                  <th>{ar ? "تاريخ التحديث" : "Updated Date"}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--muted-foreground)" }}>
                      {ar ? "لا توجد طلبات لعرضها." : "No requests to display."}
                    </td>
                  </tr>
                ) : (
                  visible.map((s) => (
                    <tr key={s.id}>
                      <td data-label={ar ? "رقم الخدمة" : "Service ID"}>#{s.id}</td>
                      <td data-label={ar ? "اسم الخدمة" : "Service Name"} style={{ fontWeight: 600 }}>{s.name}</td>
                      <td data-label={ar ? "التصنيف" : "Category"}>{categoryName(s)}</td>
                      <td data-label={ar ? "السعر" : "Price"}>{formatPrice(s.price)}</td>
                      <td data-label={ar ? "الحالة" : "Status"}>
                        <span className={`status-badge ${serviceStatusClass[s.status]}`}>
                          {serviceStatusLabels[s.status]?.[ar ? "ar" : "en"] || s.status}
                        </span>
                      </td>
                      <td data-label={ar ? "تاريخ التحديث" : "Updated Date"}>{formatServiceDate(s.updated_at, ar)}</td>
                      <td>
                        <Link
                          to={`/vendor-dashboard/my-services/${s.id}`}
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
