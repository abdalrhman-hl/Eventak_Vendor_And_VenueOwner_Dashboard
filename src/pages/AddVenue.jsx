import { useNavigate } from "react-router-dom";
import { useLanguage } from "../lib/language.jsx";
import VenueForm from "../components/VenueForm.jsx";
import { addVenueRequest, setVenueFlash } from "../lib/venues.js";

// POST /api/venue-owner/venue -> creates a VenueRequest { type: "create", status: "pending" }
export default function AddVenue() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();

  const handleSubmit = (payload) => {
    addVenueRequest({ ...payload, venue_id: null, type: "create" });
    setVenueFlash(
      ar
        ? "تم إرسال طلب إضافة الصالة بنجاح وهو بانتظار مراجعة الإدارة."
        : "Venue request submitted successfully and is pending Admin review."
    );
    navigate("/venue-dashboard/venue-requests");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "طلب إضافة صالة" : "Add Venue Request"}</h1>
        <p className="mt-2 subtle">
          {ar
            ? "أرسل طلب إضافة صالة جديدة لمراجعة الإدارة."
            : "Submit a new venue request for Admin review."}
        </p>
      </div>

      <VenueForm
        submitLabel={ar ? "إرسال الطلب" : "Submit Request"}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/venue-dashboard/my-venues")}
      />
    </div>
  );
}
