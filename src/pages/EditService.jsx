import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../lib/language.jsx";
import ServiceForm from "../components/ServiceForm.jsx";
import { getVendorServiceById, updateVendorService } from "../lib/vendorServices.js";

export default function EditService() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const service = getVendorServiceById(serviceId);

  if (!service) {
    return (
      <div>
        <h1 className="heading-xl">{ar ? "تعديل الخدمة" : "Edit Service"}</h1>
        <div className="dashboard-card" style={{ marginTop: 16 }}>
          <p className="subtle">{ar ? "لم يتم العثور على الخدمة." : "Service not found."}</p>
          <Link to="/vendor-dashboard/my-services" className="btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            {ar ? "العودة إلى خدماتي" : "Back to My Services"}
          </Link>
        </div>
      </div>
    );
  }

  // POST /api/vendor/services/{id} (mock — POST is used for update, not PUT)
  const handleSubmit = (payload) => {
    updateVendorService(service.id, payload);
    navigate("/vendor-dashboard/service-requests", {
      state: {
        flash: ar
          ? "تم إرسال تعديل الخدمة بنجاح وهو بانتظار مراجعة الإدارة."
          : "Service update submitted successfully and is pending Admin review.",
      },
    });
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

      <ServiceForm
        mode="edit"
        initial={service}
        submitLabel={ar ? "إرسال التعديل" : "Submit Update"}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/vendor-dashboard/my-services/${service.id}`)}
      />
    </div>
  );
}
