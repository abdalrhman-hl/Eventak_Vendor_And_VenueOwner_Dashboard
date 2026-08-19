import { useNavigate } from "react-router-dom";
import { Store, Building2, ArrowRight, Moon, Sun } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { useTheme } from "../lib/theme.jsx";
import { useLanguage } from "../lib/language.jsx";
import { setAccountType } from "../lib/accountType.js";

const TYPES = [
  { id: "vendor", icon: Store, en: "Vendor", ar: "مورد", enPortal: "Vendor Portal", arPortal: "بوابة الموردين", enDesc: "Sell products and services to event organizers.", arDesc: "بيع المنتجات والخدمات لمنظمي الفعاليات." },
  { id: "venue_owner", icon: Building2, en: "Venue Owner", ar: "صاحب صالة", enPortal: "Venue Owner Portal", arPortal: "بوابة أصحاب الصالات", enDesc: "Manage your venues and incoming bookings.", arDesc: "أدر صالاتك والحجوزات الواردة." },
];

export default function AccountType() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { language, toggle: toggleLanguage } = useLanguage();

  const select = (t) => {
    setAccountType(t.id);
    navigate("/login", { state: { accountType: t.id, portalEn: t.enPortal, portalAr: t.arPortal } });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", padding: 24 }}>
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 50, display: "flex", gap: 8 }}>
        <button onClick={toggle} className="icon-btn" aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={toggleLanguage} className="icon-btn lang-btn" aria-label="Toggle language">
          {language === "en" ? "EN" : "AR"}
        </button>
      </div>

      <div style={{ width: "100%", maxWidth: 720 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <Logo size={120} />
          <h1 className="heading-xl mt-4" style={{ textAlign: "center" }}>
            {language === "ar" ? "اختر نوع الحساب" : "Choose your account type"}
          </h1>
          <p className="mt-2 subtle small" style={{ textAlign: "center" }}>
            {language === "ar" ? "حدّد كيف ستستخدم Eventak للمتابعة." : "Select how you'll use Eventak to continue."}
          </p>
        </div>

        <div className="account-type-grid">
          {TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} type="button" className="account-type-card" onClick={() => select(t)}>
                <div className="account-type-icon"><Icon size={28} /></div>
                <div style={{ flex: 1 }}>
                  <div className="account-type-title">{language === "ar" ? t.ar : t.en}</div>
                  <div className="subtle small mt-2">{language === "ar" ? t.arDesc : t.enDesc}</div>
                </div>
                <ArrowRight size={18} style={{ color: "var(--primary)", transform: language === "ar" ? "scaleX(-1)" : "none" }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
