import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";
import VenueForm from "../components/VenueForm.jsx";
import { getVenueById, addVenueRequest, setVenueFlash } from "../lib/venues.js";

// PUT /api/venue-owner/venue/{id} -> creates a VenueRequest { type: "update", status: "pending" }
export default function EditVenueRequest() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ar = language === "ar";
  const venue = getVenueById(venueId);
  const BackIcon = ar ? ArrowRight : ArrowLeft;

  if (!venue) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="heading-xl">{ar ? "إرسال طلب تعديل" : "Submit Update Request"}</h1>
        </div>
        <div className="dashboard-card">
          <p style={{ color: "var(--muted-foreground)" }}>
            {ar ? "لم يتم العثور على الصالة." : "Venue not found."}
          </p>
          <button
            type="button"
            className="btn-venue"
            style={{ marginTop: 16 }}
            onClick={() => navigate("/venue-dashboard/my-venues")}
          >
            <BackIcon size={16} />
            <span>{ar ? "العودة إلى صالاتي" : "Back to My Venues"}</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (payload) => {
    addVenueRequest({ ...payload, venue_id: venue.id, type: "update" });
    setVenueFlash(
      ar
        ? "تم إرسال طلب التعديل بنجاح وهو بانتظار مراجعة الإدارة."
        : "Update request submitted successfully and is pending Admin review."
    );
    navigate("/venue-dashboard/venue-requests");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "إرسال طلب تعديل" : "Submit Update Request"}</h1>
        <p className="mt-2 subtle">
          {ar
            ? "سيتم إرسال التعديلات إلى الإدارة للموافقة، وستبقى الصالة الحالية نشطة حتى تتم الموافقة."
            : "Changes will be sent to Admin for approval. The current venue will remain active until approval."}
        </p>
      </div>

      <VenueForm
        initial={venue}
        submitLabel={ar ? "إرسال طلب التعديل" : "Submit Update Request"}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/venue-dashboard/my-venues/${venue.id}`)}
      />
    </div>
  );
}
