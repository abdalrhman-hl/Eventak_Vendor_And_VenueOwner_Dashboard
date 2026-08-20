import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building, Calendar, DollarSign, MapPin, Pencil, Star, Trash2, Users } from "lucide-react";
import { DeleteRequestDialog } from "./MyVenues.jsx";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import { useLanguage } from "../lib/language.jsx";
import { fetchVenueRatings, formatRatingDate, formatRatingValue } from "../lib/venueRatings.js";
import { deleteVenueRequest, displayVenueAddress, displayVenueDescription, displayVenueName, fetchMyVenues, formatDate, formatPrice, setVenueFlash, VENUE_STATUS_LABEL } from "../lib/venues.js";

function StarRating({ value, size = 16 }) {
  const filled = Math.round(Number(value) || 0);
  return <div style={{ display: "flex", alignItems: "center", gap: 2 }}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={size} style={{ color: index < filled ? "var(--primary)" : "var(--muted-foreground)", fill: index < filled ? "currentColor" : "none" }} />)}</div>;
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted-foreground)", fontSize: 14 }}>{Icon && <Icon size={14} />}<span>{label}</span></div>
      <div style={{ fontWeight: 600, fontSize: 14, textAlign: "end" }}>{value}</div>
    </div>
  );
}

export default function VenueDetails() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ar = language === "ar";
  const BackIcon = ar ? ArrowRight : ArrowLeft;
  const [venue, setVenue] = useState(null);
  const [ratings, setRatings] = useState({ average_rating: 0, ratings_count: 0, ratings: [] });
  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [error, setError] = useState("");
  const [ratingsError, setRatingsError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const token = getAuthToken();
    if (!token) {
      clearAuthSession();
      navigate("/account-type", { replace: true });
      return () => controller.abort();
    }
    fetchMyVenues(token, controller.signal)
      .then(async (payload) => {
        const selected = payload.data.find((item) => String(item.id) === String(venueId)) || null;
        setVenue(selected);
        if (!selected) return;
        setRatingsLoading(true);
        try {
          const ratingPayload = await fetchVenueRatings(selected.id, controller.signal);
          setRatings(ratingPayload.data);
        } catch (ratingError) {
          if (ratingError?.name !== "AbortError") setRatingsError(getApiErrorMessage(ratingError, language));
        } finally { setRatingsLoading(false); }
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
  }, [language, navigate, venueId]);

  const confirmDelete = async () => {
    if (!venue || deleting) return;
    setDeleting(true);
    setError("");
    try {
      const payload = await deleteVenueRequest(getAuthToken(), venue.id);
      setVenueFlash(payload.message || (ar ? "تم إرسال طلب الحذف وهو بانتظار مراجعة الإدارة." : "Delete request submitted and is pending Admin review."));
      navigate("/venue-dashboard/venue-requests");
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

  if (loading) return <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>{ar ? "جاري تحميل الصالة..." : "Loading venue..."}</div>;
  if (!venue) return (
    <div><div className="mb-6"><h1 className="heading-xl">{ar ? "تفاصيل الصالة" : "Venue Details"}</h1></div>
      <div className="dashboard-card"><p style={{ color: error ? "#b91c1c" : "var(--muted-foreground)" }}>{error || (ar ? "لم يتم العثور على الصالة ضمن صالاتك." : "Venue was not found in your venues.")}</p>
        <button type="button" onClick={() => navigate("/venue-dashboard/my-venues")} className="btn-venue" style={{ marginTop: 16 }}><BackIcon size={16} /><span>{ar ? "العودة إلى صالاتي" : "Back to My Venues"}</span></button>
      </div></div>
  );

  const average = Number(ratings.average_rating) || 0;
  const count = Number(ratings.ratings_count) || 0;

  return (
    <div>
      <div className="mb-6" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
        <div><h1 className="heading-xl">{ar ? "تفاصيل الصالة" : "Venue Details"}</h1><p className="mt-2 subtle">#{venue.id}</p></div>
        <button type="button" onClick={() => navigate("/venue-dashboard/my-venues")} className="btn-venue"><BackIcon size={16} /><span>{ar ? "العودة إلى صالاتي" : "Back to My Venues"}</span></button>
      </div>
      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}
      <div className="dashboard-card" style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}>
        {venue.cover_image_url ? <img src={venue.cover_image_url} alt={displayVenueName(venue.name, ar)} style={{ width: "100%", height: 260, objectFit: "cover" }} /> : <div aria-label={ar ? "صورة الغلاف" : "Cover Image"} style={{ height: 220, background: "var(--muted)", color: "var(--muted-foreground)", display: "flex", alignItems: "center", justifyContent: "center" }}><Building size={36} /></div>}
      </div>
      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, fontSize: 16, fontWeight: 700 }}><Building size={18} color="var(--primary)" /><span>{ar ? "نظرة عامة" : "Overview"}</span></div>
        <DetailRow label={ar ? "اسم الصالة" : "Venue Name"} value={displayVenueName(venue.name, ar)} />
        <DetailRow label={ar ? "السعة" : "Capacity"} value={`${venue.capacity ?? "-"} ${ar ? "ضيف" : "guests"}`} icon={Users} />
        <DetailRow label={ar ? "السعر" : "Price"} value={formatPrice(venue.price)} icon={DollarSign} />
        <DetailRow label={ar ? "العنوان" : "Address"} value={displayVenueAddress(venue.address, ar)} icon={MapPin} />
        <DetailRow label={ar ? "تاريخ الإنشاء" : "Created Date"} value={formatDate(venue.created_at, ar)} icon={Calendar} />
        <DetailRow label={ar ? "الحالة" : "Status"} value={<span className={`status-badge ${venue.status === "active" ? "active" : "review"}`}>{VENUE_STATUS_LABEL[venue.status]?.[ar ? "ar" : "en"] || venue.status}</span>} />
      </div>
      <div className="dashboard-card" style={{ marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{ar ? "الوصف" : "Description"}</div><p style={{ fontSize: 14, lineHeight: 1.6 }}>{displayVenueDescription(venue.description, ar)}</p></div>
      <div className="dashboard-card" style={{ marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{ar ? "معرض الصور" : "Image Gallery"}</div>
        {venue.images_urls?.length ? <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>{venue.images_urls.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`${displayVenueName(venue.name, ar)} ${index + 1}`} loading="lazy" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }} />)}</div> : <p className="subtle" style={{ fontSize: 14 }}>{ar ? "لا توجد صور إضافية." : "No additional images."}</p>}
      </div>
      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{ar ? "تقييمات الصالة" : "Venue Ratings"}</div>
        <p className="subtle" style={{ fontSize: 14, marginBottom: 16 }}>{ar ? "آراء الزبائن حول هذه الصالة." : "Customer feedback for this venue."}</p>
        {ratingsLoading ? <div style={{ textAlign: "center", padding: 24 }}>{ar ? "جاري تحميل التقييمات..." : "Loading ratings..."}</div> : ratingsError ? <div role="alert" style={{ color: "#b91c1c", padding: "12px 0" }}>{ratingsError}</div> : count === 0 || ratings.ratings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}><div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--muted)", color: "var(--muted-foreground)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Star size={24} /></div><div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{ar ? "لا توجد تقييمات حتى الآن." : "No ratings yet."}</div></div>
        ) : <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start", marginBottom: 20, padding: 16, background: "var(--muted)", borderRadius: 12 }}>
            <div><div className="subtle" style={{ fontSize: 13 }}>{ar ? "متوسط التقييم" : "Average Rating"}</div><div style={{ fontSize: 28, fontWeight: 700 }}>{average.toFixed(1)} <span className="subtle" style={{ fontSize: 14 }}>/ 5</span></div><StarRating value={average} size={18} /></div>
            <div><div className="subtle" style={{ fontSize: 13 }}>{ar ? "عدد التقييمات" : "Ratings Count"}</div><div style={{ fontSize: 28, fontWeight: 700 }}>{count}</div></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{ratings.ratings.map((rating, index) => <div key={`${rating.customer_name}-${rating.created_at}-${index}`} style={{ paddingBottom: 16, borderBottom: index === ratings.ratings.length - 1 ? "none" : "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><div className="subtle" style={{ fontSize: 12 }}>{ar ? "الزبون" : "Customer"}</div><strong>{rating.customer_name || (ar ? "اسم الزبون غير متاح" : "Customer name unavailable")}</strong></div><div><StarRating value={rating.rating} size={14} /><span style={{ fontSize: 13 }}>{formatRatingValue(rating.rating)}</span></div></div>
            <p style={{ marginTop: 10, fontSize: 14 }}>{rating.comment || (ar ? "لا يوجد تعليق." : "No comment provided.")}</p><div className="subtle" style={{ marginTop: 8, fontSize: 12 }}>{formatRatingDate(rating.created_at, ar)}</div>
          </div>)}</div>
        </>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button type="button" className="btn-venue" onClick={() => navigate(`/venue-dashboard/my-venues/${venue.id}/edit`)}><Pencil size={16} /><span>{ar ? "إرسال طلب تعديل" : "Submit Update Request"}</span></button>
        <button type="button" className="btn-venue" onClick={() => setConfirmOpen(true)} style={{ background: "transparent", color: "#dc2626", border: "1px solid #dc2626" }}><Trash2 size={16} /><span>{ar ? "طلب حذف الصالة" : "Request Delete Venue"}</span></button>
      </div>
      <DeleteRequestDialog venue={confirmOpen ? venue : null} ar={ar} onCancel={() => !deleting && setConfirmOpen(false)} onConfirm={confirmDelete} isSubmitting={deleting} />
    </div>
  );
}
