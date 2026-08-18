import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus, Package, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import ConfirmDeleteServiceDialog from "../components/ConfirmDeleteServiceDialog.jsx";
import {
  getVendorServices,
  subscribeVendorServices,
  requestDeleteVendorService,
  serviceStatusLabels,
  serviceStatusClass,
  canModifyService,
  categoryName,
  formatServiceDate,
  formatPrice,
} from "../lib/vendorServices.js";

const FILTERS = [
  { key: "all", en: "All", ar: "الكل" },
  { key: "active", en: "Active", ar: "نشطة" },
  { key: "pending", en: "Pending Review", ar: "قيد المراجعة" },
  { key: "pending_delete", en: "Pending Delete", ar: "طلبات الحذف" },
  { key: "inactive", en: "Inactive", ar: "غير نشطة" },
];

export default function MyServices() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [, force] = useState(0);
  const [flash, setFlash] = useState(location.state?.flash || "");

  useEffect(() => subscribeVendorServices(() => force((n) => n + 1)), []);
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  // GET /api/vendor/services (mock)
  const services = getVendorServices();
  const visible = filter === "all" ? services : services.filter((s) => s.status === filter);

  const confirmDelete = () => {
    const service = pendingDelete;
    setPendingDelete(null);
    requestDeleteVendorService(service.id);
    navigate("/vendor-dashboard/service-requests", {
      state: {
        flash: ar
          ? "تم إرسال طلب الحذف بنجاح وهو بانتظار مراجعة الإدارة."
          : "Delete request submitted successfully and is pending Admin review.",
      },
    });
  };

  return (
    <div>
      <div className="card-head mb-6" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="heading-xl">{ar ? "خدماتي" : "My Services"}</h1>
          <p className="mt-2 subtle">
            {ar
              ? "إدارة خدماتك وباقاتك المقدمة في Eventak."
              : "Manage your services and packages submitted to Eventak."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/vendor-dashboard/add-service")}
          className="btn-primary"
          style={{ width: "auto", padding: "10px 20px", flexShrink: 0 }}
        >
          <Plus size={16} />
          <span>{ar ? "إضافة خدمة" : "Add Service"}</span>
        </button>
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

      {services.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>
          <Package size={32} color="var(--muted-foreground)" />
          <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>
            {ar ? "لا توجد خدمات حتى الآن." : "No services yet."}
          </h3>
          <p className="subtle" style={{ marginTop: 6 }}>
            {ar
              ? "أضف خدمتك الأولى للبدء باستقبال طلبات الفعاليات."
              : "Add your first service to start receiving event requests."}
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
                  <th>{ar ? "تاريخ الإنشاء" : "Created Date"}</th>
                  <th>{ar ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--muted-foreground)" }}>
                      {ar ? "لا توجد خدمات لعرضها." : "No services to display."}
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
                      <td data-label={ar ? "تاريخ الإنشاء" : "Created Date"}>{formatServiceDate(s.created_at, ar)}</td>
                      <td data-label={ar ? "الإجراءات" : "Actions"}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          <Link
                            to={`/vendor-dashboard/my-services/${s.id}`}
                            className="btn-venue"
                            style={{ padding: "8px 12px", fontSize: 13, textDecoration: "none" }}
                          >
                            <Eye size={14} />
                            <span>{ar ? "عرض التفاصيل" : "View Details"}</span>
                          </Link>
                          {canModifyService(s.status) && (
                            <>
                              <Link
                                to={`/vendor-dashboard/my-services/${s.id}/edit`}
                                className="btn-venue"
                                style={{
                                  padding: "8px 12px", fontSize: 13, textDecoration: "none",
                                  background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)",
                                }}
                              >
                                <Pencil size={14} />
                                <span>{ar ? "تعديل الخدمة" : "Edit Service"}</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => setPendingDelete(s)}
                                className="btn-venue"
                                style={{
                                  padding: "8px 12px", fontSize: 13,
                                  background: "transparent", color: "#dc2626", border: "1px solid rgba(220,38,38,.4)",
                                }}
                              >
                                <Trash2 size={14} />
                                <span>{ar ? "طلب حذف" : "Request Delete"}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDeleteServiceDialog
        open={!!pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
