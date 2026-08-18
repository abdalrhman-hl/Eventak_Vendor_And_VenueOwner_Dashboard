import { useRef, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { useLanguage } from "../lib/language.jsx";
import { getAccountType } from "../lib/accountType.js";

function maskEmail(e) {
  const [u, d] = e.split("@");
  if (!d) return e;
  const head = u.slice(0, 2);
  return `${head}${"•".repeat(Math.max(1, u.length - 2))}@${d}`;
}
function maskPhone(p) {
  const digits = p.replace(/\D/g, "");
  if (digits.length < 4) return p;
  const last = digits.slice(-3);
  const dial = p.split(" ")[0];
  return `${dial} •••• ${last}`;
}

export default function VerifyOtp() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const state = location.state;
  if (!state?.method) return <Navigate to="/account-type" replace />;
  const { method, identifier, portalEn, portalAr } = state;

  const masked = method === "email" ? maskEmail(identifier) : maskPhone(identifier);

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code];
    next[i] = v;
    setCode(next);
    if (error) setError("");
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (i, e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...code];
    for (let j = 0; j < pasted.length; j++) {
      if (i + j < 6) next[i + j] = pasted[j];
    }
    setCode(next);
    if (error) setError("");
    const focusIndex = Math.min(i + pasted.length, 5);
    setTimeout(() => inputs.current[focusIndex]?.focus(), 0);
  };

  const descEn = method === "email"
    ? "We sent a 6-digit verification code to your email."
    : "We sent a 6-digit verification code to your WhatsApp number.";
  const descAr = method === "email"
    ? "أرسلنا رمز تحقق مكوّنًا من 6 أرقام إلى بريدك الإلكتروني."
    : "أرسلنا رمز تحقق مكوّنًا من 6 أرقام إلى رقم واتساب الخاص بك.";

  const resendEn = method === "email" ? "Resend email" : "Resend via WhatsApp";
  const resendAr = method === "email" ? "إعادة إرسال البريد" : "إعادة الإرسال عبر واتساب";

  const validateAndSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (!fullCode) {
      setError(
        language === "ar"
          ? "يرجى إدخال رمز التحقق."
          : "Please enter the verification code."
      );
      return;
    }
    if (!/^\d{6}$/.test(fullCode)) {
      setError(
        language === "ar"
          ? "يجب أن يتكون رمز التحقق من 6 أرقام."
          : "The verification code must be 6 digits."
      );
      return;
    }
    setError("");
    const type = state.accountType || getAccountType();
    if (type === "venue") navigate("/venue-dashboard");
    else if (type === "vendor") navigate("/vendor-dashboard");
    else navigate("/account-type");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", padding: 24 }}>
      <div className="auth-card">
        <div className="mobile-brand" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Logo size={140} />
          <div className="brand-title" style={{ fontSize: 20 }}>{language === "ar" ? portalAr : portalEn}</div>
        </div>

        <div className="otp-card">
          <button type="button" onClick={() => navigate(-1)} className="back-link" dir={language === "ar" ? "rtl" : "ltr"} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <ArrowLeft size={16} style={{ transform: language === "ar" ? "scaleX(-1)" : "none" }} /> {language === "ar" ? "عودة" : "Back"}
          </button>

          <h1 className="heading-xl">{language === "ar" ? "تحقق من الرمز" : "Verify your code"}</h1>
          <p className="mt-2 small subtle">{language === "ar" ? descAr : descEn}</p>
          <p className="mt-2 small" style={{ fontWeight: 600 }} dir="ltr">{masked}</p>
          <p className="mt-2 small subtle">
            {language === "ar" ? "تم إرسال رمز التحقق إلى: " : "Verification code sent to: "}
            <span dir="ltr">{identifier || (method === "email" ? "vendor@eventak.com" : "+963944123456")}</span>
          </p>

          <form className="mt-8" onSubmit={validateAndSubmit}>
            <div className="otp-row" dir="ltr">
              {code.map((c, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={c}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKey(i, e)}
                  onPaste={(e) => handlePaste(i, e)}
                  className="otp-input"
                  aria-invalid={!!error}
                />
              ))}
            </div>

            {error && (
              <p className="mt-2" style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>
            )}

            <button type="submit" className="btn-primary mt-8">{language === "ar" ? "تأكيد" : "Verify"}</button>

            <p className="mt-6 text-center small subtle">
              {language === "ar" ? "لم تستلم الرمز؟" : "Didn't get the code?"}{" "}
              <button type="button" className="link-primary" style={{ padding: 0 }}>{language === "ar" ? resendAr : resendEn}</button>
            </p>

            <div className="mt-4" style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/login", { state: location.state })}
              >
                {language === "ar" ? "تغيير طريقة تسجيل الدخول" : "Change login method"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
