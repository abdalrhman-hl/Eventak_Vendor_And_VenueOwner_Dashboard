import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import {
  getVendorOrderById,
  subscribeVendorOrders,
  updateVendorOrderStatus,
  vendorOrderStatusLabels,
  vendorOrderStatusClass,
  formatEventDate,
  formatEventTime,
} from "../lib/vendorOrders.js";
import { formatPrice } from "../lib/vendorServices.js";

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

export default function EventRequestDetails() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [, force] = useState(0);
  const [dialog, setDialog] = useState(null); // "accept" | "reject"
  useEffect(() => subscribeVendorOrders(() => force((n) => n + 1)), []);

  const order = getVendorOrderById(requestId);
  const BackIcon = ar ? ArrowRight : ArrowLeft;

  if (!order) {
    return (
      <div>
        <h1 className="heading-xl">{ar ? "تفاصيل طلب خدمة الفعالية" : "Event Service Request Details"}</h1>
        <div className="dashboard-card" style={{ marginTop: 16 }}>
          <p className="subtle">{ar ? "لم يتم العثور على الطلب." : "Request not found."}</p>
          <Link to="/vendor-dashboard/event-requests" className="btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            {ar ? "العودة إلى طلبات الفعاليات" : "Back to Event Requests"}
          </Link>
        </div>
      </div>
    );
  }

  const hasActions = order.status === "pending";

  // PUT /api/vendor/orders/{eventId}/services/{serviceId}/accept (mock)
  const confirmAccept = () => {
    updateVendorOrderStatus(order.id, "accepted");
    setDialog(null);
    navigate("/vendor-dashboard/event-requests", {
      state: {
        flash: ar ? "تم قبول طلب الخدمة بنجاح." : "Service request accepted successfully.",
        extraFlash: order.mock_all_vendor_services_accepted_after_accept
          ? (ar
            ? "تمت موافقة جميع الموردين على خدمات هذه الفعالية. قد تصبح الفعالية مؤكدة وجاهزة للدفع."
            : "All vendor services for this event are now accepted. The event may become confirmed and ready for payment.")
          : "",
      },
    });
  };

  // PUT /api/vendor/orders/{eventId}/services/{serviceId}/reject (mock)
  const confirmReject = () => {
    updateVendorOrderStatus(order.id, "rejected");
    setDialog(null);
    navigate("/vendor-dashboard/event-requests", {
      state: {
        flash: ar
          ? "تم رفض طلب الخدمة وتم إلغاء الفعالية المرتبطة بها."
          : "Service request rejected. The related event has been cancelled.",
      },
    });
  };

  return (
    <div>
      <div className="mb-6" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="heading-xl">{ar ? "تفاصيل طلب خدمة الفعالية" : "Event Service Request Details"}</h1>
          <p className="mt-2 subtle">#{order.id}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/vendor-dashboard/event-requests")}
          className="btn-venue"
          style={{ alignSelf: "flex-start" }}
        >
          <BackIcon size={16} />
          <span>{ar ? "العودة إلى طلبات الفعاليات" : "Back to Event Requests"}</span>
        </button>
      </div>

      <Section title={ar ? "معلومات الفعالية" : "Event Information"}>
        <Row label={ar ? "رقم الفعالية" : "Event ID"} value={`#${order.event_id}`} />
        <Row label={ar ? "نوع الفعالية" : "Event Type"} value={order.event?.event_type} />
        <Row label={ar ? "التاريخ" : "Date"} value={formatEventDate(order.event?.date, ar)} />
        <Row label={ar ? "وقت البداية" : "Start Time"} value={formatEventTime(order.event?.start_time, ar)} />
        <Row label={ar ? "وقت النهاية" : "End Time"} value={formatEventTime(order.event?.end_time, ar)} />
      </Section>

      <Section title={ar ? "معلومات الخدمة المطلوبة" : "Requested Service Information"}>
        <Row label={ar ? "رقم الخدمة" : "Service ID"} value={`#${order.service?.id}`} />
        <Row label={ar ? "اسم الخدمة" : "Service Name"} value={order.service?.name} />
        <Row label={ar ? "سعر الخدمة" : "Service Price"} value={formatPrice(order.service?.price)} />
        <Row label={ar ? "وصف الخدمة" : "Service Description"} value={order.service?.description} />
        <Row
          label={ar ? "حالة الخدمة" : "Service Status"}
          value={
            <span className={`status-badge ${vendorOrderStatusClass[order.status]}`}>
              {vendorOrderStatusLabels[order.status]?.[ar ? "ar" : "en"] || order.status}
            </span>
          }
        />
      </Section>

      <Section title={ar ? "معلومات الزبون" : "Customer Information"}>
        <Row label={ar ? "اسم الزبون" : "Customer Name"} value={order.customer?.name} />
        <Row label={ar ? "رقم الزبون" : "Customer Phone"} value={<span style={{ direction: "ltr" }}>{order.customer?.phone}</span>} />
      </Section>

      <Section title={ar ? "معلومات الصالة" : "Venue Information"}>
        <Row label={ar ? "اسم الصالة" : "Venue Name"} value={order.venue?.name} />
        <Row label={ar ? "عنوان الصالة" : "Venue Address"} value={order.venue?.address} />
      </Section>

      {hasActions ? (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setDialog("accept")}
            className="btn-primary"
            style={{ width: "auto", padding: "10px 20px" }}
          >
            <Check size={16} />
            <span>{ar ? "قبول الخدمة" : "Accept Service"}</span>
          </button>
          <button
            type="button"
            onClick={() => setDialog("reject")}
            className="btn-venue"
            style={{ background: "transparent", color: "#dc2626", border: "1px solid rgba(220,38,38,.4)" }}
          >
            <X size={16} />
            <span>{ar ? "رفض الخدمة" : "Reject Service"}</span>
          </button>
        </div>
      ) : (
        <div className="dashboard-card">
          <p className="subtle" style={{ fontSize: 14 }}>
            {ar ? "لا توجد إجراءات متاحة لطلب الخدمة هذا." : "No actions available for this service request."}
          </p>
        </div>
      )}

      {dialog && (
        <div
          onClick={() => setDialog(null)}
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60,
          }}
        >
          <div className="dashboard-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, width: "100%" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
              {dialog === "accept"
                ? (ar ? "قبول طلب الخدمة" : "Accept Service Request")
                : (ar ? "رفض طلب الخدمة" : "Reject Service Request")}
            </h2>
            <p className="subtle" style={{ fontSize: 14, lineHeight: 1.6 }}>
              {dialog === "accept"
                ? (ar
                  ? "هل أنت متأكد أنك تريد قبول تقديم هذه الخدمة للفعالية؟"
                  : "Are you sure you want to accept providing this service for the event?")
                : (ar
                  ? "رفض هذه الخدمة سيؤدي إلى إلغاء الفعالية كاملة لأن الخدمة المطلوبة لن يتم تقديمها."
                  : "Rejecting this service will cancel the whole event because the requested service will not be provided.")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="btn-venue"
                style={{ background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                {ar ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={dialog === "accept" ? confirmAccept : confirmReject}
                className="btn-primary"
                style={{ width: "auto", padding: "10px 20px" }}
              >
                {dialog === "accept"
                  ? (ar ? "تأكيد القبول" : "Confirm Accept")
                  : (ar ? "تأكيد الرفض" : "Confirm Reject")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
