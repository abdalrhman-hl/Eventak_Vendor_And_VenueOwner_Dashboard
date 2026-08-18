import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../lib/language.jsx";
import { setProfileName } from "../lib/profile.js";
import { User, Mail, Phone, Shield, Hash, Check, X, Loader2, AlertCircle, Upload, Trash2 } from "lucide-react";

// Mock response shaped like GET /api/user/profile
const mockProfileResponse = {
  status: "success",
  data: {
    id: 1,
    name: "Ahmad Services",
    email: "vendor@eventak.com",
    phone: "+963944123456",
    role: "vendor",
    avatar_url: null,
  },
};

function getInitials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isValidSyrianNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits.startsWith("963")) return false;
  const rest = digits.slice(3);
  return rest.length === 9 && rest.startsWith("9");
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

export default function VendorProfile() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(mockProfileResponse.data);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...mockProfileResponse.data });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      setProfileName(profile.name);
      window.dispatchEvent(new Event("eventak:profile-updated"));
    }
  }, [loading, profile.name]);

  const t = {
    pageTitle: ar ? "الملف الشخصي" : "Profile",
    subtitle: ar ? "إدارة معلومات حسابك الشخصي." : "Manage your account information.",
    accountInfoTitle: ar ? "معلومات الحساب" : "Account Information",
    userId: ar ? "رقم المستخدم" : "User ID",
    name: ar ? "الاسم" : "Name",
    email: ar ? "البريد الإلكتروني" : "Email",
    phone: ar ? "رقم الهاتف" : "Phone",
    role: ar ? "الدور" : "Role",
    vendor: ar ? "مورد" : "Vendor",
    avatar: ar ? "الصورة الشخصية" : "Avatar",
    uploadAvatar: ar ? "رفع صورة شخصية" : "Upload Avatar",
    removeAvatar: ar ? "حذف الصورة الشخصية" : "Remove Avatar",
    editProfile: ar ? "تعديل الملف الشخصي" : "Edit Profile",
    saveChanges: ar ? "حفظ التغييرات" : "Save Changes",
    cancel: ar ? "إلغاء" : "Cancel",
    profileUpdated: ar ? "تم تحديث الملف الشخصي بنجاح." : "Profile updated successfully.",
    avatarUpdated: ar ? "تم تحديث الصورة الشخصية بنجاح." : "Avatar updated successfully.",
    avatarRemoved: ar ? "تم حذف الصورة الشخصية بنجاح." : "Avatar removed successfully.",
    loadingProfile: ar ? "جارٍ تحميل الملف الشخصي..." : "Loading profile...",
    loadFailed: ar ? "فشل تحميل معلومات الملف الشخصي." : "Failed to load profile information.",
    nameRequired: ar ? "الاسم مطلوب." : "Name is required.",
    nameMax: ar ? "يجب ألا يتجاوز الاسم 255 حرفاً." : "Name must not exceed 255 characters.",
    emailRequired: ar ? "البريد الإلكتروني مطلوب." : "Email is required.",
    emailInvalid: ar ? "يرجى إدخال بريد إلكتروني صالح." : "Please enter a valid email address.",
    phoneError: ar ? "يرجى إدخال رقم هاتف سوري صالح." : "Please enter a valid Syrian phone number.",
    phoneMax: ar ? "يجب ألا يتجاوز رقم الهاتف 20 حرفاً." : "Phone must not exceed 20 characters.",
    fileInvalid: ar ? "يرجى رفع ملف صورة صالح." : "Please upload a valid image file.",
    fileTooLarge: ar ? "يجب ألا يتجاوز حجم الصورة 2 ميجابايت." : "Image size must not exceed 2MB.",
  };

  const roleLabel = profile.role === "vendor" ? t.vendor : profile.role;

  function flash(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  }

  function handleEdit() {
    setForm({ ...profile });
    setErrors({});
    setMessage("");
    setEditing(true);
  }

  function handleCancel() {
    setForm({ ...profile });
    setErrors({});
    setEditing(false);
  }

  function validate() {
    const next = {};
    const name = (form.name || "").trim();
    const email = (form.email || "").trim();
    const phone = (form.phone || "").trim();

    if (!name) next.name = t.nameRequired;
    else if (name.length > 255) next.name = t.nameMax;

    if (!email) next.email = t.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t.emailInvalid;

    if (phone) {
      if (phone.length > 20) next.phone = t.phoneMax;
      else if (!isValidSyrianNumber(phone)) next.phone = t.phoneError;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    // PUT /api/user/profile → { name, email, phone }
    const trimmedName = form.name.trim();
    setProfile((prev) => ({
      ...prev,
      name: trimmedName,
      email: form.email.trim(),
      phone: (form.phone || "").trim(),
    }));
    setProfileName(trimmedName);
    window.dispatchEvent(new Event("eventak:profile-updated"));
    setEditing(false);
    flash(t.profileUpdated);
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleAvatarSelect(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarError("");
    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError(t.fileInvalid);
      return;
    }
    if (file.size > MAX_SIZE) {
      setAvatarError(t.fileTooLarge);
      return;
    }
    // POST /api/user/avatar (multipart: avatar) — mock local preview only
    const url = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, avatar_url: url }));
    flash(t.avatarUpdated);
  }

  function handleAvatarRemove() {
    // DELETE /api/user/avatar
    setAvatarError("");
    setProfile((prev) => ({ ...prev, avatar_url: null }));
    flash(t.avatarRemoved);
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
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", marginBottom: 4 }}>{label}</div>
          {isEditing ? (
            <>
              <input
                type={type}
                value={form[field] ?? ""}
                onChange={(e) => handleChange(field, e.target.value)}
                dir="ltr"
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
              {hasError && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{hasError}</div>}
            </>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>{value || "—"}</div>
          )}
        </div>
      </div>
    );
  };

  const AvatarCircle = ({ size }) => (
    profile.avatar_url ? (
      <img
        src={profile.avatar_url}
        alt={profile.name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    ) : (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
          color: "var(--primary-foreground)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size / 3.2,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {getInitials(profile.name)}
      </div>
    )
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{t.pageTitle}</h1>
        <p className="mt-2 subtle">{t.subtitle}</p>
      </div>

      {message && (
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
          {message}
        </div>
      )}

      {/* 1. Profile Summary Card */}
      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <AvatarCircle size={72} />
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 600, margin: 0 }}>
              {profile.name}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 8 }}>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                {t.role}: <strong style={{ color: "var(--foreground)" }}>{roleLabel}</strong>
              </span>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                {t.email}: <strong style={{ color: "var(--foreground)" }} dir="ltr">{profile.email}</strong>
              </span>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                {t.phone}: <strong style={{ color: "var(--foreground)" }} dir="ltr">{profile.phone || "—"}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* 2. Account Information */}
        <div className="dashboard-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t.accountInfoTitle}</h3>
          <InfoRow icon={Hash} label={t.userId} value={String(profile.id)} />
          <InfoRow icon={User} label={t.name} value={profile.name} editable field="name" />
          <InfoRow icon={Mail} label={t.email} value={profile.email} editable field="email" type="email" />
          <InfoRow icon={Phone} label={t.phone} value={profile.phone} editable field="phone" />
          <InfoRow icon={Shield} label={t.role} value={roleLabel} />
        </div>

        {/* 4. Avatar Management */}
        <div className="dashboard-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t.avatar}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <AvatarCircle size={64} />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarSelect}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-venue"
                style={{ width: "auto", padding: "10px 20px" }}
              >
                <Upload size={16} />
                {t.uploadAvatar}
              </button>
              <button
                type="button"
                onClick={handleAvatarRemove}
                disabled={!profile.avatar_url}
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
                  cursor: profile.avatar_url ? "pointer" : "not-allowed",
                  opacity: profile.avatar_url ? 1 : 0.55,
                }}
              >
                <Trash2 size={16} />
                {t.removeAvatar}
              </button>
            </div>
          </div>
          {avatarError && (
            <div style={{ fontSize: 13, color: "#ef4444", marginTop: 12 }}>{avatarError}</div>
          )}
        </div>
      </div>

      {/* 3. Edit Profile actions */}
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
