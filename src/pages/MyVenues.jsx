import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Users, Building, Eye, Plus, DollarSign, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import {
  getMyVenues,
  addVenueRequest,
  setVenueFlash,
  VENUE_STATUS_LABEL,
  formatPrice,
} from "../lib/venues.js";

function CoverImage({ venue, ar }) {
  if (venue.cover_image_url) {
    return (
      <img
        src={venue.cover_image_url}
        alt={venue.name}
        loading="lazy"
        style={{ width: "100%", height: 160, objectFit: "cover" }}
      />
    );
  }
  return (
    <div
      aria-label={ar ? "صورة الغلاف" : "Cover Image"}
      style={{
        height: 160,
        background: "var(--muted)",
        color: "var(--muted-foreground)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Building size={30} />
    </div>
  );
}

function VenueCard({ venue, ar, onRequestDelete }) {
  const navigate = useNavigate();
  const statusLabel = VENUE_STATUS_LABEL[venue.status]?.[ar ? "ar" : "en"] || venue.status;
  return (
    <div className="dashboard-card venue-card">
      <CoverImage venue={venue} ar={ar} />
      <div className="venue-body">
        <div className="venue-header">
          <h3 className="venue-name">{venue.name}</h3>
          <span className={`status-badge ${venue.status === "active" ? "active" : "review"}`}>
            {statusLabel}
          </span>
        </div>
        <div className="venue-meta">
          <div className="venue-meta-item">
            <Users size={14} />
            <span>
              {venue.capacity} {ar ? "ضيف" : "guests"}
            </span>
          </div>
          <div className="venue-meta-item">
            <DollarSign size={14} />
            <span>{formatPrice(venue.price)}</span>
          </div>
          <div className="venue-meta-item">
            <MapPin size={14} />
            <span>{venue.address}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            className="btn-venue"
            onClick={() => navigate(`/venue-dashboard/my-venues/${venue.id}`)}
            style={{ flex: "1 1 auto", padding: "8px 12px", fontSize: 13 }}
          >
            <Eye size={14} />
            <span>{ar ? "عرض التفاصيل" : "View Details"}</span>
          </button>
          <button
            type="button"
            className="btn-venue"
            onClick={() => navigate(`/venue-dashboard/my-venues/${venue.id}/edit`)}
            style={{
              flex: "1 1 auto",
              padding: "8px 12px",
              fontSize: 13,
              background: "transparent",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          >
            <Pencil size={14} />
            <span>{ar ? "تعديل" : "Edit"}</span>
          </button>
          <button
            type="button"
            className="btn-venue"
            onClick={() => onRequestDelete(venue)}
            style={{
              flex: "1 1 auto",
              padding: "8px 12px",
              fontSize: 13,
              background: "transparent",
              color: "#dc2626",
              border: "1px solid #dc2626",
            }}
          >
            <Trash2 size={14} />
            <span>{ar ? "طلب حذف" : "Request Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteRequestDialog({ venue, ar, onCancel, onConfirm }) {
  if (!venue) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 60,
      }}
    >
      <div
        className="dashboard-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, width: "100%" }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
          {ar ? "طلب حذف الصالة" : "Request Venue Deletion"}
        </h2>
        <p className="subtle" style={{ fontSize: 14, lineHeight: 1.6 }}>
          {ar
            ? "سيتم إرسال طلب حذف إلى الإدارة، وستبقى الصالة ظاهرة حتى تتم الموافقة."
            : "This will send a deletion request to Admin. The venue will remain visible until Admin approval."}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn-venue"
            style={{ background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            {ar ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-venue"
            style={{ background: "#dc2626" }}
          >
            {ar ? "تأكيد طلب الحذف" : "Confirm Delete Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ ar }) {
  return (
    <div className="dashboard-card" style={{ textAlign: "center", padding: "64px 24px" }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "var(--muted)",
          color: "var(--muted-foreground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <Building size={32} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
        {ar ? "لا توجد صالات متاحة حتى الآن" : "No venues available yet."}
      </h3>
      <p className="subtle" style={{ maxWidth: 400, margin: "0 auto" }}>
        {ar
          ? "ستظهر هنا الصالات المرتبطة بحسابك."
          : "Venues linked to your account will appear here."}
      </p>
    </div>
  );
}

export default function MyVenues() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();
  const venues = getMyVenues();
  const [pendingDelete, setPendingDelete] = useState(null);

  const confirmDelete = () => {
    const venue = pendingDelete;
    setPendingDelete(null);
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

  return (
    <div>
      <div
        className="mb-6"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="heading-xl">{ar ? "صالاتي" : "My Venues"}</h1>
          <p className="mt-2 subtle">
            {ar ? "إدارة الصالات التابعة لحسابك." : "Manage the venues owned by your account."}
          </p>
        </div>
        <Link to="/venue-dashboard/add-venue" className="btn-venue" style={{ minWidth: 160 }}>
          <Plus size={16} />
          <span>{ar ? "إضافة صالة" : "Add Venue"}</span>
        </Link>
      </div>

      {venues.length === 0 ? (
        <EmptyState ar={ar} />
      ) : (
        <div className="venue-grid">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} ar={ar} onRequestDelete={setPendingDelete} />
          ))}
        </div>
      )}

      <DeleteRequestDialog
        venue={pendingDelete}
        ar={ar}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
