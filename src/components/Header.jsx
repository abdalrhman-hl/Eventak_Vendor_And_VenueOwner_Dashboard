import { Menu, Search, Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme.jsx";
import { useLanguage } from "../lib/language.jsx";
import { getAccountType, isVenueOwnerAccountType } from "../lib/accountType.js";
import { getProfileName, getInitials } from "../lib/profile.js";
import { getAuthUser } from "../lib/auth.js";
import { mockUnreadCount } from "../lib/notifications.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header({ onMenuClick }) {
  const { theme, toggle } = useTheme();
  const { language, toggle: toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isVenue = isVenueOwnerAccountType(getAccountType() || "vendor");
  const [userName, setUserName] = useState(() => getProfileName());
  const [avatarUrl, setAvatarUrl] = useState(() => getAuthUser()?.avatar_url || null);

  useEffect(() => {
    function updateProfile() {
      const authUser = getAuthUser();
      setUserName(getProfileName() || authUser?.name || "");
      setAvatarUrl(authUser?.avatar_url || null);
    }
    updateProfile();
    window.addEventListener("storage", updateProfile);
    window.addEventListener("eventak:profile-updated", updateProfile);
    return () => {
      window.removeEventListener("storage", updateProfile);
      window.removeEventListener("eventak:profile-updated", updateProfile);
    };
  }, []);

  const displayName = userName || (isVenue
    ? (language === "ar" ? "صاحب الصالة" : "Venue Owner")
    : (language === "ar" ? "المورد" : "Vendor"));

  const userRole = isVenue
    ? (language === "ar" ? "ملف صاحب الصالة" : "Venue Owner Profile")
    : (language === "ar" ? "ملف المورد" : "Vendor Profile");

  const unreadCount = mockUnreadCount;

  function handleNotifClick() {
    const path = location.pathname;
    if (path.startsWith("/vendor-dashboard")) {
      navigate("/vendor-dashboard/notifications");
    } else if (path.startsWith("/venue-dashboard")) {
      navigate("/venue-dashboard/notifications");
    } else {
      navigate(isVenue ? "/venue-dashboard/notifications" : "/vendor-dashboard/notifications");
    }
  }

  const path = location.pathname;
  const isVenueRoute = path.startsWith("/venue-dashboard");
  const searchPlaceholder = isVenueRoute
    ? (language === "ar" ? "البحث في الصالات والطلبات..." : "Search venues, requests...")
    : (language === "ar" ? "البحث في الخدمات والطلبات..." : "Search services, requests...");

  return (
    <header className="header">
      <button onClick={onMenuClick} className="icon-btn menu-btn" aria-label="Open sidebar">
        <Menu size={20} />
      </button>

      <div className="search-wrap">
        <Search size={16} />
        <input type="text" placeholder={searchPlaceholder} className="search-input" />
      </div>

      <div className="header-right">
        <button onClick={toggle} className="icon-btn" aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={toggleLanguage} className="icon-btn lang-btn" aria-label="Toggle language">
          {language === "en" ? "EN" : "AR"}
        </button>
        <button
          onClick={handleNotifClick}
          className="icon-btn notif-wrap"
          aria-label={language === "ar" ? "الإشعارات" : "Notifications"}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount}</span>
          )}
        </button>
        <div className="user-block" onClick={() => navigate(isVenue ? "/venue-dashboard/profile" : "/vendor-dashboard/profile")} style={{ cursor: "pointer" }}>
          <div className="user-text">
            <div className="user-name">{displayName}</div>
            <div className="user-role">&nbsp;{userRole}&nbsp;</div>
          </div>
          <div className="avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }}
              />
            ) : getInitials(displayName)}
          </div>
        </div>
      </div>
    </header>
  );
}
