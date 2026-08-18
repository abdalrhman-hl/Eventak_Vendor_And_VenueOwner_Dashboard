// Frontend-only mock store shaped like the Laravel VenueController API.
// GET /api/venue-owner/venues  -> { status, count, data: Venue[] }
// GET /api/venue-owner/requests -> pending VenueRequest[] only

export const myVenues = [
  {
    id: 1,
    owner_id: 3,
    name: "Royal Wedding Hall",
    capacity: 300,
    price: 5000,
    address: "Damascus - Mazzeh",
    description: "Luxury venue for weddings and private events.",
    cover_image_url: null,
    images_urls: [],
    status: "active",
    created_at: "2026-08-15T14:30:00.000000Z",
  },
  {
    id: 2,
    owner_id: 3,
    name: "Crystal Ballroom",
    capacity: 180,
    price: 3500,
    address: "Damascus - Abu Rummaneh",
    description: "Elegant indoor ballroom for engagement parties.",
    cover_image_url: null,
    images_urls: [],
    status: "active",
    created_at: "2026-08-14T12:20:00.000000Z",
  },
];

export function getMyVenues() {
  return myVenues;
}

export function getVenueById(id) {
  return myVenues.find((v) => String(v.id) === String(id));
}

const KEY = "eventak-venue-requests";

const seedRequests = [
  {
    id: 101,
    owner_id: 3,
    venue_id: null,
    type: "create",
    name: "Moonlight Hall",
    capacity: 250,
    price: 4200,
    address: "Damascus - Kafr Sousa",
    description: "A modern hall for weddings and corporate events.",
    cover_image_url: null,
    images_urls: [],
    status: "pending",
    created_at: "2026-08-16T10:30:00.000000Z",
  },
  {
    id: 102,
    owner_id: 3,
    venue_id: 1,
    type: "update",
    name: "Royal Wedding Hall",
    capacity: 350,
    price: 5500,
    address: "Damascus - Mazzeh",
    description: "Updated venue details waiting for Admin approval.",
    cover_image_url: null,
    images_urls: [],
    status: "pending",
    created_at: "2026-08-15T15:45:00.000000Z",
  },
  {
    id: 103,
    owner_id: 3,
    venue_id: 2,
    type: "delete",
    name: "Crystal Ballroom",
    capacity: 180,
    price: 3500,
    address: "Damascus - Abu Rummaneh",
    description: null,
    cover_image_url: null,
    images_urls: [],
    status: "pending",
    created_at: "2026-08-14T18:00:00.000000Z",
  },
];

export function getVenueRequests() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedRequests;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((r) => r.status === "pending") : seedRequests;
  } catch {
    return seedRequests;
  }
}

export function getVenueRequestById(id) {
  return getVenueRequests().find((r) => String(r.id) === String(id));
}

export function addVenueRequest(req) {
  const list = getVenueRequests();
  const next = [
    {
      id: Date.now(),
      owner_id: 3,
      venue_id: null,
      cover_image_url: null,
      images_urls: [],
      status: "pending",
      created_at: new Date().toISOString(),
      ...req,
    },
    ...list,
  ];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function setVenueFlash(msg) {
  try {
    sessionStorage.setItem("venueRequestFlash", msg);
  } catch {}
}

export function takeVenueFlash() {
  try {
    const msg = sessionStorage.getItem("venueRequestFlash");
    if (msg) sessionStorage.removeItem("venueRequestFlash");
    return msg || "";
  } catch {
    return "";
  }
}

export const REQUEST_TYPE_LABEL = {
  create: { en: "Add Venue", ar: "إضافة صالة" },
  update: { en: "Update Venue", ar: "تعديل صالة" },
  delete: { en: "Delete Venue", ar: "حذف صالة" },
};

export const VENUE_STATUS_LABEL = {
  active: { en: "Active", ar: "نشطة" },
  inactive: { en: "Inactive", ar: "غير نشطة" },
  pending: { en: "Pending", ar: "قيد المراجعة" },
};

export function formatDate(iso, ar) {
  try {
    return new Date(iso).toLocaleDateString(ar ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatPrice(price) {
  if (price === undefined || price === null) return "-";
  return `${price} SYP`;
}
