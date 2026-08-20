const LOCAL_BACKEND_HOSTS = new Set(["127.0.0.1:8000", "localhost:8000", "localhost"]);

export function normalizeBackendMediaUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const mediaUrl = value.trim();
  if (mediaUrl.startsWith("blob:") || mediaUrl.startsWith("data:") || mediaUrl.startsWith("/storage/")) {
    return mediaUrl;
  }
  if (!mediaUrl.includes("://")) {
    return `/storage/${mediaUrl.replace(/^\/?storage\//, "").replace(/^\/+/, "")}`;
  }
  try {
    const parsed = new URL(mediaUrl);
    if (LOCAL_BACKEND_HOSTS.has(parsed.host) && parsed.pathname.startsWith("/storage/")) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch { return mediaUrl; }
  return mediaUrl;
}
