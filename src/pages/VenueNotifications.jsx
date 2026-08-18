import NotificationsView from "../components/NotificationsView.jsx";
import { venueNotifications, venueNotificationRoutes } from "../lib/notifications.js";

export default function VenueNotifications() {
  return (
    <NotificationsView
      notifications={venueNotifications}
      routes={venueNotificationRoutes}
      subtitle="Stay updated with venue requests, booking requests, cancellations, and payment notifications."
      subtitleAr="تابع تحديثات طلبات الصالات وطلبات الحجز والإلغاءات والمدفوعات."
      emptyDesc="New updates related to your venues and bookings will appear here."
      emptyDescAr="ستظهر هنا التحديثات الجديدة المتعلقة بصالاتك وحجوزاتك."
    />
  );
}
