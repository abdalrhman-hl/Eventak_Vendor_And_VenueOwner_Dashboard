import { useState } from "react";
import { X, ImagePlus } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import {
  displayServiceCategoryDescription,
  displayServiceCategoryName,
} from "../lib/serviceCategories.js";
import { resolveLocalizedText } from "../lib/venues.js";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

const labelStyle = { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 };
const fieldStyle = { display: "flex", flexDirection: "column" };
const errorStyle = { color: "var(--destructive, #dc2626)", fontSize: 12, marginTop: 6 };
const errorText = (value) => Array.isArray(value) ? value[0] : value;

// Shared form for Add Service (POST /api/vendor/services) and
// Edit Service (POST /api/vendor/services/{id}).
export default function ServiceForm({
  initial,
  mode = "create",
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverErrors = {},
  categories = [],
  categoriesLoading = false,
  categoriesError = "",
}) {
  const { language } = useLanguage();
  const ar = language === "ar";
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    category_id: initial?.category_id ? String(initial.category_id) : "",
    name: resolveLocalizedText(initial?.name, ar),
    description: resolveLocalizedText(initial?.description, ar),
    price: initial?.price ?? "",
  });
  const [images, setImages] = useState(
    (initial?.images || []).map((url, i) => ({ url, name: `image-${i + 1}`, file: null }))
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
    const next = files.map((file) => ({ url: URL.createObjectURL(file), name: file.name, file }));
    setImages((prev) => isEdit ? next : [...prev, ...next]);
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
      images: images.map((image) => image.file).filter(Boolean),
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

  const selectedCategory = categories.find((category) => String(category.id) === String(form.category_id));
  const fieldErrors = { ...serverErrors, ...errors };
  const categoryUnavailable = !isEdit && (categoriesLoading || categories.length === 0);

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
                {displayServiceCategoryName(
                  initial?.category || { id: initial?.category_id, name: null },
                  ar,
                )}
              </div>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 6 }}>
                {ar
                  ? "لا يمكن تغيير التصنيف بعد إنشاء الخدمة."
                  : "Category cannot be changed after service creation."}
              </span>
            </>
          ) : (
            <>
              <select
                className="input plain"
                value={form.category_id}
                onChange={update("category_id")}
                disabled={categoriesLoading || isSubmitting || categories.length === 0}
              >
                <option value="">{ar ? "اختر تصنيف الخدمة" : "Select a service category"}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {displayServiceCategoryName(category, ar)}
                  </option>
                ))}
              </select>
              {categoriesLoading && (
                <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 6 }}>
                  {ar ? "جاري تحميل التصنيفات..." : "Loading categories..."}
                </span>
              )}
              {!categoriesLoading && categoriesError && <span style={errorStyle}>{categoriesError}</span>}
              {!categoriesLoading && !categoriesError && categories.length === 0 && (
                <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 6 }}>
                  {ar ? "لا توجد تصنيفات خدمات متاحة." : "No service categories are available."}
                </span>
              )}
              {displayServiceCategoryDescription(selectedCategory, ar) && (
                <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 6 }}>
                  {displayServiceCategoryDescription(selectedCategory, ar)}
                </span>
              )}
            </>
          )}
          {fieldErrors.category_id && <span style={errorStyle}>{errorText(fieldErrors.category_id)}</span>}
        </div>


        <div style={fieldStyle}>
          <label style={labelStyle}>{ar ? "اسم الخدمة" : "Service Name"}</label>
          <input className="input plain" maxLength={255} value={form.name} onChange={update("name")} />
          {fieldErrors.name && <span style={errorStyle}>{errorText(fieldErrors.name)}</span>}
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
          {fieldErrors.price && <span style={errorStyle}>{errorText(fieldErrors.price)}</span>}
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
        {fieldErrors.description && <span style={errorStyle}>{errorText(fieldErrors.description)}</span>}
      </div>

      <div style={{ ...fieldStyle, marginTop: 16 }}>
        <label style={labelStyle}>{ar ? "صور الخدمة" : "Service Images"}</label>
        <label style={uploadBox}>
          <ImagePlus size={18} />
          <span>{ar ? "اختر صورًا (JPEG, PNG, JPG, WEBP - حتى 2 ميجابايت)" : "Choose images (JPEG, PNG, JPG, WEBP - up to 2MB)"}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleImages} disabled={isSubmitting} />
        </label>
        {isEdit && initial?.images?.length > 0 && images.every((image) => !image.file) && (
          <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 6 }}>
            {ar ? "اختيار صور جديدة سيستبدل جميع الصور الحالية." : "Selecting new images will replace all current images."}
          </span>
        )}
        {(fieldErrors.images || fieldErrors["images.0"]) && (
          <span style={errorStyle}>{errorText(fieldErrors.images || fieldErrors["images.0"])}</span>
        )}
        {images.length > 0 && (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", marginTop: 12 }}>
            {images.map((img, i) => (
              <div key={`${img.url}-${i}`} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
                <img src={img.url} alt={img.name} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                {(!isEdit || img.file) && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label={ar ? "إزالة الصورة" : "Remove image"}
                    style={{
                      position: "absolute", top: 6, insetInlineEnd: 6, border: "none", cursor: "pointer",
                      background: "rgba(0,0,0,.6)", color: "#fff", borderRadius: 999, padding: 4, lineHeight: 0,
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
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
            disabled={isSubmitting}
            className="btn-venue"
            style={{ background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            {ar ? "إلغاء" : "Cancel"}
          </button>
        )}
        <button type="submit" disabled={isSubmitting || categoryUnavailable} className="btn-primary" style={{ width: "auto", padding: "10px 20px" }}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
