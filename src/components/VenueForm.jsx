import { useState } from "react";
import { X, Upload, ImagePlus } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

const labelStyle = { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 };
const fieldStyle = { display: "flex", flexDirection: "column" };
const errorStyle = { color: "var(--destructive, #dc2626)", fontSize: 12, marginTop: 6 };

// Shared form for Add Venue (POST) and Update Request (PUT). Frontend mock only.
export default function VenueForm({ initial, submitLabel, onSubmit, onCancel }) {
  const { language } = useLanguage();
  const ar = language === "ar";

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    capacity: initial?.capacity ?? "",
    price: initial?.price ?? "",
    address: initial?.address ?? "",
    description: initial?.description ?? "",
  });
  const [cover, setCover] = useState(
    initial?.cover_image_url ? { url: initial.cover_image_url, name: "cover" } : null
  );
  const [images, setImages] = useState(
    (initial?.images_urls || []).map((url, i) => ({ url, name: `image-${i + 1}` }))
  );
  const [errors, setErrors] = useState({});

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }));
  };

  const checkFiles = (files) => {
    for (const f of files) {
      if (!ALLOWED.includes(f.type))
        return ar ? "يرجى رفع ملفات صور صالحة فقط." : "Please upload valid image files only.";
      if (f.size > MAX_SIZE)
        return ar ? "يجب ألا يتجاوز حجم كل صورة 2 ميجابايت." : "Each image must not exceed 2MB.";
    }
    return null;
  };

  const handleCover = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const err = checkFiles(files);
    if (err) return setErrors((s) => ({ ...s, cover_image: err }));
    setErrors((s) => ({ ...s, cover_image: undefined }));
    setCover({ url: URL.createObjectURL(files[0]), name: files[0].name });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const err = checkFiles(files);
    if (err) return setErrors((s) => ({ ...s, images: err }));
    setErrors((s) => ({ ...s, images: undefined }));
    setImages((prev) => [
      ...prev,
      ...files.map((f) => ({ url: URL.createObjectURL(f), name: f.name })),
    ]);
  };

  const validate = () => {
    const errs = {};
    if (!String(form.name).trim())
      errs.name = ar ? "اسم الصالة مطلوب." : "Venue name is required.";
    else if (String(form.name).trim().length > 255)
      errs.name = ar ? "الحد الأقصى 255 حرفًا." : "Maximum 255 characters.";
    if (form.capacity === "" || !Number.isInteger(Number(form.capacity)) || Number(form.capacity) < 1)
      errs.capacity = ar ? "يجب أن تكون السعة 1 على الأقل." : "Capacity must be at least 1.";
    if (form.price === "" || Number.isNaN(Number(form.price)) || Number(form.price) < 0)
      errs.price = ar ? "يجب أن يكون السعر 0 أو أكثر." : "Price must be 0 or greater.";
    if (!String(form.address).trim()) errs.address = ar ? "العنوان مطلوب." : "Address is required.";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors((s) => ({ ...s, ...errs }));
    onSubmit({
      name: String(form.name).trim(),
      capacity: Number(form.capacity),
      price: Number(form.price),
      address: String(form.address).trim(),
      description: String(form.description).trim() || null,
      cover_image_url: cover?.url || null,
      images_urls: images.map((i) => i.url),
    });
  };

  const uploadBox = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "20px 16px",
    border: "1px dashed var(--border)",
    borderRadius: 12,
    cursor: "pointer",
    color: "var(--muted-foreground)",
    fontSize: 13,
    background: "var(--muted)",
  };

  return (
    <form className="dashboard-card" onSubmit={handleSubmit} noValidate>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>{ar ? "اسم الصالة" : "Venue Name"}</label>
          <input
            className="input plain"
            maxLength={255}
            value={form.name}
            onChange={update("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && <div style={errorStyle}>{errors.name}</div>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>{ar ? "السعة" : "Capacity"}</label>
          <input
            className="input plain"
            type="number"
            min="1"
            step="1"
            value={form.capacity}
            onChange={update("capacity")}
            aria-invalid={!!errors.capacity}
          />
          {errors.capacity && <div style={errorStyle}>{errors.capacity}</div>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>{ar ? "السعر" : "Price"}</label>
          <input
            className="input plain"
            type="number"
            min="0"
            step="any"
            value={form.price}
            onChange={update("price")}
            aria-invalid={!!errors.price}
          />
          {errors.price && <div style={errorStyle}>{errors.price}</div>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>{ar ? "العنوان" : "Address"}</label>
          <input
            className="input plain"
            value={form.address}
            onChange={update("address")}
            aria-invalid={!!errors.address}
          />
          {errors.address && <div style={errorStyle}>{errors.address}</div>}
        </div>
      </div>

      <div style={{ ...fieldStyle, marginTop: 16 }}>
        <label style={labelStyle}>{ar ? "الوصف" : "Description"}</label>
        <textarea
          className="input plain"
          rows={4}
          style={{ resize: "vertical", minHeight: 100 }}
          value={form.description}
          onChange={update("description")}
        />
      </div>

      <div style={{ ...fieldStyle, marginTop: 16 }}>
        <label style={labelStyle}>{ar ? "صورة الغلاف" : "Cover Image"}</label>
        {cover ? (
          <div style={{ position: "relative", width: 200 }}>
            <img
              src={cover.url}
              alt={ar ? "معاينة صورة الغلاف" : "Cover image preview"}
              style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }}
            />
            <button
              type="button"
              onClick={() => setCover(null)}
              aria-label={ar ? "إزالة صورة الغلاف" : "Remove cover image"}
              style={removeBtn}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label style={uploadBox}>
            <Upload size={16} />
            <span>{ar ? "اختر صورة الغلاف" : "Choose a cover image"}</span>
            <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" hidden onChange={handleCover} />
          </label>
        )}
        {errors.cover_image && <div style={errorStyle}>{errors.cover_image}</div>}
      </div>

      <div style={{ ...fieldStyle, marginTop: 16 }}>
        <label style={labelStyle}>{ar ? "صور إضافية" : "Additional Images"}</label>
        <label style={uploadBox}>
          <ImagePlus size={16} />
          <span>{ar ? "اختر صورًا إضافية" : "Choose additional images"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            multiple
            hidden
            onChange={handleImages}
          />
        </label>
        {errors.images && <div style={errorStyle}>{errors.images}</div>}
        {images.length > 0 && (
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", marginTop: 12 }}>
            {images.map((img, idx) => (
              <div key={`${img.url}-${idx}`} style={{ position: "relative" }}>
                <img
                  src={img.url}
                  alt={ar ? `صورة ${idx + 1}` : `Image ${idx + 1}`}
                  style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }}
                />
                <button
                  type="button"
                  onClick={() => setImages((p) => p.filter((_, i) => i !== idx))}
                  aria-label={ar ? "إزالة الصورة" : "Remove image"}
                  style={removeBtn}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onCancel}
          className="btn-venue"
          style={{ background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)", minWidth: 140 }}
        >
          {ar ? "إلغاء" : "Cancel"}
        </button>
        <button type="submit" className="btn-venue" style={{ minWidth: 160 }}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

const removeBtn = {
  position: "absolute",
  top: 6,
  insetInlineEnd: 6,
  width: 24,
  height: 24,
  borderRadius: 999,
  border: "1px solid var(--border)",
  background: "var(--card, #fff)",
  color: "var(--foreground)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
};
