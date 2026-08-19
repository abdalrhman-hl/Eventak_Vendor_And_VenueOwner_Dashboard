const KEY = "eventak-account-type";

export function setAccountType(type) {
  try { localStorage.setItem(KEY, type); } catch { /* Storage may be unavailable. */ }
}

export function getAccountType() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function clearAccountType() {
  try { localStorage.removeItem(KEY); } catch { /* Storage may be unavailable. */ }
}

export function isVenueOwnerAccountType(type) {
  return type === "venue_owner" || type === "venue";
}
