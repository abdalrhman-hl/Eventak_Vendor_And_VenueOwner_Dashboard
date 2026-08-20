import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import ConfirmDeleteServiceDialog from "../components/ConfirmDeleteServiceDialog.jsx";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import {
  fetchVendorServices,
  requestDeleteVendorService,
  serviceStatusLabels,
  serviceStatusClass,
  canModifyService,
  categoryName,
  displayServiceDescription,
  displayServiceName,
  formatServiceDate,
  formatPrice,
} from "../lib/vendorServices.js";

function Row({ label, value }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", gap: 16, padding: "12px 0",
      borderBottom: "1px solid var(--border)", flexWrap: "wrap",
    }}>
      <div style={{ color: "var(--muted-foreground)", fontSize: 14 }}>{label}</div>
      <div style={{ fontWeight: 600, textAlign: "end" }}>{value}</div>
    </div>
  );
}

export default function ServiceDetails() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const token = getAuthToken();
    if (!token) {
      clearAuthSession();
      navigate("/account-type", { replace: true });
      return () => controller.abort();
    }
    fetchVendorServices(token, controller.signal)
      .then((payload) => setService(payload.data.find((item) => String(item.id) === String(serviceId)) || null))
      .catch((requestError) => {
        if (requestError?.name === "AbortError") return;
        if (requestError?.status === 401) {
          clearAuthSession();
          navigate("/account-type", { replace: true });
        } else setError(getApiErrorMessage(requestError, language));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [language, navigate, serviceId]);

  const BackIcon = ar ? ArrowRight : ArrowLeft;

  if (loading) {
    return <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>{ar ? "جاري تحميل الخدمة..." : "Loading service..."}</div>;
  }

  if (!service) {
    return (
      <div>
        <h1 className="heading-xl">{ar ? "تفاصيل الخدمة" : "Service Details"}</h1>
        <div className="dashboard-card" style={{ marginTop: 16 }}>
          <p className="subtle">{error || (ar ? "لم يتم العثور على الخدمة." : "Service not found.")}</p>
          <Link to="/vendor-dashboard/my-services" className="btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            {ar ? "العودة إلى خدماتي" : "Back to My Services"}
          </Link>
        </div>
      </div>
    );
  }

  const confirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setError("");
    try {
      const payload = await requestDeleteVendorService(getAuthToken(), service.id);
      setConfirmOpen(false);
      navigate("/vendor-dashboard/service-requests", {
        state: { flash: payload.message || (ar
          ? "تم إرسال طلب الحذف بنجاح وهو بانتظار مراجعة الإدارة."
          : "Delete request submitted successfully and is pending Admin review.") },
      });
    } catch (requestError) {
      if (requestError?.status === 401) {
        clearAuthSession();
        navigate("/account-type", { replace: true });
      } else {
        setError(getApiErrorMessage(requestError, language));
        setConfirmOpen(false);
      }
    } finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="mb-6" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="heading-xl">{ar ? "تفاصيل الخدمة" : "Service Details"}</h1>
          <p className="mt-2 subtle">#{service.id}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/vendor-dashboard/my-services")}
          className="btn-venue"
          style={{ alignSelf: "flex-start" }}
        >
          <BackIcon size={16} />
          <span>{ar ? "العودة إلى خدماتي" : "Back to My Services"}</span>
        </button>
      </div>

      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}

      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <Row label={ar ? "رقم الخدمة" : "Service ID"} value={`#${service.id}`} />
        <Row label={ar ? "اسم الخدمة" : "Service Name"} value={displayServiceName(service.name, ar)} />
        <Row label={ar ? "التصنيف" : "Category"} value={categoryName(service, ar)} />
        <Row label={ar ? "رقم التصنيف" : "Category ID"} value={service.category_id ?? "-"} />

        <Row label={ar ? "الوصف" : "Description"} value={displayServiceDescription(service.description, ar)} />
        <Row label={ar ? "السعر" : "Price"} value={formatPrice(service.price)} />
        <Row
          label={ar ? "الحالة" : "Status"}
          value={
            <span className={`status-badge ${serviceStatusClass[service.status]}`}>
              {serviceStatusLabels[service.status]?.[ar ? "ar" : "en"] || service.status}
            </span>
          }
        />
        <Row label={ar ? "تاريخ الإنشاء" : "Created Date"} value={formatServiceDate(service.created_at, ar)} />
        <Row label={ar ? "تاريخ التحديث" : "Updated Date"} value={formatServiceDate(service.updated_at, ar)} />
      </div>

      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{ar ? "الصور" : "Images"}</h3>
        {service.images?.length ? (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
            {service.images.map((url, i) => (
              <img
                key={`${url}-${i}`}
                src={url}
                alt={`${displayServiceName(service.name, ar)} ${i + 1}`}
                style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }}
              />
            ))}
          </div>
        ) : (
          <p className="subtle" style={{ fontSize: 14 }}>
            {ar ? "لا توجد صور لهذه الخدمة." : "No images for this service."}
          </p>
        )}
      </div>

      {canModifyService(service.status) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link
            to={`/vendor-dashboard/my-services/${service.id}/edit`}
            className="btn-primary"
            style={{ width: "auto", padding: "10px 20px", textDecoration: "none" }}
          >
            <Pencil size={16} />
            <span>{ar ? "تعديل الخدمة" : "Edit Service"}</span>
          </Link>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="btn-venue"
            style={{ background: "transparent", color: "#dc2626", border: "1px solid rgba(220,38,38,.4)" }}
          >
            <Trash2 size={16} />
            <span>{ar ? "طلب حذف" : "Request Delete"}</span>
          </button>
        </div>
      )}

      <ConfirmDeleteServiceDialog
        open={confirmOpen}
        onCancel={() => !deleting && setConfirmOpen(false)}
        onConfirm={confirmDelete}
        isSubmitting={deleting}
      />
    </div>
  );
}
