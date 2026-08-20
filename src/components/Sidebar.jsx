import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, X, Package, ClipboardList, CalendarCheck, Bell, User, Building2, FileText } from "lucide-react";
import Logo from "./Logo.jsx";
import { useLanguage } from "../lib/language.jsx";
import { getAccountType, isVenueOwnerAccountType } from "../lib/accountType.js";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken, logout } from "../lib/auth.js";
import { getLatestUnreadCount, NOTIFICATION_COUNT_EVENT, publishUnreadCount } from "../lib/notifications.js";

const vendorItems = [
  { to: "/vendor-dashboard", label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/vendor-dashboard/my-services", label: "My Services", labelAr: "خدماتي", icon: Package },
  { to: "/vendor-dashboard/service-requests", label: "Service Requests", labelAr: "طلبات الخدمات", icon: ClipboardList },
  { to: "/vendor-dashboard/event-requests", label: "Event Requests", labelAr: "طلبات الفعاليات", icon: CalendarCheck },
  { to: "/vendor-dashboard/notifications", label: "Notifications", labelAr: "الإشعارات", icon: Bell },
  { to: "/vendor-dashboard/profile", label: "Profile", labelAr: "الملف الشخصي", icon: User },
];

const venueItems = [
  { to: "/venue-dashboard", label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/venue-dashboard/my-venues", label: "My Venues", labelAr: "صالاتي", icon: Building2 },
  { to: "/venue-dashboard/venue-requests", label: "Venue Requests", labelAr: "طلبات الصالات", icon: FileText },
  { to: "/venue-dashboard/event-requests", label: "Event Requests", labelAr: "طلبات الفعاليات", icon: CalendarCheck },
  
  { to: "/venue-dashboard/notifications", label: "Notifications", labelAr: "الإشعارات", icon: Bell },
  { to: "/venue-dashboard/profile", label: "Profile", labelAr: "الملف الشخصي", icon: User },
];

export default function Sidebar({ open, onClose }) {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [unreadCount, setUnreadCount] = useState(() => getLatestUnreadCount());
  const accountType = getAccountType() || "vendor";
  const isVenue = isVenueOwnerAccountType(accountType);
  const items = isVenue ? venueItems : vendorItems;

  const brandTitle = isVenue
    ? (language === "ar" ? "صاحب صالة" : "Venue Owner")
    : (language === "ar" ? "مورد" : "Vendor");
  const brandSub = language === "ar" ? "لوحة التحكم" : "Dashboard";
  const homeTo = isVenue ? "/venue-dashboard" : "/vendor-dashboard";

  useEffect(() => {
    const handleCount = (event) => setUnreadCount(event.detail?.count || 0);
    window.addEventListener(NOTIFICATION_COUNT_EVENT, handleCount);
    return () => window.removeEventListener(NOTIFICATION_COUNT_EVENT, handleCount);
  }, []);

  const finishLogout = () => {
    clearAuthSession();
    publishUnreadCount(0);
    onClose?.();
    navigate("/account-type", { replace: true });
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    if (isLoggingOut) return;

    const token = getAuthToken();
    if (!token) {
      finishLogout();
      return;
    }

    setLogoutError("");
    setIsLoggingOut(true);
    try {
      await logout(token);
      finishLogout();
    } catch (error) {
      if (error?.status === 401) {
        finishLogout();
        return;
      }
      setLogoutError(getApiErrorMessage(error, language));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <Link to={homeTo} className="sidebar-brand">
            <Logo size={120} />
            <div>
              <div className="brand-title">{brandTitle}</div>
              <div className="brand-sub">{brandSub}</div>
            </div>
          </Link>
          <button onClick={onClose} className="sidebar-close" aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map(({ to, label, labelAr, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{language === "ar" ? labelAr : label}</span>
                {to.endsWith("/notifications") && unreadCount > 0 && (
                  <span className="notif-badge" style={{ position: "static", marginInlineStart: "auto" }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <a
            href="/account-type"
            onClick={handleLogout}
            className="nav-link"
            aria-disabled={isLoggingOut}
            style={isLoggingOut ? { opacity: 0.7, pointerEvents: "none" } : undefined}
          >
            <LogOut size={18} />
            <span>
              {isLoggingOut
                ? (language === "ar" ? "جارٍ تسجيل الخروج..." : "Logging out...")
                : (language === "ar" ? "تسجيل الخروج" : "Logout")}
            </span>
          </a>
          {logoutError && (
            <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }} role="alert">
              {logoutError}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
