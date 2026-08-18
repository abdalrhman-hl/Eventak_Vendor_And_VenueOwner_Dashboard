import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Mail, MessageCircle, ArrowRight, ArrowLeft, Moon, Sun, Phone } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { useTheme } from "../lib/theme.jsx";
import { useLanguage } from "../lib/language.jsx";

const SYRIA_DIAL = "+963";
const SYRIAN_PHONE_REGEX = /^9\d{8}$/;

export default function VendorLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const { language, toggle: toggleLanguage } = useLanguage();

  const state = location.state;
  if (!state?.accountType) return <Navigate to="/account-type" replace />;
  const { accountType, portalEn, portalAr } = state;

  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (method === "whatsapp") {
      if (!SYRIAN_PHONE_REGEX.test(phone)) {
        setPhoneError(
          language === "ar"
            ? "يرجى إدخال رقم واتساب سوري صالح."
            : "Please enter a valid Syrian WhatsApp number."
        );
        return;
      }
      setPhoneError("");
    }
    const identifier = method === "email" ? email : `${SYRIA_DIAL} ${phone}`;
    navigate("/verify-otp", { state: { accountType, portalEn, portalAr, method, identifier } });
  };

  return (
    <div className="auth-shell">
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 50, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={toggle} className="icon-btn" aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={toggleLanguage} className="icon-btn lang-btn" aria-label="Toggle language">
          {language === "en" ? "EN" : "AR"}
        </button>
      </div>

      <div className="auth-hero">
        <div className="auth-blob tr" />
        <div className="auth-blob bl" />
        <div className="sidebar-brand hero-content" style={{ flexDirection: "column", alignItems: "center" }}>
          <Logo size={160} />
          <div>
            <div className="brand-sub" style={{ color: "white" }}>{language === "ar" ? portalAr : portalEn}</div>
          </div>
        </div>
        <div className="hero-content">
          <h2 className="heading-display">
            {language === "ar" ? "اصنع لحظات لا تُنسى." : <>Craft unforgettable<br />moments.</>}
          </h2>
          <p className="mt-4 max-md" style={{ color: "rgba(234,245,248,0.7)" }}>
            {language === "ar" ? "قم بإدارة عروضك الفاخرة وتنمية مشغلك مع Eventak." : "Manage your luxury offerings and grow your atelier with Eventak."}
          </p>
        </div>
        <div className="footer-note">© {new Date().getFullYear()} Eventak. Curated event excellence.</div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="mobile-brand">
            <Logo size={120} />
            <div className="brand-title" style={{ fontSize: 20 }}>{language === "ar" ? portalAr : portalEn}</div>
          </div>

          <button type="button" className="back-link" dir={language === "ar" ? "rtl" : "ltr"} onClick={() => navigate("/account-type")} style={{ background: "transparent", border: "none", cursor: "pointer", marginBottom: 16 }}>
            <ArrowLeft size={16} style={{ transform: language === "ar" ? "scaleX(-1)" : "none" }} /> {language === "ar" ? "تغيير نوع الحساب" : "Change account type"}
          </button>

          <h1 className="heading-xl">{language === "ar" ? "تسجيل الدخول" : "log in"}</h1>
          <p className="mt-2 subtle">
            {language === "ar" ? "اختر طريقة تلقي رمز التحقق." : "Choose how you want to receive your verification code."}
          </p>

          <div className="segmented mt-6" role="tablist">
            <button type="button" role="tab" aria-selected={method === "email"} className={`segmented-item ${method === "email" ? "active" : ""}`} onClick={() => setMethod("email")}>
              <Mail size={16} /> {language === "ar" ? "البريد الإلكتروني" : "Email"}
            </button>
            <button type="button" role="tab" aria-selected={method === "whatsapp"} className={`segmented-item ${method === "whatsapp" ? "active" : ""}`} onClick={() => setMethod("whatsapp")}>
              <MessageCircle size={16} /> {language === "ar" ? "واتساب" : "WhatsApp"}
            </button>
          </div>

          <form className="mt-6 form-stack" onSubmit={submit}>
            {method === "email" ? (
              <div>
                <label className="label">{language === "ar" ? "البريد الإلكتروني" : "Email address"}</label>
                <div className="input-wrap">
                  <Mail size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === "ar" ? "بريدك@مثال.com" : "YourMail@mail.com"}
                    className="input"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="label">{language === "ar" ? "رقم الهاتف" : "Phone number"}</label>
                <div className="phone-wrap" dir="ltr">
                  <div className="dial-select" aria-label="Country code" style={{ display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", fontWeight: 600 }}>
                    🇸🇾 {SYRIA_DIAL}
                  </div>
                  <div className="input-wrap" style={{ flex: 1, marginTop: 0 }}>
                    <Phone size={16} />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 9));
                        if (phoneError) setPhoneError("");
                      }}
                      placeholder="9XXXXXXXX"
                      maxLength={9}
                      inputMode="numeric"
                      className="input"
                      aria-invalid={!!phoneError}
                    />
                  </div>
                </div>
                {phoneError && (
                  <p className="mt-2" style={{ color: "#ef4444", fontSize: 13 }}>{phoneError}</p>
                )}
              </div>
            )}

            <button type="submit" className="btn-primary">
              {method === "email"
                ? (language === "ar" ? "إرسال الرمز عبر البريد الإلكتروني" : "Send code by email")
                : (language === "ar" ? "إرسال الرمز عبر واتساب" : "Send code via WhatsApp")}
              <ArrowRight size={16} style={{ transform: language === "ar" ? "scaleX(-1)" : "none" }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
