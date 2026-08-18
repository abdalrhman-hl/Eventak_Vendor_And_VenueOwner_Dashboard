import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Users,
  Building,
  DollarSign,
  Calendar,
  FileText,
  Hash,
} from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import {
  getVenueRequestById,
  REQUEST_TYPE_LABEL,
  VENUE_STATUS_LABEL,
  formatDate,
  formatPrice,
} from "../lib/venues.js";

export default function VenueRequestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ar = language === "ar";
  const BackIcon = ar ? ArrowRight : ArrowLeft;
  const request = getVenueRequestById(requestId);
  const backLabel = ar ? "العودة إلى طلبات الصالات" : "Back to Venue Requests";

  if (!request) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="heading-xl">{ar ? "تفاصيل طلب الصالة" : "Venue Request Details"}</h1>
        </div>
        <div className="dashboard-card">
          <p style={{ color: "var(--muted-foreground)" }}>
            {ar ? "لم يتم العثور على الطلب." : "Request not found."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/venue-dashboard/venue-requests")}
            className="btn-venue"
            style={{ marginTop: 16 }}
          >
            <BackIcon size={16} />
            <span>{backLabel}</span>
          </button>
        </div>
      </div>
    );
  }

  const DetailRow = ({ label, value, icon: RowIcon }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted-foreground)", fontSize: 14 }}>
        {RowIcon && <RowIcon size={14} />}
        <span>{label}</span>
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, textAlign: "end" }}>{value}</div>
    </div>
  );

  return (
    <div>
      <div
        className="mb-6"
        style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}
      >
        <div>
          <h1 className="heading-xl">{ar ? "تفاصيل طلب الصالة" : "Venue Request Details"}</h1>
          <p className="mt-2 subtle">#{request.id}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/venue-dashboard/venue-requests")}
          className="btn-venue"
          style={{ alignSelf: "flex-start" }}
        >
          <BackIcon size={16} />
          <span>{backLabel}</span>
        </button>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <DetailRow label={ar ? "رقم الطلب" : "Request ID"} value={`#${request.id}`} icon={Hash} />
        <DetailRow
          label={ar ? "نوع الطلب" : "Request Type"}
          value={REQUEST_TYPE_LABEL[request.type]?.[ar ? "ar" : "en"] || request.type}
          icon={FileText}
        />
        {request.venue_id != null && (
          <DetailRow label={ar ? "رقم الصالة" : "Venue ID"} value={`#${request.venue_id}`} icon={Hash} />
        )}
        <DetailRow label={ar ? "اسم الصالة" : "Venue Name"} value={request.name} icon={Building} />
        <DetailRow
          label={ar ? "السعة" : "Capacity"}
          value={`${request.capacity} ${ar ? "ضيف" : "guests"}`}
          icon={Users}
        />
        <DetailRow label={ar ? "السعر" : "Price"} value={formatPrice(request.price)} icon={DollarSign} />
        <DetailRow label={ar ? "العنوان" : "Address"} value={request.address} icon={MapPin} />
        <DetailRow
          label={ar ? "تاريخ الإرسال" : "Submitted Date"}
          value={formatDate(request.created_at, ar)}
          icon={Calendar}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            paddingTop: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ color: "var(--muted-foreground)", fontSize: 14 }}>{ar ? "الحالة" : "Status"}</div>
          <span className="status-badge review">{VENUE_STATUS_LABEL.pending[ar ? "ar" : "en"]}</span>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{ar ? "الوصف" : "Description"}</div>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          {request.description || (ar ? "لا يوجد وصف." : "No description.")}
        </p>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          {ar ? "صورة الغلاف" : "Cover Image"}
        </div>
        {request.cover_image_url ? (
          <img
            src={request.cover_image_url}
            alt={request.name}
            style={{ width: "100%", maxWidth: 360, height: 200, objectFit: "cover", borderRadius: 12 }}
          />
        ) : (
          <p className="subtle" style={{ fontSize: 14 }}>
            {ar ? "لا توجد صورة غلاف." : "No cover image."}
          </p>
        )}
      </div>

      <div className="dashboard-card">
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          {ar ? "صور إضافية" : "Additional Images"}
        </div>
        {request.images_urls?.length ? (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
            {request.images_urls.map((url, i) => (
              <img
                key={url + i}
                src={url}
                alt={`${request.name} ${i + 1}`}
                loading="lazy"
                style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }}
              />
            ))}
          </div>
        ) : (
          <p className="subtle" style={{ fontSize: 14 }}>
            {ar ? "لا توجد صور إضافية." : "No additional images."}
          </p>
        )}
      </div>
    </div>
  );
}
