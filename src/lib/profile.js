import { ApiError, apiRequest } from "./api.js";

const PROFILE_NAME_KEY = "eventak_profile_name";

function requireSuccess(payload, requireData = false) {
  if (
    payload?.status !== "success" ||
    (requireData && (!payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)))
  ) {
    throw new ApiError("The server returned an unexpected response.", {
      kind: "unexpected_response",
    });
  }
  return payload;
}

export async function fetchUserProfile(token) {
  const payload = await apiRequest("/user/profile", { token });
  return requireSuccess(payload, true).data;
}

export async function updateUserProfile(token, fields) {
  const payload = await apiRequest("/user/profile", {
    method: "PUT",
    token,
    body: fields,
  });
  return requireSuccess(payload, true);
}

export async function uploadUserAvatar(token, file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const payload = await apiRequest("/user/avatar", {
    method: "POST",
    token,
    body: formData,
  });
  return requireSuccess(payload);
}

export async function deleteUserAvatar(token) {
  const payload = await apiRequest("/user/avatar", {
    method: "DELETE",
    token,
  });
  return requireSuccess(payload);
}

export function getProfileName() {
  try {
    return localStorage.getItem(PROFILE_NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function setProfileName(name) {
  try {
    if (name) {
      localStorage.setItem(PROFILE_NAME_KEY, String(name));
    } else {
      localStorage.removeItem(PROFILE_NAME_KEY);
    }
  } catch {
    // ignore
  }
}

export function getInitials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
