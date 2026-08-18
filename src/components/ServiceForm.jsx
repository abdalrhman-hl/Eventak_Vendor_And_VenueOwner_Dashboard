import { useState } from "react";
import { X, ImagePlus } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import { serviceCategories } from "../lib/vendorServices.js";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

const labelStyle = { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 };
const fieldStyle = { display: "flex", flexDirection: "column" };
const errorStyle = { color: "var(--destructive, #dc2626)", fontSize: 12, marginTop: 6 };

// Shared form for Add Service (POST /api/vendor/services) and
// Edit Service (POST /api/vendor/services/{id}). Frontend mock only.
export default function ServiceForm({ initial, mode = "create", submitLabel, onSubmit, onCancel }) {
  const { language } = useLanguage();
  const ar = language === "ar";
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    category_id: initial?.category_id ? String(initial.category_id) : "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? "",
  });
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
    if (!isEdit && !form.category_id)
      errs.category_id = ar ? "التصنيف مطلوب." : "Category is required.";
    if (!String(form.name).trim())
      errs.name = ar ? "اسم الخدمة مطلوب." : "Service name is required.";
    else if (String(form.name).trim().length > 255)
      errs.name = ar ? "الحد الأقصى 255 حرفًا." : "Maximum 255 characters.";
    if (!String(form.description).trim())
      errs.description = ar ? "الوصف مطلوب." : "Description is required.";
    if (form.price === "" || Number.isNaN(Number(form.price)) || Number(form.price) < 0)
      errs.price = ar ? "يجب أن يكون السعر 0 أو أكثر." : "Price must be 0 or greater.";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors((s) => ({ ...s, ...errs }));
    onSubmit({
      category_id: isEdit ? initial?.category_id : Number(form.category_id),
      name: String(form.name).trim(),
      description: String(form.description).trim(),
      price: Number(form.price),
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

  const readOnlyCategory = serviceCategories.find((c) => c.id === initial?.category_id);
  const selectedCategory = serviceCategories.find((c) => String(c.id) === String(form.category_id));

  return (
    <form className="dashboard-card" onSubmit={handleSubmit} noValidate>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>{ar ? "التصنيف" : "Category"}</label>
          {isEdit ? (
            <>
              <div
                className="input plain"
                style={{ opacity: 0.75, display: "flex", alignItems: "center" }}
              >
                {readOnlyCategory ? readOnlyCategory.name : initial?.category?.name || "-"}
              </div>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 6 }}>
                {ar
                  ? "لا يمكن تغيير التصنيف بعد إنشاء الخدمة."
                  : "Category cannot be changed after service creation."}
              </span>
            </>
          ) : (
            <>
              <select className="input plain" value={form.category_id} onChange={update("category_id")}>
                <option value="">{ar ? "اختر تصنيف الخدمة" : "Select a service category"}</option>
                {serviceCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {selectedCategory?.description && (
                <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 6 }}>
                  {selectedCategory.description}
                </span>
              )}
            </>
          )}
          {errors.category_id && <span style={errorStyle}>{errors.category_id}</span>}
        </div>


        <div style={fieldStyle}>
          <label style={labelStyle}>{ar ? "اسم الخدمة" : "Service Name"}</label>
          <input className="input plain" maxLength={255} value={form.name} onChange={update("name")} />
          {errors.name && <span style={errorStyle}>{errors.name}</span>}
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
          />
          {errors.price && <span style={errorStyle}>{errors.price}</span>}
        </div>
      </div>

      <div style={{ ...fieldStyle, marginTop: 16 }}>
        <label style={labelStyle}>{ar ? "الوصف" : "Description"}</label>
        <textarea
          className="input plain"
          rows={4}
          value={form.description}
          onChange={update("description")}
          style={{ resize: "vertical" }}
        />
        {errors.description && <span style={errorStyle}>{errors.description}</span>}
      </div>

      <div style={{ ...fieldStyle, marginTop: 16 }}>
        <label style={labelStyle}>{ar ? "صور الخدمة" : "Service Images"}</label>
        <label style={uploadBox}>
          <ImagePlus size={18} />
          <span>{ar ? "اختر صورًا (JPEG, PNG, JPG, WEBP - حتى 2 ميجابايت)" : "Choose images (JPEG, PNG, JPG, WEBP - up to 2MB)"}</span>
          <input type="file" accept="image/*" multiple hidden onChange={handleImages} />
        </label>
        {errors.images && <span style={errorStyle}>{errors.images}</span>}
        {images.length > 0 && (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", marginTop: 12 }}>
            {images.map((img, i) => (
              <div key={`${img.url}-${i}`} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
                <img src={img.url} alt={img.name} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label={ar ? "إزالة الصورة" : "Remove image"}
                  style={{
                    position: "absolute", top: 6, insetInlineEnd: 6, border: "none", cursor: "pointer",
                    background: "rgba(0,0,0,.6)", color: "#fff", borderRadius: 999, padding: 4, lineHeight: 0,
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-venue"
            style={{ background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            {ar ? "إلغاء" : "Cancel"}
          </button>
        )}
        <button type="submit" className="btn-primary" style={{ width: "auto", padding: "10px 20px" }}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
