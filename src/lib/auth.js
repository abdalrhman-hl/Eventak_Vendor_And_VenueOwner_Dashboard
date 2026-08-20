import { ApiError, apiRequest } from "./api.js";
import { clearAccountType, setAccountType } from "./accountType.js";
import { normalizeBackendMediaUrl } from "./media.js";
import { setProfileName } from "./profile.js";

const TOKEN_KEY = "eventak-auth-token";
const USER_KEY = "eventak-auth-user";

export const AUTH_STORAGE_KEYS = {
  token: TOKEN_KEY,
  user: USER_KEY,
};

export const SUPPORTED_DASHBOARD_ROLES = ["vendor", "venue_owner"];

function requireSuccessResponse(payload) {
  if (payload?.status !== "success") {
    throw new ApiError("The server returned an unexpected response.", {
      kind: "unexpected_response",
    });
  }
  return payload;
}

export async function sendOtp(identity) {
  const payload = await apiRequest("/auth/send-otp", {
    method: "POST",
    body: identity,
  });
  return requireSuccessResponse(payload);
}

export async function verifyOtp(identity, otpCode) {
  const payload = await apiRequest("/auth/verify-otp", {
    method: "POST",
    body: { ...identity, otp_code: otpCode },
  });
  return requireSuccessResponse(payload);
}

export async function logout(token) {
  const payload = await apiRequest("/auth/logout", {
    method: "POST",
    token,
  });
  return requireSuccessResponse(payload);
}

export function saveAuthSession(token, user) {
  if (!token || !user || !SUPPORTED_DASHBOARD_ROLES.includes(user.role)) {
    throw new ApiError("The server returned an unexpected response.", {
      kind: "unexpected_response",
    });
  }

  const minimalUser = {
    id: user.id,
    name: user.name,
    role: user.role,
    avatar_url: normalizeBackendMediaUrl(user.avatar_url),
  };

  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(minimalUser));
    setAccountType(user.role);
    publishProfileName(user.name);
  } catch {
    clearAuthSession();
    throw new ApiError("The authenticated session could not be saved.", {
      kind: "storage",
    });
  }
}

export function syncAuthUserFromProfile(user) {
  if (!user || !SUPPORTED_DASHBOARD_ROLES.includes(user.role)) return false;

  const minimalUser = {
    id: user.id,
    name: user.name,
    role: user.role,
    avatar_url: normalizeBackendMediaUrl(user.avatar_url),
  };

  try {
    localStorage.setItem(USER_KEY, JSON.stringify(minimalUser));
    setAccountType(user.role);
    publishProfileName(user.name);
    return true;
  } catch {
    return false;
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthUser() {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Storage may be unavailable; account-type cleanup still runs below.
  }
  publishProfileName("");
  clearAccountType();
}

function publishProfileName(name) {
  setProfileName(name);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("eventak:profile-updated"));
  }
}
