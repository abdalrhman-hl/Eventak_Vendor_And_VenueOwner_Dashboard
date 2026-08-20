import { ApiError, apiRequest } from "./api.js";

function normalizeScore(value) {
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 5 ? score : null;
}

function normalizeOptionalText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function fetchVenueRatings(venueId, signal) {
  const payload = await apiRequest(`/venues/${venueId}/ratings`, { signal });
  if (payload?.status !== "success" || !payload.data || !Array.isArray(payload.data.ratings)) {
    throw new ApiError("The server returned an unexpected response.", { kind: "unexpected_response" });
  }

  const ratings = payload.data.ratings.map((rating) => ({
    rating: normalizeScore(rating?.rating),
    comment: normalizeOptionalText(rating?.comment),
    customer_name: normalizeOptionalText(rating?.customer_name),
    created_at: normalizeOptionalText(rating?.created_at),
  }));
  const average = normalizeScore(payload.data.average_rating) ?? 0;
  const count = Number(payload.data.ratings_count);

  return {
    ...payload,
    data: {
      average_rating: average,
      ratings_count: Number.isInteger(count) && count >= 0 ? count : ratings.length,
      ratings,
    },
  };
}

export function formatRatingValue(value) {
  return Number.isFinite(value) ? `${value} / 5` : "-";
}

export function formatRatingDate(iso, ar) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(ar ? "ar-EG" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}
