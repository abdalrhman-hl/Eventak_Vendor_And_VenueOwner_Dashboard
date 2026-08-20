import NotificationsView from "../components/NotificationsView.jsx";

export default function VenueNotifications() {
  return (
    <NotificationsView
      role="venue_owner"
      subtitle="Stay updated with venue requests, booking requests, cancellations, and payment notifications."
      subtitleAr="تابع تحديثات طلبات الصالات وطلبات الحجز والإلغاءات والمدفوعات."
      emptyDesc="New updates related to your venues and bookings will appear here."
      emptyDescAr="ستظهر هنا التحديثات الجديدة المتعلقة بصالاتك وحجوزاتك."
    />
  );
}
