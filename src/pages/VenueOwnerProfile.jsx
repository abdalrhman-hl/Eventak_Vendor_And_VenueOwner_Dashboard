import { useState, useEffect } from "react";
import { useLanguage } from "../lib/language.jsx";
import { setProfileName } from "../lib/profile.js";
import { User, Mail, Shield, Calendar, Phone, MessageCircle, MapPin, Building, Check, X, Loader2, AlertCircle } from "lucide-react";

const initialProfile = {
  ownerName: "Ahmad Al-Hassan",
  email: "venue.owner@eventak.com",
  accountType: "Venue Owner",
  joinedDate: "June 2026",
  phone: "+963 944123456",
  whatsapp: "+963 944123456",
  city: "Damascus",
  businessName: "Al-Hassan Venues",
  status: "Active",
};

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isValidSyrianNumber(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits.startsWith("963")) return false;
  const rest = digits.slice(3);
  return rest.length === 9 && rest.startsWith("9");
}

export default function VenueOwnerProfile() {
  const { language } = useLanguage();
  const ar = language === "ar";

  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...initialProfile });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      setProfileName(profile.ownerName);
      window.dispatchEvent(new Event("eventak:profile-updated"));
    }
  }, [loading, profile.ownerName]);

  const t = {
    pageTitle: ar ? "الملف الشخصي" : "Profile",
    subtitle: ar
      ? "إدارة معلومات حساب صاحب الصالة."
      : "Manage your venue owner account information.",
    summaryTitle: ar ? "ملخص الملف الشخصي" : "Profile Summary",
    accountTypeLabel: ar ? "نوع الحساب" : "Account Type",
    venueOwner: ar ? "صاحب صالة" : "Venue Owner",
    statusLabel: ar ? "الحالة" : "Status",
    active: ar ? "فعال" : "Active",
    accountInfoTitle: ar ? "معلومات الحساب" : "Account Information",
    ownerNameLabel: ar ? "اسم صاحب الحساب" : "Owner Name",
    emailLabel: ar ? "البريد الإلكتروني" : "Email Address",
    joinedDateLabel: ar ? "تاريخ الانضمام" : "Joined Date",
    contactInfoTitle: ar ? "معلومات الاتصال" : "Contact Information",
    phoneLabel: ar ? "رقم الهاتف" : "Phone Number",
    whatsappLabel: ar ? "رقم واتساب" : "WhatsApp Number",
    cityLabel: ar ? "المدينة" : "City",
    damascus: ar ? "دمشق" : "Damascus",
    businessNameLabel: ar ? "اسم النشاط التجاري" : "Business Name",
    editProfile: ar ? "تعديل الملف الشخصي" : "Edit Profile",
    saveChanges: ar ? "حفظ التغييرات" : "Save Changes",
    cancel: ar ? "إلغاء" : "Cancel",
    profileUpdated: ar ? "تم تحديث الملف الشخصي بنجاح." : "Profile updated successfully.",
    loadingProfile: ar ? "جارٍ تحميل الملف الشخصي..." : "Loading profile...",
    loadFailed: ar
      ? "فشل تحميل معلومات الملف الشخصي."
      : "Failed to load profile information.",
    phoneError: ar
      ? "يرجى إدخال رقم هاتف سوري صالح."
      : "Please enter a valid Syrian phone number.",
  };

  function handleEdit() {
    setForm({ ...profile });
    setErrors({});
    setSuccess(false);
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    setErrors({});
    setSuccess(false);
  }

  function validate() {
    const nextErrors = {};
    if (!isValidSyrianNumber(form.phone)) {
      nextErrors.phone = t.phoneError;
    }
    if (!isValidSyrianNumber(form.whatsapp)) {
      nextErrors.whatsapp = t.phoneError;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setProfile({ ...form });
    setProfileName(form.ownerName);
    window.dispatchEvent(new Event("eventak:profile-updated"));
    setEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  if (loadError) {
    return (
      <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>
        <AlertCircle size={40} style={{ color: "var(--muted-foreground)", marginBottom: 12 }} />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{t.loadFailed}</h3>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>
        <Loader2 size={32} style={{ color: "var(--primary)", animation: "spin 1s linear infinite", marginBottom: 12 }} />
        <p className="subtle">{t.loadingProfile}</p>
      </div>
    );
  }

  const InfoRow = ({ icon: Icon, label, value, editable, field, type = "text" }) => {
    const isEditing = editing && editable;
    const hasError = errors[field];

    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "var(--muted)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted-foreground)",
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", marginBottom: 4 }}>
            {label}
          </div>
          {isEditing ? (
            <>
              <input
                type={type}
                value={form[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${hasError ? "#ef4444" : "var(--input)"}`,
                  background: "var(--surface)",
                  color: "var(--foreground)",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              {hasError && (
                <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
                  {hasError}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>
              {field === "city" ? (ar ? t.damascus : value) : value}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{t.pageTitle}</h1>
        <p className="mt-2 subtle">{t.subtitle}</p>
      </div>

      {success && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(34,197,94,0.12)",
            color: "#15803d",
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <Check size={18} />
          {t.profileUpdated}
        </div>
      )}

      {/* Profile Summary Card */}
      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              color: "var(--primary-foreground)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {getInitials(profile.ownerName)}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 600, margin: 0 }}>
              {profile.ownerName}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 8 }}>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                {t.accountTypeLabel}: <strong style={{ color: "var(--foreground)" }}>{t.venueOwner}</strong>
              </span>
              <span
                className="status-badge active"
                style={{ fontSize: 12 }}
              >
                {t.statusLabel}: {t.active}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Account Information */}
        <div className="dashboard-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t.accountInfoTitle}</h3>
          <InfoRow icon={User} label={t.ownerNameLabel} value={profile.ownerName} />
          <InfoRow icon={Mail} label={t.emailLabel} value={profile.email} />
          <InfoRow icon={Shield} label={t.accountTypeLabel} value={profile.accountType} />
          <InfoRow icon={Calendar} label={t.joinedDateLabel} value={profile.joinedDate} />
        </div>

        {/* Contact Information */}
        <div className="dashboard-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t.contactInfoTitle}</h3>
          <InfoRow icon={Phone} label={t.phoneLabel} value={profile.phone} editable editing={editing} field="phone" />
          <InfoRow icon={MessageCircle} label={t.whatsappLabel} value={profile.whatsapp} editable editing={editing} field="whatsapp" />
          <InfoRow icon={MapPin} label={t.cityLabel} value={profile.city} editable editing={editing} field="city" />
          <InfoRow icon={Building} label={t.businessNameLabel} value={profile.businessName} editable editing={editing} field="businessName" />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {!editing ? (
          <button type="button" onClick={handleEdit} className="btn-venue" style={{ width: "auto", padding: "10px 20px" }}>
            {t.editProfile}
          </button>
        ) : (
          <>
            <button type="button" onClick={handleSave} className="btn-venue" style={{ width: "auto", padding: "10px 20px" }}>
              <Check size={16} />
              {t.saveChanges}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--foreground)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <X size={16} />
              {t.cancel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
