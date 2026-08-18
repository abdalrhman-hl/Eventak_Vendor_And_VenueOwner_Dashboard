import { useNavigate } from "react-router-dom";
import { useLanguage } from "../lib/language.jsx";
import ServiceForm from "../components/ServiceForm.jsx";
import { addVendorService } from "../lib/vendorServices.js";

export default function AddService() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();

  // POST /api/vendor/services (mock)
  const handleSubmit = (payload) => {
    addVendorService(payload);
    navigate("/vendor-dashboard/service-requests", {
      state: {
        flash: ar
          ? "تم إرسال الخدمة بنجاح وهي بانتظار مراجعة الإدارة."
          : "Service submitted successfully and is pending Admin review.",
      },
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "إضافة خدمة" : "Add Service"}</h1>
        <p className="mt-2 subtle">
          {ar ? "أرسل خدمة جديدة لمراجعة الإدارة." : "Submit a new service for Admin review."}
        </p>
      </div>

      <ServiceForm
        mode="create"
        submitLabel={ar ? "إرسال الخدمة" : "Submit Service"}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/vendor-dashboard/my-services")}
      />
    </div>
  );
}
