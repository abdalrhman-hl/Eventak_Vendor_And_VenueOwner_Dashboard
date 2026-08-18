import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, Info, BadgeCheck } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import {
  getVenueEventRequestById,
  subscribeVenueEventRequests,
  updateVenueEventRequestStatus,
  eventStatusLabels,
  eventStatusClass,
  formatEventDate,
  formatEventTime,
} from "../lib/venueEventRequests.js";
import { formatPrice } from "../lib/venues.js";

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

function Section({ title, children }) {
  return (
    <div className="dashboard-card" style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default function VenueEventRequestDetails() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [, force] = useState(0);
  useEffect(() => subscribeVenueEventRequests(() => force((n) => n + 1)), []);

  const [dialog, setDialog] = useState(null); // "accept" | "reject" | "complete"
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 5000);
    return () => clearTimeout(t);
  }, [flash]);

  const event = getVenueEventRequestById(eventId);
  const BackIcon = ar ? ArrowRight : ArrowLeft;

  const closeDialog = () => { setDialog(null); setReason(""); setReasonError(""); };

  if (!event) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="heading-xl">{ar ? "تفاصيل طلب الفعالية" : "Event Request Details"}</h1>
        </div>
        <div className="dashboard-card">
          <p style={{ color: "var(--muted-foreground)" }}>
            {ar ? "لم يتم العثور على الطلب." : "Request not found."}
          </p>
          <Link to="/venue-dashboard/event-requests" className="btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            {ar ? "العودة إلى طلبات الفعاليات" : "Back to Event Requests"}
          </Link>
        </div>
      </div>
    );
  }

  const canAccept = event.status === "pending";
  const canReject = ["pending", "vendor_pending", "confirmed"].includes(event.status);
  const canComplete = event.status === "paid";
  const hasActions = canAccept || canReject || canComplete;

  // PUT /api/venue-owner/events/{id}/accept (mock)
  const confirmAccept = () => {
    if (event.has_services) {
      updateVenueEventRequestStatus(event.id, "vendor_pending");
      setFlash(ar
        ? "تم قبول الحجز وهو بانتظار موافقة الموردين."
        : "Booking accepted. Waiting for vendor approvals.");
    } else {
      updateVenueEventRequestStatus(event.id, "confirmed");
      setFlash(ar
        ? "تم قبول الحجز وتأكيده، وهو جاهز للدفع."
        : "Booking accepted and confirmed. It is ready for payment.");
    }
    closeDialog();
  };

  // PUT /api/venue-owner/events/{id}/reject (mock)
  const confirmReject = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError(ar ? "سبب الرفض مطلوب." : "Rejection reason is required.");
      return;
    }
    if (trimmed.length < 5) {
      setReasonError(ar ? "يجب أن يكون سبب الرفض 5 أحرف على الأقل." : "Rejection reason must be at least 5 characters.");
      return;
    }
    if (trimmed.length > 1000) {
      setReasonError(ar ? "يجب ألا يتجاوز سبب الرفض 1000 حرف." : "Rejection reason must not exceed 1000 characters.");
      return;
    }
    updateVenueEventRequestStatus(event.id, "cancelled", trimmed);
    closeDialog();
    setFlash(ar ? "تم رفض طلب الحجز بنجاح." : "Booking request rejected successfully.");
  };

  // PUT /api/venue-owner/events/{id}/complete (mock)
  const confirmComplete = () => {
    updateVenueEventRequestStatus(event.id, "completed");
    closeDialog();
    setFlash(ar ? "تم تعليم الفعالية كمكتملة بنجاح." : "Event marked as completed successfully.");
  };

  const dialogTitle = dialog === "accept"
    ? (ar ? "قبول طلب الحجز" : "Accept Booking Request")
    : dialog === "reject"
      ? (ar ? "رفض الطلب" : "Reject Request")
      : (ar ? "إكمال الفعالية" : "Complete Event");

  const dialogMessage = dialog === "accept"
    ? (ar ? "هل أنت متأكد أنك تريد قبول طلب الحجز؟" : "Are you sure you want to accept this booking request?")
    : dialog === "reject"
      ? (ar ? "يرجى إدخال سبب رفض طلب الحجز." : "Please provide a reason for rejecting this booking request.")
      : (ar
        ? "سيتم تعليم الفعالية كمكتملة، وسيتمكن الزبون من تقييم الفعالية بعد الإكمال."
        : "This action marks the event as completed. The customer will be able to rate the event after completion.");

  return (
    <div>
      <div className="mb-6" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="heading-xl">{ar ? "تفاصيل طلب الفعالية" : "Event Request Details"}</h1>
          <p className="mt-2 subtle">#{event.id}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/venue-dashboard/event-requests")}
          className="btn-venue"
          style={{ alignSelf: "flex-start" }}
        >
          <BackIcon size={16} />
          <span>{ar ? "العودة إلى طلبات الفعاليات" : "Back to Event Requests"}</span>
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

      <Section title={ar ? "معلومات الفعالية" : "Event Information"}>
        <Row label={ar ? "رقم الفعالية" : "Event ID"} value={`#${event.id}`} />
        <Row label={ar ? "اسم الفعالية" : "Event Name"} value={event.event_name} />
        <Row label={ar ? "نوع الفعالية" : "Event Type"} value={event.event_type} />
        <Row label={ar ? "التاريخ" : "Date"} value={formatEventDate(event.date, ar)} />
        <Row label={ar ? "وقت البداية" : "Start Time"} value={formatEventTime(event.start_time, ar)} />
        <Row label={ar ? "وقت النهاية" : "End Time"} value={formatEventTime(event.end_time, ar)} />
        <Row label={ar ? "عدد الضيوف" : "Guests Count"} value={event.guests_count} />
        <Row label={ar ? "السعر الإجمالي" : "Total Price"} value={formatPrice(event.total_price)} />
        <Row label={ar ? "ملاحظة" : "Note"} value={event.note || (ar ? "لا يوجد" : "None")} />
        <Row
          label={ar ? "الحالة" : "Status"}
          value={
            <span className={`status-badge ${eventStatusClass[event.status]}`}>
              {eventStatusLabels[event.status]?.[ar ? "ar" : "en"] || event.status}
            </span>
          }
        />
        {event.status === "cancelled" && event.rejection_reason && (
          <Row label={ar ? "سبب الرفض أو الإلغاء" : "Rejection Reason"} value={event.rejection_reason} />
        )}
      </Section>

      <Section title={ar ? "معلومات الزبون" : "Customer Information"}>
        <Row label={ar ? "اسم الزبون" : "Customer Name"} value={event.customer?.name} />
        <Row label={ar ? "بريد الزبون" : "Customer Email"} value={<span style={{ direction: "ltr" }}>{event.customer?.email}</span>} />
        <Row label={ar ? "رقم الزبون" : "Customer Phone"} value={<span style={{ direction: "ltr" }}>{event.customer?.phone}</span>} />
      </Section>

      <Section title={ar ? "معلومات الصالة" : "Venue Information"}>
        <Row label={ar ? "اسم الصالة" : "Venue Name"} value={event.venue?.name} />
      </Section>

      {hasActions ? (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {canAccept && (
            <button
              type="button"
              onClick={() => setDialog("accept")}
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Check size={16} />
              <span>{ar ? "قبول الطلب" : "Accept Request"}</span>
            </button>
          )}
          {canComplete && (
            <button
              type="button"
              onClick={() => setDialog("complete")}
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <BadgeCheck size={16} />
              <span>{ar ? "تعليم كمكتمل" : "Mark as Completed"}</span>
            </button>
          )}
          {canReject && (
            <button
              type="button"
              onClick={() => setDialog("reject")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 10,
                border: "1px solid rgba(239, 68, 68, 0.4)",
                background: "rgba(239, 68, 68, 0.08)",
                color: "#b91c1c", fontWeight: 600, cursor: "pointer",
              }}
            >
              <X size={16} />
              <span>{ar ? "رفض الطلب" : "Reject Request"}</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10,
          border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 14,
        }}>
          <Info size={16} />
          <span>{ar ? "لا توجد إجراءات متاحة لهذه الحالة." : "No actions available for this event status."}</span>
        </div>
      )}

      {dialog && (
        <div
          onClick={closeDialog}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 16,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} className="dashboard-card" style={{ maxWidth: 480, width: "100%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{dialogTitle}</h3>
            <p style={{ color: "var(--muted-foreground)", marginBottom: 16 }}>{dialogMessage}</p>

            {dialog === "accept" && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 10,
                background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "var(--foreground)", fontSize: 13, marginBottom: 16,
              }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  {ar
                    ? "قد يؤدي قبول هذا الحجز إلى إلغاء الحجوزات المعلقة المتضاربة لنفس الصالة والوقت تلقائيًا."
                    : "Accepting this booking may automatically cancel conflicting pending bookings for the same venue and time."}
                </span>
              </div>
            )}

            {dialog === "reject" && (
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="rejection_reason" style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                  {ar ? "سبب الرفض" : "Rejection Reason"}
                  <span style={{ color: "#dc2626" }}> *</span>
                </label>
                <textarea
                  id="rejection_reason"
                  name="rejection_reason"
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); if (reasonError) setReasonError(""); }}
                  rows={4}
                  maxLength={1000}
                  placeholder={ar ? "أدخل سبب رفض طلب الحجز." : "Enter the reason for rejecting this booking request."}
                  aria-invalid={!!reasonError}
                  style={{
                    width: "100%", padding: 10, borderRadius: 8,
                    border: `1px solid ${reasonError ? "#dc2626" : "var(--border)"}`,
                    background: "var(--background)", color: "var(--foreground)",
                    fontFamily: "inherit", fontSize: 14, resize: "vertical",
                  }}
                />
                {reasonError && (
                  <div style={{ color: "#dc2626", fontSize: 13, marginTop: 6 }}>{reasonError}</div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={closeDialog}
                style={{
                  padding: "10px 18px", borderRadius: 10,
                  border: "1px solid var(--border)", background: "transparent",
                  color: "var(--foreground)", fontWeight: 600, cursor: "pointer",
                }}
              >
                {ar ? "إلغاء" : "Cancel"}
              </button>
              {dialog === "accept" && (
                <button type="button" onClick={confirmAccept} className="btn-primary">
                  {ar ? "تأكيد القبول" : "Confirm Accept"}
                </button>
              )}
              {dialog === "complete" && (
                <button type="button" onClick={confirmComplete} className="btn-primary">
                  {ar ? "تأكيد الإكمال" : "Confirm Complete"}
                </button>
              )}
              {dialog === "reject" && (
                <button
                  type="button"
                  onClick={confirmReject}
                  style={{
                    padding: "10px 18px", borderRadius: 10, border: "none",
                    background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {ar ? "تأكيد الرفض" : "Confirm Reject"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
