import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext({ language: "en", toggle: () => {}, setLanguage: () => {} });

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("eventak-language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("eventak-language", language);
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
  }, [language]);

  const toggle = () => setLanguage((l) => (l === "en" ? "ar" : "en"));

  return (
    <LanguageContext.Provider value={{ language, toggle, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
