import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../lib/language.jsx";
import ServiceForm from "../components/ServiceForm.jsx";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import { canModifyService, fetchVendorServices, updateVendorService } from "../lib/vendorServices.js";

export default function EditService() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [serverErrors, setServerErrors] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    const token = getAuthToken();
    if (!token) {
      clearAuthSession();
      navigate("/account-type", { replace: true });
      return () => controller.abort();
    }
    fetchVendorServices(token, controller.signal)
      .then((payload) => setService(payload.data.find((item) => String(item.id) === String(serviceId)) || null))
      .catch((requestError) => {
        if (requestError?.name === "AbortError") return;
        if (requestError?.status === 401) {
          clearAuthSession();
          navigate("/account-type", { replace: true });
        } else setError(getApiErrorMessage(requestError, language));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [language, navigate, serviceId]);

  if (loading) {
    return <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>{ar ? "جاري تحميل الخدمة..." : "Loading service..."}</div>;
  }

  if (!service || !canModifyService(service.status)) {
    return (
      <div>
        <h1 className="heading-xl">{ar ? "تعديل الخدمة" : "Edit Service"}</h1>
        <div className="dashboard-card" style={{ marginTop: 16 }}>
          <p className="subtle">{error || (service
            ? (ar ? "لا يمكن تعديل خدمة قيد مراجعة الإدارة." : "A service pending Admin review cannot be edited.")
            : (ar ? "لم يتم العثور على الخدمة." : "Service not found."))}</p>
          <Link to="/vendor-dashboard/my-services" className="btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            {ar ? "العودة إلى خدماتي" : "Back to My Services"}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (values) => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setServerErrors({});
    try {
      const payload = await updateVendorService(getAuthToken(), service.id, values);
      navigate("/vendor-dashboard/service-requests", {
        state: { flash: payload.message || (ar
          ? "تم إرسال تعديل الخدمة بنجاح وهو بانتظار مراجعة الإدارة."
          : "Service update submitted successfully and is pending Admin review.") },
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
        <h1 className="heading-xl">{ar ? "تعديل الخدمة" : "Edit Service"}</h1>
        <p className="mt-2 subtle">
          {ar
            ? "سيتم إرسال التعديلات إلى الإدارة للمراجعة، وستصبح حالة الخدمة قيد المراجعة."
            : "Changes will be sent to Admin for review. The service status will become pending."}
        </p>
      </div>

      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}

      <ServiceForm
        mode="edit"
        initial={service}
        submitLabel={submitting ? (ar ? "جاري الإرسال..." : "Submitting...") : (ar ? "إرسال التعديل" : "Submit Update")}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/vendor-dashboard/my-services/${service.id}`)}
        isSubmitting={submitting}
        serverErrors={serverErrors}
      />
    </div>
  );
}
