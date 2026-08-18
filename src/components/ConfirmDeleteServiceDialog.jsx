import { useLanguage } from "../lib/language.jsx";

export default function ConfirmDeleteServiceDialog({ open, onCancel, onConfirm }) {
  const { language } = useLanguage();
  const ar = language === "ar";
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60,
      }}
    >
      <div className="dashboard-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, width: "100%" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
          {ar ? "طلب حذف الخدمة" : "Request Service Deletion"}
        </h2>
        <p className="subtle" style={{ fontSize: 14, lineHeight: 1.6 }}>
          {ar
            ? "سيتم إرسال طلب حذف إلى الإدارة، ولن يتم حذف الخدمة مباشرة."
            : "This will send a delete request to Admin. The service will not be deleted immediately."}
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
          <button type="button" onClick={onConfirm} className="btn-primary" style={{ width: "auto", padding: "10px 20px" }}>
            {ar ? "تأكيد طلب الحذف" : "Confirm Delete Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
