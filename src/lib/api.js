export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, { status = 0, errors = null, kind = "api", hasBackendMessage = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.kind = kind;
    this.hasBackendMessage = hasBackendMessage;
  }
}

function firstValidationError(errors) {
  if (!errors || typeof errors !== "object") return "";

  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (typeof value === "string") return value;
  }

  return "";
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiRequest(path, { method = "GET", body, token, signal } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("Unable to connect to the server.", { kind: "network" });
  }

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    const responseMessage = typeof payload?.message === "string" ? payload.message.trim() : "";
    const validationMessage = firstValidationError(payload?.errors);
    const backendMessage = responseMessage || validationMessage;

    throw new ApiError(backendMessage || "The request could not be completed.", {
      status: response.status,
      errors: payload?.errors || null,
      kind: "api",
      hasBackendMessage: Boolean(backendMessage),
    });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError("The server returned an unexpected response.", {
      status: response.status,
      kind: "unexpected_response",
    });
  }

  return payload;
}

export function getApiErrorMessage(error, language = "en") {
  if (error instanceof ApiError && error.hasBackendMessage) return error.message;

  const ar = language === "ar";
  if (error instanceof ApiError && error.kind === "network") {
    return ar
      ? "تعذر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى."
      : "Unable to reach the server. Check your connection and try again.";
  }

  if (error instanceof ApiError && error.kind === "unexpected_response") {
    return ar
      ? "أعاد الخادم استجابة غير متوقعة. يرجى المحاولة مرة أخرى."
      : "The server returned an unexpected response. Please try again.";
  }

  return ar
    ? "تعذر إكمال الطلب. يرجى المحاولة مرة أخرى."
    : "The request could not be completed. Please try again.";
}
