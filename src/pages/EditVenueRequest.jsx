import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import VenueForm from "../components/VenueForm.jsx";
import { getApiErrorMessage } from "../lib/api.js";
import { clearAuthSession, getAuthToken } from "../lib/auth.js";
import { useLanguage } from "../lib/language.jsx";
import { fetchMyVenues, setVenueFlash, updateVenueRequest } from "../lib/venues.js";

export default function EditVenueRequest() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ar = language === "ar";
  const BackIcon = ar ? ArrowRight : ArrowLeft;
  const [venue, setVenue] = useState(null);
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
    fetchMyVenues(token, controller.signal)
      .then((payload) => setVenue(payload.data.find((item) => String(item.id) === String(venueId)) || null))
      .catch((requestError) => {
        if (requestError?.name === "AbortError") return;
        if (requestError?.status === 401) {
          clearAuthSession();
          navigate("/account-type", { replace: true });
        } else setError(getApiErrorMessage(requestError, language));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [language, navigate, venueId]);

  const handleSubmit = async (values) => {
    if (!venue || submitting) return;
    setSubmitting(true);
    setError("");
    setServerErrors({});
    try {
      const payload = await updateVenueRequest(getAuthToken(), venue.id, values);
      setVenueFlash(payload.message || (ar ? "تم إرسال طلب التعديل وهو بانتظار مراجعة الإدارة." : "Update request submitted and is pending Admin review."));
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

  if (loading) return <div className="dashboard-card" style={{ textAlign: "center", padding: 48 }}>{ar ? "جاري تحميل الصالة..." : "Loading venue..."}</div>;
  if (!venue) {
    return (
      <div>
        <div className="mb-6"><h1 className="heading-xl">{ar ? "إرسال طلب تعديل" : "Submit Update Request"}</h1></div>
        <div className="dashboard-card">
          <p style={{ color: error ? "#b91c1c" : "var(--muted-foreground)" }}>{error || (ar ? "لم يتم العثور على الصالة ضمن صالاتك." : "Venue was not found in your venues.")}</p>
          <button type="button" className="btn-venue" style={{ marginTop: 16 }} onClick={() => navigate("/venue-dashboard/my-venues")}><BackIcon size={16} /><span>{ar ? "العودة إلى صالاتي" : "Back to My Venues"}</span></button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "إرسال طلب تعديل" : "Submit Update Request"}</h1>
        <p className="mt-2 subtle">{ar ? "سيتم إرسال التعديلات إلى الإدارة للموافقة، وستبقى الصالة الحالية دون تغيير حتى الموافقة." : "Changes will be sent to Admin for approval. The live venue remains unchanged until approval."}</p>
      </div>
      {error && <div role="alert" className="dashboard-card" style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>}
      <VenueForm
        initial={venue}
        submitLabel={submitting ? (ar ? "جاري الإرسال..." : "Submitting...") : (ar ? "إرسال طلب التعديل" : "Submit Update Request")}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/venue-dashboard/my-venues/${venue.id}`)}
        isSubmitting={submitting}
        serverErrors={serverErrors}
        allowImages={false}
      />
    </div>
  );
}
