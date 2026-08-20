import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VenueForm from "../components/VenueForm.jsx";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import { useLanguage } from "../lib/language.jsx";
import { createVenueRequest, setVenueFlash } from "../lib/venues.js";

export default function AddVenue() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [serverErrors, setServerErrors] = useState({});

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
      const payload = await createVenueRequest(token, values);
      setVenueFlash(payload.message || (ar ? "تم إرسال طلب إضافة الصالة وهو بانتظار مراجعة الإدارة." : "Venue request submitted and is pending Admin review."));
      navigate("/venue-dashboard/venue-requests");
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
        <h1 className="heading-xl">{ar ? "طلب إضافة صالة" : "Add Venue Request"}</h1>
        <p className="mt-2 subtle">{ar ? "أرسل طلب إضافة صالة جديدة لمراجعة الإدارة." : "Submit a new venue request for Admin review."}</p>
      </div>
      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}
      <VenueForm
        submitLabel={submitting ? (ar ? "جاري الإرسال..." : "Submitting...") : (ar ? "إرسال الطلب" : "Submit Request")}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/venue-dashboard/my-venues")}
        isSubmitting={submitting}
        serverErrors={serverErrors}
      />
    </div>
  );
}
