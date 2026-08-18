const PROFILE_NAME_KEY = "eventak_profile_name";

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
