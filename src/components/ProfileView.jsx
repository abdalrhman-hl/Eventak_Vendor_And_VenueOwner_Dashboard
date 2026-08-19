import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Check,
  Hash,
  Loader2,
  Mail,
  Phone,
  Shield,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import { getApiErrorMessage } from "../lib/api.js";
import {
  clearAuthSession,
  getAuthToken,
  syncAuthUserFromProfile,
} from "../lib/auth.js";
import {
  deleteUserAvatar,
  fetchUserProfile,
  getInitials,
  updateUserProfile,
  uploadUserAvatar,
} from "../lib/profile.js";

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_AVATAR_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

function AvatarCircle({ profile, size }) {
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }

  return (
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
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  editable = false,
  editing = false,
  field,
  type = "text",
  form,
  errors,
  disabled,
  onChange,
}) {
  const showInput = editing && editable;
  const fieldError = field ? errors[field] : "";

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
        {showInput ? (
          <>
            <input
              type={type}
              value={form[field] ?? ""}
              onChange={(event) => onChange(field, event.target.value)}
              disabled={disabled}
              dir="ltr"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${fieldError ? "#ef4444" : "var(--input)"}`,
                background: "var(--surface)",
                color: "var(--foreground)",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                opacity: disabled ? 0.7 : 1,
              }}
            />
            {fieldError && (
              <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }} role="alert">
                {fieldError}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>
            {value || "—"}
          </div>
        )}
      </div>
    </div>
  );
}

function getBackendFieldErrors(error) {
  const next = {};
  for (const field of ["name", "email", "phone"]) {
    const messages = error?.errors?.[field];
    if (Array.isArray(messages) && typeof messages[0] === "string") next[field] = messages[0];
  }
  return next;
}

export default function ProfileView({ variant }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const messageTimer = useRef(null);
  const ar = language === "ar";
  const isVenueOwner = variant === "venue_owner";

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);

  const t = {
    pageTitle: ar ? "الملف الشخصي" : "Profile",
    subtitle: isVenueOwner
      ? (ar ? "إدارة معلومات حساب صاحب الصالة." : "Manage your venue owner account information.")
      : (ar ? "إدارة معلومات حسابك الشخصي." : "Manage your account information."),
    accountInfoTitle: ar ? "معلومات الحساب" : "Account Information",
    contactInfoTitle: ar ? "معلومات الاتصال" : "Contact Information",
    userId: ar ? "رقم المستخدم" : "User ID",
    name: isVenueOwner ? (ar ? "اسم صاحب الحساب" : "Owner Name") : (ar ? "الاسم" : "Name"),
    email: ar ? "البريد الإلكتروني" : "Email",
    phone: ar ? "رقم الهاتف" : "Phone",
    role: ar ? "الدور" : "Role",
    vendor: ar ? "مورد" : "Vendor",
    venueOwner: ar ? "صاحب صالة" : "Venue Owner",
    avatar: ar ? "الصورة الشخصية" : "Avatar",
    uploadAvatar: ar ? "رفع صورة شخصية" : "Upload Avatar",
    uploadingAvatar: ar ? "جارٍ رفع الصورة..." : "Uploading...",
    removeAvatar: ar ? "حذف الصورة الشخصية" : "Remove Avatar",
    deletingAvatar: ar ? "جارٍ حذف الصورة..." : "Removing...",
    editProfile: ar ? "تعديل الملف الشخصي" : "Edit Profile",
    saveChanges: ar ? "حفظ التغييرات" : "Save Changes",
    savingChanges: ar ? "جارٍ الحفظ..." : "Saving...",
    cancel: ar ? "إلغاء" : "Cancel",
    profileUpdated: ar ? "تم تحديث الملف الشخصي بنجاح." : "Profile updated successfully.",
    avatarUpdated: ar ? "تم تحديث الصورة الشخصية بنجاح." : "Avatar updated successfully.",
    avatarRemoved: ar ? "تم حذف الصورة الشخصية بنجاح." : "Avatar removed successfully.",
    loadingProfile: ar ? "جارٍ تحميل الملف الشخصي..." : "Loading profile...",
    loadFailed: ar ? "فشل تحميل معلومات الملف الشخصي." : "Failed to load profile information.",
    nameRequired: ar ? "الاسم مطلوب." : "Name is required.",
    nameMax: ar ? "يجب ألا يتجاوز الاسم 255 حرفًا." : "Name must not exceed 255 characters.",
    emailRequired: ar ? "البريد الإلكتروني مطلوب." : "Email is required.",
    emailInvalid: ar ? "يرجى إدخال بريد إلكتروني صالح." : "Please enter a valid email address.",
    emailMax: ar ? "يجب ألا يتجاوز البريد الإلكتروني 255 حرفًا." : "Email must not exceed 255 characters.",
    phoneMax: ar ? "يجب ألا يتجاوز رقم الهاتف 20 حرفًا." : "Phone must not exceed 20 characters.",
    fileInvalid: ar ? "يجب أن تكون الصورة بصيغة JPG أو JPEG أو PNG أو WEBP." : "Image must be JPG, JPEG, PNG, or WEBP.",
    fileTooLarge: ar ? "يجب ألا يتجاوز حجم الصورة 2 ميجابايت." : "Image size must not exceed 2MB.",
  };

  const redirectForInvalidSession = useCallback(() => {
    clearAuthSession();
    navigate("/account-type", { replace: true });
  }, [navigate]);

  function applyProfile(nextProfile) {
    setProfile(nextProfile);
    setForm({
      name: nextProfile.name || "",
      email: nextProfile.email || "",
      phone: nextProfile.phone || "",
    });
    syncAuthUserFromProfile(nextProfile);
  }

  function handleRequestError(error, setter) {
    if (error?.status === 401) {
      redirectForInvalidSession();
      return;
    }
    setter(getApiErrorMessage(error, language));
  }

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const token = getAuthToken();
      if (!token) {
        redirectForInvalidSession();
        return;
      }

      setLoading(true);
      setLoadError("");
      try {
        const data = await fetchUserProfile(token);
        if (active) applyProfile(data);
      } catch (error) {
        if (!active) return;
        if (error?.status === 401) redirectForInvalidSession();
        else setLoadError(getApiErrorMessage(error, language));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
      if (messageTimer.current) clearTimeout(messageTimer.current);
    };
    // Profile is intentionally reloaded when the UI language changes so fallback errors match it.
  }, [language, redirectForInvalidSession]);

  function flash(text) {
    if (messageTimer.current) clearTimeout(messageTimer.current);
    setMessage(text);
    messageTimer.current = setTimeout(() => setMessage(""), 3000);
  }

  function handleEdit() {
    setForm({ name: profile.name || "", email: profile.email || "", phone: profile.phone || "" });
    setErrors({});
    setActionError("");
    setEditing(true);
  }

  function handleCancel() {
    setForm({ name: profile.name || "", email: profile.email || "", phone: profile.phone || "" });
    setErrors({});
    setActionError("");
    setEditing(false);
  }

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setActionError("");
  }

  function validate() {
    const next = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name) next.name = t.nameRequired;
    else if (name.length > 255) next.name = t.nameMax;

    if (!email) next.email = t.emailRequired;
    else if (email.length > 255) next.email = t.emailMax;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t.emailInvalid;

    if (phone.length > 20) next.phone = t.phoneMax;

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (saving || !validate()) return;
    const token = getAuthToken();
    if (!token) {
      redirectForInvalidSession();
      return;
    }

    setSaving(true);
    setActionError("");
    try {
      const response = await updateUserProfile(token, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      });
      const data = response.data;
      applyProfile({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        avatar_url: profile.avatar_url,
      });
      setEditing(false);
      flash(response.message || t.profileUpdated);
    } catch (error) {
      if (error?.status === 401) {
        redirectForInvalidSession();
        return;
      }
      const fieldErrors = getBackendFieldErrors(error);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      setActionError(getApiErrorMessage(error, language));
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading) return;

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    setAvatarError("");
    setActionError("");
    if (!ALLOWED_AVATAR_TYPES.includes(file.type) || !ALLOWED_AVATAR_EXTENSIONS.includes(extension)) {
      setAvatarError(t.fileInvalid);
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError(t.fileTooLarge);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      redirectForInvalidSession();
      return;
    }

    setUploading(true);
    try {
      const response = await uploadUserAvatar(token, file);
      const updatedProfile = { ...profile, avatar_url: response.avatar_url || null };
      setProfile(updatedProfile);
      syncAuthUserFromProfile(updatedProfile);
      flash(response.message || t.avatarUpdated);
    } catch (error) {
      handleRequestError(error, setAvatarError);
    } finally {
      setUploading(false);
    }
  }

  async function handleAvatarRemove() {
    if (!profile.avatar_url || deletingAvatar) return;
    const token = getAuthToken();
    if (!token) {
      redirectForInvalidSession();
      return;
    }

    setDeletingAvatar(true);
    setAvatarError("");
    setActionError("");
    try {
      const response = await deleteUserAvatar(token);
      const updatedProfile = { ...profile, avatar_url: null };
      setProfile(updatedProfile);
      syncAuthUserFromProfile(updatedProfile);
      flash(response.message || t.avatarRemoved);
    } catch (error) {
      handleRequestError(error, setAvatarError);
    } finally {
      setDeletingAvatar(false);
    }
  }

  if (loadError) {
    return (
      <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>
        <AlertCircle size={40} style={{ color: "var(--muted-foreground)", marginBottom: 12 }} />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{t.loadFailed}</h3>
        <p className="mt-2 small subtle" role="alert">{loadError}</p>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>
        <Loader2 size={32} style={{ color: "var(--primary)", animation: "spin 1s linear infinite", marginBottom: 12 }} />
        <p className="subtle">{t.loadingProfile}</p>
      </div>
    );
  }

  const roleLabel = profile.role === "venue_owner" ? t.venueOwner : profile.role === "vendor" ? t.vendor : profile.role;
  const busy = saving || uploading || deletingAvatar;
  const infoProps = { editing, form, errors, disabled: saving, onChange: handleChange };

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{t.pageTitle}</h1>
        <p className="mt-2 subtle">{t.subtitle}</p>
      </div>

      {message && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(34,197,94,0.12)", color: "#15803d", marginBottom: 20, fontSize: 14, fontWeight: 500 }} role="status">
          <Check size={18} />
          {message}
        </div>
      )}

      {actionError && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", color: "#dc2626", marginBottom: 20, fontSize: 14 }} role="alert">
          <AlertCircle size={18} />
          {actionError}
        </div>
      )}

      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <AvatarCircle profile={profile} size={72} />
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
        <div className="dashboard-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t.accountInfoTitle}</h3>
          <InfoRow icon={Hash} label={t.userId} value={String(profile.id)} {...infoProps} />
          <InfoRow icon={User} label={t.name} value={profile.name} editable field="name" {...infoProps} />
          <InfoRow icon={Mail} label={t.email} value={profile.email} editable field="email" type="email" {...infoProps} />
          {!isVenueOwner && <InfoRow icon={Phone} label={t.phone} value={profile.phone} editable field="phone" {...infoProps} />}
          <InfoRow icon={Shield} label={t.role} value={roleLabel} {...infoProps} />
        </div>

        {isVenueOwner && (
          <div className="dashboard-card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t.contactInfoTitle}</h3>
            <InfoRow icon={Phone} label={t.phone} value={profile.phone} editable field="phone" {...infoProps} />
          </div>
        )}

        <div className="dashboard-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t.avatar}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <AvatarCircle profile={profile} size={64} />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleAvatarSelect}
                disabled={busy}
                style={{ display: "none" }}
              />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="btn-venue" style={{ width: "auto", padding: "10px 20px" }}>
                {uploading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={16} />}
                {uploading ? t.uploadingAvatar : t.uploadAvatar}
              </button>
              <button
                type="button"
                onClick={handleAvatarRemove}
                disabled={!profile.avatar_url || busy}
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
                  cursor: profile.avatar_url && !busy ? "pointer" : "not-allowed",
                  opacity: profile.avatar_url && !busy ? 1 : 0.55,
                }}
              >
                {deletingAvatar ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={16} />}
                {deletingAvatar ? t.deletingAvatar : t.removeAvatar}
              </button>
            </div>
          </div>
          {avatarError && <div style={{ fontSize: 13, color: "#ef4444", marginTop: 12 }} role="alert">{avatarError}</div>}
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {!editing ? (
          <button type="button" onClick={handleEdit} disabled={busy} className="btn-venue" style={{ width: "auto", padding: "10px 20px" }}>
            {t.editProfile}
          </button>
        ) : (
          <>
            <button type="button" onClick={handleSave} disabled={saving} className="btn-venue" style={{ width: "auto", padding: "10px 20px" }}>
              {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={16} />}
              {saving ? t.savingChanges : t.saveChanges}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
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
