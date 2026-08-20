import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../lib/language.jsx";
import ServiceForm from "../components/ServiceForm.jsx";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import { fetchServiceCategories } from "../lib/serviceCategories.js";
import { createVendorService } from "../lib/vendorServices.js";

export default function AddService() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [serverErrors, setServerErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchServiceCategories(controller.signal)
      .then((payload) => setCategories(payload.data))
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") {
          setCategories([]);
          setCategoriesError(requestError);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleSubmit = async (values) => {
    if (submitting) return;
    const token = getAuthToken();
    if (!token) {
      clearAuthSession();
      navigate("/account-type", { replace: true });
      return;
    }
    setSubmitting(true);
    setError("");
    setServerErrors({});
    try {
      const payload = await createVendorService(token, values);
      navigate("/vendor-dashboard/service-requests", {
        state: { flash: payload.message || (ar
          ? "تم إرسال الخدمة بنجاح وهي بانتظار مراجعة الإدارة."
          : "Service submitted successfully and is pending Admin review.") },
      });
    } catch (requestError) {
      if (requestError?.status === 401) {
        clearAuthSession();
        navigate("/account-type", { replace: true });
      } else {
        setError(getApiErrorMessage(requestError, language));
        setServerErrors(requestError?.errors || {});
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "إضافة خدمة" : "Add Service"}</h1>
        <p className="mt-2 subtle">
          {ar ? "أرسل خدمة جديدة لمراجعة الإدارة." : "Submit a new service for Admin review."}
        </p>
      </div>

      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}

      <ServiceForm
        mode="create"
        submitLabel={submitting ? (ar ? "جاري الإرسال..." : "Submitting...") : (ar ? "إرسال الخدمة" : "Submit Service")}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/vendor-dashboard/my-services")}
        isSubmitting={submitting}
        serverErrors={serverErrors}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError ? getApiErrorMessage(categoriesError, language) : ""}
      />
    </div>
  );
}
