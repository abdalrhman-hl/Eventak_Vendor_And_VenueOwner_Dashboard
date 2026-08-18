// Mock store for Vendor Services (backend-compatible shape).
// Future Laravel routes (not called here):
//   GET    /api/vendor/services
//   POST   /api/vendor/services
//   POST   /api/vendor/services/{id}   (POST is used for update to support image uploads)
//   DELETE /api/vendor/services/{id}

const listeners = new Set();

// Shared, backend-compatible categories (GET /api/services/categories)
export { serviceCategories, getServiceCategoryById } from "./serviceCategories.js";
import { serviceCategories, getServiceCategoryById } from "./serviceCategories.js";


export const serviceStatusLabels = {
  active: { en: "Active", ar: "نشطة" },
  pending: { en: "Pending Admin Review", ar: "بانتظار مراجعة الإدارة" },
  pending_delete: { en: "Delete Request Pending", ar: "طلب الحذف قيد المراجعة" },
  inactive: { en: "Inactive", ar: "غير نشطة" },
};

export const serviceStatusClass = {
  active: "active",
  pending: "review",
  pending_delete: "rejected",
  inactive: "muted",
};

let services = [
  {
    id: 1,
    vendor_id: 7,
    category_id: 1,
    category: { id: 1, name: "Photography" },
    name: "Wedding Photography Package",
    description: "Professional wedding photography service with full event coverage.",
    price: 400,
    images_urls: [],
    status: "active",
    created_at: "2026-08-15T14:30:00.000000Z",
    updated_at: "2026-08-15T14:30:00.000000Z",
  },
  {
    id: 2,
    vendor_id: 7,
    category_id: 2,
    category: { id: 2, name: "Decoration" },
    name: "Luxury Flower Decoration",
    description: "Premium floral decoration for weddings and engagement parties.",
    price: 250,
    images_urls: [],
    status: "pending",
    created_at: "2026-08-14T12:20:00.000000Z",
    updated_at: "2026-08-14T12:20:00.000000Z",
  },
  {
    id: 3,
    vendor_id: 7,
    category_id: 3,
    category: { id: 3, name: "Catering" },
    name: "Premium Catering Service",
    description: "Full catering package for large events.",
    price: 600,
    images_urls: [],
    status: "pending_delete",
    created_at: "2026-08-13T10:10:00.000000Z",
    updated_at: "2026-08-15T09:00:00.000000Z",
  },
  {
    id: 4,
    vendor_id: 7,
    category_id: 4,
    category: { id: 4, name: "Transportation" },
    name: "Luxury Wedding Car",
    description: "Luxury decorated car for wedding events.",
    price: 180,
    images_urls: [],
    status: "inactive",
    created_at: "2026-08-12T11:45:00.000000Z",
    updated_at: "2026-08-12T11:45:00.000000Z",
  },
];

const notify = () => listeners.forEach((cb) => cb());

export function subscribeVendorServices(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// GET /api/vendor/services — newest first
export function getVendorServices() {
  return [...services].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getVendorServiceById(id) {
  return services.find((s) => String(s.id) === String(id));
}

// POST /api/vendor/services (mock)
export function addVendorService({ category_id, name, description, price, images_urls }) {
  const category = getServiceCategoryById(category_id);
  const now = new Date().toISOString();

  const service = {
    id: services.reduce((max, s) => Math.max(max, s.id), 0) + 1,
    vendor_id: 7,
    category_id: Number(category_id),
    category: category ? { id: category.id, name: category.name } : null,
    name,
    description,
    price: Number(price),
    images_urls: images_urls || [],
    status: "pending",
    created_at: now,
    updated_at: now,
  };
  services = [service, ...services];
  notify();
  return service;
}

// POST /api/vendor/services/{id} (mock update — category is not editable)
export function updateVendorService(id, { name, description, price, images_urls }) {
  services = services.map((s) =>
    String(s.id) === String(id)
      ? {
          ...s,
          name,
          description,
          price: Number(price),
          images_urls: images_urls || [],
          status: "pending",
          updated_at: new Date().toISOString(),
        }
      : s
  );
  notify();
}

// DELETE /api/vendor/services/{id} (mock — becomes a delete request)
export function requestDeleteVendorService(id) {
  services = services.map((s) =>
    String(s.id) === String(id)
      ? { ...s, status: "pending_delete", updated_at: new Date().toISOString() }
      : s
  );
  notify();
}

export function canModifyService(status) {
  return status === "active" || status === "inactive";
}

// Backend returns category as { id, name } — no Arabic name field.
export function categoryName(service) {
  return (
    service?.category?.name ||
    getServiceCategoryById(service?.category_id)?.name ||
    "-"
  );
}

export function categoryDescription(categoryId) {
  return getServiceCategoryById(categoryId)?.description || "";
}


export function formatServiceDate(value, ar) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(ar ? "ar" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatPrice(price) {
  if (price === undefined || price === null) return "-";
  return `${price} SYP`;
}
