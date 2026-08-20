import NotificationsView from "../components/NotificationsView.jsx";

export default function VendorNotifications() {
  return (
    <NotificationsView
      role="vendor"
      subtitle="Stay updated with service approvals, booking cancellations, and payment notifications."
      subtitleAr="تابع تحديثات الموافقة على الخدمات وإلغاءات الحجوزات والمدفوعات."
      emptyDesc="New updates related to your services and event bookings will appear here."
      emptyDescAr="ستظهر هنا التحديثات الجديدة المتعلقة بخدماتك وحجوزات الفعاليات."
    />
  );
}
