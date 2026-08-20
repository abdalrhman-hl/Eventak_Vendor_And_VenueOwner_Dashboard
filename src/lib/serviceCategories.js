import { ApiError, apiRequest } from "./api.js";
import { resolveLocalizedText } from "./venues.js";

export async function fetchServiceCategories(signal) {
  const payload = await apiRequest("/services/categories", { signal });
  if (payload?.status !== "success" || !Array.isArray(payload.data)) {
    throw new ApiError("The server returned an unexpected response.", {
      kind: "unexpected_response",
    });
  }
  return payload;
}

export function displayServiceCategoryName(category, ar = false) {
  const name = resolveLocalizedText(category?.name, ar);
  if (name) return name;
  if (category?.id !== undefined && category?.id !== null) {
    return ar ? `تصنيف بدون اسم (#${category.id})` : `Unnamed category (#${category.id})`;
  }
  return ar ? "تصنيف غير متاح" : "Category unavailable";
}

export function displayServiceCategoryDescription(category, ar = false) {
  return resolveLocalizedText(category?.description, ar);
}
