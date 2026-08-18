import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, X, Package, ClipboardList, CalendarCheck, Bell, User, Building2, CalendarDays, FileText } from "lucide-react";
import Logo from "./Logo.jsx";
import { useLanguage } from "../lib/language.jsx";
import { getAccountType, clearAccountType } from "../lib/accountType.js";

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
  const accountType = getAccountType() || "vendor";
  const isVenue = accountType === "venue";
  const items = isVenue ? venueItems : vendorItems;

  const brandTitle = isVenue
    ? (language === "ar" ? "صاحب صالة" : "Venue Owner")
    : (language === "ar" ? "مورد" : "Vendor");
  const brandSub = language === "ar" ? "لوحة التحكم" : "Dashboard";
  const homeTo = isVenue ? "/venue-dashboard" : "/vendor-dashboard";

  const handleLogout = (e) => {
    e.preventDefault();
    clearAccountType();
    onClose?.();
    navigate("/account-type");
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
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <a href="/account-type" onClick={handleLogout} className="nav-link">
            <LogOut size={18} />
            <span>{language === "ar" ? "تسجيل الخروج" : "Logout"}</span>
          </a>
        </div>
      </aside>
    </>
  );
}
