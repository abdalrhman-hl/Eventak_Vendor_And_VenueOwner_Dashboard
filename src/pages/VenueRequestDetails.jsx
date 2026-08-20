import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building, Calendar, DollarSign, FileText, Hash, MapPin, Users } from "lucide-react";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import { useLanguage } from "../lib/language.jsx";
import { displayVenueAddress, displayVenueDescription, displayVenueName, fetchVenueRequests, formatDate, formatPrice, REQUEST_TYPE_LABEL, VENUE_STATUS_LABEL } from "../lib/venues.js";

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted-foreground)", fontSize: 14 }}>{Icon && <Icon size={14} />}<span>{label}</span></div>
      <div style={{ fontWeight: 600, fontSize: 14, textAlign: "end" }}>{value}</div>
    </div>
  );
}

export default function VenueRequestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ar = language === "ar";
  const BackIcon = ar ? ArrowRight : ArrowLeft;
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const backLabel = ar ? "العودة إلى طلبات الصالات" : "Back to Venue Requests";

  useEffect(() => {
    const controller = new AbortController();
    const token = getAuthToken();
    if (!token) {
      clearAuthSession();
      navigate("/account-type", { replace: true });
      return () => controller.abort();
    }
    fetchVenueRequests(token, controller.signal)
      .then((payload) => setRequest(payload.data.find((item) => String(item.id) === String(requestId)) || null))
      .catch((requestError) => {
        if (requestError?.name === "AbortError") return;
        if (requestError?.status === 401) {
          clearAuthSession();
          navigate("/account-type", { replace: true });
        } else setError(getApiErrorMessage(requestError, language));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [language, navigate, requestId]);

  if (loading) return <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>{ar ? "جاري تحميل الطلب..." : "Loading request..."}</div>;
  if (!request) return (
    <div><div className="mb-6"><h1 className="heading-xl">{ar ? "تفاصيل طلب الصالة" : "Venue Request Details"}</h1></div>
      <div className="dashboard-card"><p style={{ color: error ? "#b91c1c" : "var(--muted-foreground)" }}>{error || (ar ? "لم يتم العثور على الطلب ضمن طلباتك المعلقة." : "Request was not found in your pending requests.")}</p>
        <button type="button" onClick={() => navigate("/venue-dashboard/venue-requests")} className="btn-venue" style={{ marginTop: 16 }}><BackIcon size={16} /><span>{backLabel}</span></button>
      </div></div>
  );

  return (
    <div>
      <div className="mb-6" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
        <div><h1 className="heading-xl">{ar ? "تفاصيل طلب الصالة" : "Venue Request Details"}</h1><p className="mt-2 subtle">#{request.id}</p></div>
        <button type="button" onClick={() => navigate("/venue-dashboard/venue-requests")} className="btn-venue"><BackIcon size={16} /><span>{backLabel}</span></button>
      </div>
      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <DetailRow label={ar ? "رقم الطلب" : "Request ID"} value={`#${request.id}`} icon={Hash} />
        <DetailRow label={ar ? "نوع الطلب" : "Request Type"} value={REQUEST_TYPE_LABEL[request.type]?.[ar ? "ar" : "en"] || request.type} icon={FileText} />
        {request.venue_id != null && <DetailRow label={ar ? "رقم الصالة" : "Venue ID"} value={`#${request.venue_id}`} icon={Hash} />}
        <DetailRow label={ar ? "اسم الصالة" : "Venue Name"} value={displayVenueName(request.name, ar)} icon={Building} />
        <DetailRow label={ar ? "السعة" : "Capacity"} value={`${request.capacity ?? "-"} ${ar ? "ضيف" : "guests"}`} icon={Users} />
        <DetailRow label={ar ? "السعر" : "Price"} value={formatPrice(request.price)} icon={DollarSign} />
        <DetailRow label={ar ? "العنوان" : "Address"} value={displayVenueAddress(request.address, ar)} icon={MapPin} />
        <DetailRow label={ar ? "تاريخ الإرسال" : "Submitted Date"} value={formatDate(request.created_at, ar)} icon={Calendar} />
        <DetailRow label={ar ? "الحالة" : "Status"} value={<span className="status-badge review">{VENUE_STATUS_LABEL[request.status]?.[ar ? "ar" : "en"] || request.status}</span>} />
      </div>
      <div className="dashboard-card" style={{ marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{ar ? "الوصف" : "Description"}</div><p style={{ fontSize: 14, lineHeight: 1.6 }}>{displayVenueDescription(request.description, ar)}</p></div>
      <div className="dashboard-card" style={{ marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{ar ? "صورة الغلاف" : "Cover Image"}</div>
        {request.cover_image_url ? <img src={request.cover_image_url} alt={displayVenueName(request.name, ar)} style={{ width: "100%", maxWidth: 360, height: 200, objectFit: "cover", borderRadius: 12 }} /> : <p className="subtle" style={{ fontSize: 14 }}>{ar ? "لا توجد صورة غلاف." : "No cover image."}</p>}
      </div>
      <div className="dashboard-card"><div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{ar ? "صور إضافية" : "Additional Images"}</div>
        {request.images_urls?.length ? <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>{request.images_urls.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`${displayVenueName(request.name, ar)} ${index + 1}`} loading="lazy" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }} />)}</div> : <p className="subtle" style={{ fontSize: 14 }}>{ar ? "لا توجد صور إضافية." : "No additional images."}</p>}
      </div>
    </div>
  );
}
