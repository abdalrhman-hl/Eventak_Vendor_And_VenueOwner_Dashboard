import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, CheckCircle2, Info, X } from "lucide-react";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import { useLanguage } from "../lib/language.jsx";
import {
  acceptVenueEvent, canRejectVenueEvent, completeVenueEvent, displayEventName, displayEventText, eventStatusClass,
  eventStatusLabels, fetchVenueEvents, formatEventDate, formatEventTime, rejectVenueEvent,
} from "../lib/venueEventRequests.js";
import { displayVenueName, formatPrice } from "../lib/venues.js";

function Row({ label, value }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}><div style={{ color: "var(--muted-foreground)", fontSize: 14 }}>{label}</div><div style={{ fontWeight: 600, textAlign: "end" }}>{value ?? "-"}</div></div>;
}

function Section({ title, children }) {
  return <div className="dashboard-card" style={{ marginBottom: 16 }}><h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</h3><div>{children}</div></div>;
}

export default function VenueEventRequestDetails() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { eventId } = useParams();
  const navigate = useNavigate();
  const BackIcon = ar ? ArrowRight : ArrowLeft;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [flash, setFlash] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRequestError = useCallback((requestError) => {
    if (requestError?.status === 401) {
      clearAuthSession();
      navigate("/account-type", { replace: true });
      return;
    }
    setError(getApiErrorMessage(requestError, language));
  }, [language, navigate]);

  const loadEvent = useCallback(async (signal) => {
    const payload = await fetchVenueEvents(getAuthToken(), signal);
    return payload.data.find((item) => String(item.id) === String(eventId)) || null;
  }, [eventId]);

  useEffect(() => {
    const controller = new AbortController();
    if (!getAuthToken()) {
      clearAuthSession();
      navigate("/account-type", { replace: true });
      return () => controller.abort();
    }
    loadEvent(controller.signal)
      .then(setEvent)
      .catch((requestError) => { if (requestError?.name !== "AbortError") handleRequestError(requestError); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [handleRequestError, loadEvent, navigate]);

  useEffect(() => {
    if (!flash) return undefined;
    const timer = setTimeout(() => setFlash(""), 5000);
    return () => clearTimeout(timer);
  }, [flash]);

  const closeDialog = () => {
    if (submitting) return;
    setDialog(null);
    setReason("");
    setReasonError("");
  };

  const runAction = async (action, successMessage) => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = await action();
      if (payload.data && typeof payload.data === "object") {
        setEvent((current) => ({
          ...current,
          ...payload.data,
          customer: payload.data.customer || current?.customer,
          venue: payload.data.venue || current?.venue,
        }));
      }
      setDialog(null);
      setReason("");
      setReasonError("");
      setFlash(payload.message || successMessage);
    } catch (requestError) {
      if (requestError?.errors?.rejection_reason?.[0]) setReasonError(requestError.errors.rejection_reason[0]);
      handleRequestError(requestError);
    } finally { setSubmitting(false); }
  };

  const confirmReject = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setReasonError(ar ? "يجب أن يكون سبب الرفض 5 أحرف على الأقل." : "Rejection reason must be at least 5 characters.");
      return;
    }
    if (trimmed.length > 1000) {
      setReasonError(ar ? "يجب ألا يتجاوز سبب الرفض 1000 حرف." : "Rejection reason must not exceed 1000 characters.");
      return;
    }
    runAction(() => rejectVenueEvent(getAuthToken(), event.id, trimmed), ar ? "تم رفض طلب الحجز." : "Booking request rejected successfully.");
  };

  if (loading) return <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>{ar ? "جاري تحميل الفعالية..." : "Loading event..."}</div>;
  if (!event) return (
    <div><div className="mb-6"><h1 className="heading-xl">{ar ? "تفاصيل طلب الفعالية" : "Event Request Details"}</h1></div><div className="dashboard-card"><p style={{ color: error ? "#b91c1c" : "var(--muted-foreground)" }}>{error || (ar ? "لم يتم العثور على الطلب ضمن فعاليات صالاتك." : "Request was not found in your venue events.")}</p><Link to="/venue-dashboard/event-requests" className="btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>{ar ? "العودة إلى طلبات الفعاليات" : "Back to Event Requests"}</Link></div></div>
  );

  const canAccept = event.status === "pending";
  const canReject = canRejectVenueEvent(event.status);
  const canComplete = event.status === "paid";
  const hasActions = canAccept || canReject || canComplete;
  const dialogTitle = dialog === "accept" ? (ar ? "قبول طلب الحجز" : "Accept Booking Request") : dialog === "reject" ? (ar ? "رفض الطلب" : "Reject Request") : (ar ? "إكمال الفعالية" : "Complete Event");

  return (
    <div>
      <div className="mb-6" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div><h1 className="heading-xl">{ar ? "تفاصيل طلب الفعالية" : "Event Request Details"}</h1><p className="mt-2 subtle">#{event.id}</p></div>
        <button type="button" onClick={() => navigate("/venue-dashboard/event-requests")} className="btn-venue"><BackIcon size={16} /><span>{ar ? "العودة إلى طلبات الفعاليات" : "Back to Event Requests"}</span></button>
      </div>
      {flash && <div role="status" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(16, 185, 129, 0.1)", color: "#047857", border: "1px solid rgba(16, 185, 129, 0.3)", marginBottom: 16, fontSize: 14, fontWeight: 500 }}><CheckCircle2 size={18} /><span>{flash}</span></div>}
      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}
      <Section title={ar ? "معلومات الفعالية" : "Event Information"}>
        <Row label={ar ? "رقم الفعالية" : "Event ID"} value={`#${event.id}`} /><Row label={ar ? "اسم الفعالية" : "Event Name"} value={displayEventName(event.event_name, ar)} /><Row label={ar ? "نوع الفعالية" : "Event Type"} value={displayEventText(event.event_type, ar)} /><Row label={ar ? "التاريخ" : "Date"} value={formatEventDate(event.date, ar)} /><Row label={ar ? "وقت البداية" : "Start Time"} value={formatEventTime(event.start_time, ar)} /><Row label={ar ? "وقت النهاية" : "End Time"} value={formatEventTime(event.end_time, ar)} /><Row label={ar ? "عدد الضيوف" : "Guests Count"} value={event.guests_count ?? "-"} /><Row label={ar ? "السعر الإجمالي" : "Total Price"} value={formatPrice(event.total_price)} /><Row label={ar ? "ملاحظة" : "Note"} value={displayEventText(event.note, ar, ar ? "لا يوجد" : "None")} /><Row label={ar ? "الحالة" : "Status"} value={<span className={`status-badge ${eventStatusClass[event.status] || "review"}`}>{eventStatusLabels[event.status]?.[ar ? "ar" : "en"] || event.status || "-"}</span>} />
        {event.status === "cancelled" && event.rejection_reason && <Row label={ar ? "سبب الرفض أو الإلغاء" : "Rejection Reason"} value={event.rejection_reason} />}
      </Section>
      <Section title={ar ? "معلومات الزبون" : "Customer Information"}><Row label={ar ? "اسم الزبون" : "Customer Name"} value={event.customer?.name} /><Row label={ar ? "بريد الزبون" : "Customer Email"} value={<span style={{ direction: "ltr" }}>{event.customer?.email || "-"}</span>} /><Row label={ar ? "رقم الزبون" : "Customer Phone"} value={<span style={{ direction: "ltr" }}>{event.customer?.phone || "-"}</span>} /></Section>
      <Section title={ar ? "معلومات الصالة" : "Venue Information"}><Row label={ar ? "اسم الصالة" : "Venue Name"} value={displayVenueName(event.venue?.name, ar)} /></Section>
      {hasActions ? <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {canAccept && <button type="button" disabled={submitting} onClick={() => setDialog("accept")} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Check size={16} /><span>{ar ? "قبول الطلب" : "Accept Request"}</span></button>}
        {canComplete && <button type="button" disabled={submitting} onClick={() => setDialog("complete")} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><BadgeCheck size={16} /><span>{ar ? "تعليم كمكتمل" : "Mark as Completed"}</span></button>}
        {canReject && <button type="button" disabled={submitting} onClick={() => setDialog("reject")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(239,68,68,.4)", background: "rgba(239,68,68,.08)", color: "#b91c1c", fontWeight: 600, cursor: "pointer" }}><X size={16} /><span>{ar ? "رفض الطلب" : "Reject Request"}</span></button>}
      </div> : <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 14 }}><Info size={16} /><span>{ar ? "لا توجد إجراءات متاحة لهذه الحالة." : "No actions available for this event status."}</span></div>}
      {dialog && <div role="dialog" aria-modal="true" onClick={closeDialog} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}><div onClick={(clickEvent) => clickEvent.stopPropagation()} className="dashboard-card" style={{ maxWidth: 480, width: "100%" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{dialogTitle}</h3>
        <p className="subtle" style={{ marginBottom: 16 }}>{dialog === "reject" ? (ar ? "يرجى إدخال سبب رفض طلب الحجز." : "Please provide a reason for rejecting this booking request.") : (ar ? "هل أنت متأكد من تنفيذ هذا الإجراء؟" : "Are you sure you want to perform this action?")}</p>
        {dialog === "accept" && <div style={{ display: "flex", gap: 8, padding: "10px 12px", borderRadius: 10, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.3)", fontSize: 13, marginBottom: 16 }}><Info size={16} /><span>{ar ? "قد يؤدي القبول إلى إلغاء الحجوزات المعلقة المتعارضة تلقائياً." : "Accepting may automatically cancel conflicting pending bookings."}</span></div>}
        {dialog === "reject" && <div style={{ marginBottom: 16 }}><label htmlFor="rejection_reason" style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{ar ? "سبب الرفض" : "Rejection Reason"} *</label><textarea id="rejection_reason" value={reason} onChange={(changeEvent) => { setReason(changeEvent.target.value); setReasonError(""); }} rows={4} maxLength={1000} aria-invalid={Boolean(reasonError)} className="input plain" style={{ width: "100%", resize: "vertical" }} />{reasonError && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 6 }}>{reasonError}</div>}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}><button type="button" disabled={submitting} onClick={closeDialog} className="btn-venue" style={{ background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}>{ar ? "إلغاء" : "Cancel"}</button>
          {dialog === "accept" && <button type="button" disabled={submitting} onClick={() => runAction(() => acceptVenueEvent(getAuthToken(), event.id), ar ? "تم قبول الحجز." : "Booking accepted successfully.")} className="btn-primary">{submitting ? (ar ? "جاري التنفيذ..." : "Working...") : (ar ? "تأكيد القبول" : "Confirm Accept")}</button>}
          {dialog === "complete" && <button type="button" disabled={submitting} onClick={() => runAction(() => completeVenueEvent(getAuthToken(), event.id), ar ? "تم تعليم الفعالية كمكتملة." : "Event marked as completed.")} className="btn-primary">{submitting ? (ar ? "جاري التنفيذ..." : "Working...") : (ar ? "تأكيد الإكمال" : "Confirm Complete")}</button>}
          {dialog === "reject" && <button type="button" disabled={submitting} onClick={confirmReject} className="btn-venue" style={{ background: "#dc2626" }}>{submitting ? (ar ? "جاري التنفيذ..." : "Working...") : (ar ? "تأكيد الرفض" : "Confirm Reject")}</button>}
        </div>
      </div></div>}
    </div>
  );
}
