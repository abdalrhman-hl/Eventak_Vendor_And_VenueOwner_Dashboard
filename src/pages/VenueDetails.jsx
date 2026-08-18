import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Users,
  Building,
  DollarSign,
  Calendar,
  Pencil,
  Trash2,
  Star,
} from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import { DeleteRequestDialog } from "./MyVenues.jsx";
import {
  getVenueById,
  addVenueRequest,
  setVenueFlash,
  VENUE_STATUS_LABEL,
  formatDate,
  formatPrice,
} from "../lib/venues.js";
import { getVenueRatings, formatRatingDate } from "../lib/venueRatings.js";

export default function VenueDetails() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ar = language === "ar";
  const BackIcon = ar ? ArrowRight : ArrowLeft;
  const venue = getVenueById(venueId);
  const { average_rating, ratings_count, ratings } = getVenueRatings(venueId).data;
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!venue) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="heading-xl">{ar ? "تفاصيل الصالة" : "Venue Details"}</h1>
        </div>
        <div className="dashboard-card">
          <p style={{ color: "var(--muted-foreground)" }}>
            {ar ? "لم يتم العثور على الصالة." : "Venue not found."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/venue-dashboard/my-venues")}
            className="btn-venue"
            style={{ marginTop: 16 }}
          >
            <BackIcon size={16} />
            <span>{ar ? "العودة إلى صالاتي" : "Back to My Venues"}</span>
          </button>
        </div>
      </div>
    );
  }

  const confirmDelete = () => {
    setConfirmOpen(false);
    addVenueRequest({
      venue_id: venue.id,
      type: "delete",
      name: venue.name,
      capacity: venue.capacity,
      price: venue.price,
      address: venue.address,
      description: venue.description,
    });
    setVenueFlash(
      ar
        ? "تم إرسال طلب الحذف بنجاح وهو بانتظار مراجعة الإدارة."
        : "Delete request submitted successfully and is pending Admin review."
    );
    navigate("/venue-dashboard/venue-requests");
  };

  const StarRating = ({ value, size = 16 }) => {
    const filled = Math.round(value);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={size}
            style={{
              color: i < filled ? "var(--primary)" : "var(--muted-foreground)",
              fill: i < filled ? "currentColor" : "none",
            }}
          />
        ))}
      </div>
    );
  };

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
          <h1 className="heading-xl">{ar ? "تفاصيل الصالة" : "Venue Details"}</h1>
          <p className="mt-2 subtle">#{venue.id}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/venue-dashboard/my-venues")}
          className="btn-venue"
          style={{ alignSelf: "flex-start" }}
        >
          <BackIcon size={16} />
          <span>{ar ? "العودة إلى صالاتي" : "Back to My Venues"}</span>
        </button>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}>
        {venue.cover_image_url ? (
          <img
            src={venue.cover_image_url}
            alt={venue.name}
            style={{ width: "100%", height: 260, objectFit: "cover" }}
          />
        ) : (
          <div
            aria-label={ar ? "صورة الغلاف" : "Cover Image"}
            style={{
              height: 220,
              background: "var(--muted)",
              color: "var(--muted-foreground)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building size={36} />
          </div>
        )}
      </div>

      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
          <Building size={18} color="var(--primary)" />
          <span>{ar ? "نظرة عامة" : "Overview"}</span>
        </div>
        <DetailRow label={ar ? "اسم الصالة" : "Venue Name"} value={venue.name} />
        <DetailRow
          label={ar ? "السعة" : "Capacity"}
          value={`${venue.capacity} ${ar ? "ضيف" : "guests"}`}
          icon={Users}
        />
        <DetailRow label={ar ? "السعر" : "Price"} value={formatPrice(venue.price)} icon={DollarSign} />
        <DetailRow label={ar ? "العنوان" : "Address"} value={venue.address} icon={MapPin} />
        <DetailRow
          label={ar ? "تاريخ الإنشاء" : "Created Date"}
          value={formatDate(venue.created_at, ar)}
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
          <span className={`status-badge ${venue.status === "active" ? "active" : "review"}`}>
            {VENUE_STATUS_LABEL[venue.status]?.[ar ? "ar" : "en"] || venue.status}
          </span>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          {ar ? "الوصف" : "Description"}
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          {venue.description || (ar ? "لا يوجد وصف." : "No description.")}
        </p>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          {ar ? "معرض الصور" : "Image Gallery"}
        </div>
        {venue.images_urls?.length ? (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
            {venue.images_urls.map((url, i) => (
              <img
                key={url + i}
                src={url}
                alt={`${venue.name} ${i + 1}`}
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

      <div className="dashboard-card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
          {ar ? "تقييمات الصالة" : "Venue Ratings"}
        </div>
        <p className="subtle" style={{ fontSize: 14, marginBottom: 16 }}>
          {ar ? "آراء الزبائن حول هذه الصالة." : "Customer feedback for this venue."}
        </p>

        {ratings_count === 0 || ratings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "var(--muted)",
                color: "var(--muted-foreground)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Star size={24} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
              {ar ? "لا توجد تقييمات حتى الآن." : "No ratings yet."}
            </div>
            <p className="subtle" style={{ fontSize: 14 }}>
              {ar
                ? "ستظهر تقييمات الزبائن لهذه الصالة بعد الفعاليات المكتملة."
                : "Customer ratings for this venue will appear here after completed events."}
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 24,
                alignItems: "flex-start",
                marginBottom: 20,
                padding: 16,
                background: "var(--muted)",
                borderRadius: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 4 }}>
                  {ar ? "متوسط التقييم" : "Average Rating"}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                    {average_rating.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--muted-foreground)" }}>/ 5</span>
                </div>
                <StarRating value={average_rating} size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 4 }}>
                  {ar ? "عدد التقييمات" : "Ratings Count"}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>
                  {ratings_count}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                  {ar ? `${ratings_count} تقييم` : `${ratings_count} ratings`}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {ratings.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    paddingBottom: 16,
                    borderBottom:
                      idx === ratings.length - 1 ? "none" : "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "8px 16px",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 2 }}>
                        {ar ? "الزبون" : "Customer"}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{r.customer_name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 2 }}>
                        {ar ? "التقييم" : "Rating"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <StarRating value={r.rating} size={14} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{r.rating} / 5</span>
                      </div>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 2 }}>
                        {ar ? "التعليق" : "Comment"}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                        {r.comment || (ar ? "لا يوجد تعليق." : "No comment provided.")}
                      </div>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 2 }}>
                        {ar ? "التاريخ" : "Date"}
                      </div>
                      <div style={{ fontSize: 13 }}>{formatRatingDate(r.created_at, ar)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button
          type="button"
          className="btn-venue"
          onClick={() => navigate(`/venue-dashboard/my-venues/${venue.id}/edit`)}
        >
          <Pencil size={16} />
          <span>{ar ? "إرسال طلب تعديل" : "Submit Update Request"}</span>
        </button>
        <button
          type="button"
          className="btn-venue"
          onClick={() => setConfirmOpen(true)}
          style={{ background: "transparent", color: "#dc2626", border: "1px solid #dc2626" }}
        >
          <Trash2 size={16} />
          <span>{ar ? "طلب حذف الصالة" : "Request Delete Venue"}</span>
        </button>
      </div>

      <DeleteRequestDialog
        venue={confirmOpen ? venue : null}
        ar={ar}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
