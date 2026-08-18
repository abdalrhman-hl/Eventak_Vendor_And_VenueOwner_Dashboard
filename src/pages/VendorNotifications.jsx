import NotificationsView from "../components/NotificationsView.jsx";
import { vendorNotifications, vendorNotificationRoutes } from "../lib/notifications.js";

export default function VendorNotifications() {
  return (
    <NotificationsView
      notifications={vendorNotifications}
      routes={vendorNotificationRoutes}
      subtitle="Stay updated with service approvals, booking cancellations, and payment notifications."
      subtitleAr="تابع تحديثات الموافقة على الخدمات وإلغاءات الحجوزات والمدفوعات."
      emptyDesc="New updates related to your services and event bookings will appear here."
      emptyDescAr="ستظهر هنا التحديثات الجديدة المتعلقة بخدماتك وحجوزات الفعاليات."
    />
  );
}
