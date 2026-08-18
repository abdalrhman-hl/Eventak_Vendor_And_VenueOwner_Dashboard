const KEY = "eventak-account-type";

export function setAccountType(type) {
  try { localStorage.setItem(KEY, type); } catch {}
}

export function getAccountType() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function clearAccountType() {
  try { localStorage.removeItem(KEY); } catch {}
}
