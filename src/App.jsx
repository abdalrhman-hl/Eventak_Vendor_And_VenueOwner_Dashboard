import { Routes, Route, Navigate } from "react-router-dom";
import AccountType from "./pages/AccountType.jsx";
import VendorLogin from "./pages/VendorLogin.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MyServices from "./pages/MyServices.jsx";
import ServiceDetails from "./pages/ServiceDetails.jsx";
import AddService from "./pages/AddService.jsx";
import EditService from "./pages/EditService.jsx";
import ServiceRequests from "./pages/ServiceRequests.jsx";
import MyVenues from "./pages/MyVenues.jsx";
import AddVenue from "./pages/AddVenue.jsx";
import EditVenueRequest from "./pages/EditVenueRequest.jsx";
import VenueRequests from "./pages/VenueRequests.jsx";
import VenueDashboard from "./pages/VenueDashboard.jsx";
import VenueDetails from "./pages/VenueDetails.jsx";
import VenueRequestDetails from "./pages/VenueRequestDetails.jsx";
import EventRequests from "./pages/EventRequests.jsx";
import EventRequestDetails from "./pages/EventRequestDetails.jsx";
import VenueEventRequests from "./pages/VenueEventRequests.jsx";
import VenueEventRequestDetails from "./pages/VenueEventRequestDetails.jsx";
import VenueNotifications from "./pages/VenueNotifications.jsx";
import VenueOwnerProfile from "./pages/VenueOwnerProfile.jsx";
import VendorNotifications from "./pages/VendorNotifications.jsx";
import VendorProfile from "./pages/VendorProfile.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/account-type" replace />} />
      <Route path="/account-type" element={<AccountType />} />
      <Route path="/login" element={<VendorLogin />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Navigate to="/vendor-dashboard" replace />} />
        <Route path="/vendor-dashboard" element={<Dashboard />} />
        <Route path="/vendor-dashboard/my-services" element={<MyServices />} />
        <Route path="/vendor-dashboard/my-services/:serviceId" element={<ServiceDetails />} />
        <Route path="/vendor-dashboard/my-services/:serviceId/edit" element={<EditService />} />
        <Route path="/vendor-dashboard/add-service" element={<AddService />} />
        <Route path="/vendor-dashboard/service-requests" element={<ServiceRequests />} />
        <Route path="/vendor-dashboard/my-products" element={<Navigate to="/vendor-dashboard/my-services" replace />} />
        <Route path="/vendor-dashboard/add-product-request" element={<Navigate to="/vendor-dashboard/add-service" replace />} />
        <Route path="/vendor-dashboard/product-requests" element={<Navigate to="/vendor-dashboard/service-requests" replace />} />
        <Route path="/vendor-dashboard/event-requests" element={<EventRequests />} />
        <Route path="/vendor-dashboard/event-requests/:requestId" element={<EventRequestDetails />} />
        <Route path="/vendor-dashboard/notifications" element={<VendorNotifications />} />
        <Route path="/vendor-dashboard/profile" element={<VendorProfile />} />
        <Route path="/venue-dashboard" element={<VenueDashboard />} />
        <Route path="/venue-dashboard/my-venues" element={<MyVenues />} />
        <Route path="/venue-dashboard/my-venues/:venueId" element={<VenueDetails />} />
        <Route path="/venue-dashboard/my-venues/:venueId/edit" element={<EditVenueRequest />} />
        <Route path="/venue-dashboard/add-venue" element={<AddVenue />} />
        <Route path="/venue-dashboard/venue-requests" element={<VenueRequests />} />
        <Route path="/venue-dashboard/venue-requests/:requestId" element={<VenueRequestDetails />} />
        <Route path="/venue-dashboard/event-requests" element={<VenueEventRequests />} />
        <Route path="/venue-dashboard/event-requests/:eventId" element={<VenueEventRequestDetails />} />
        <Route path="/venue-dashboard/notifications" element={<VenueNotifications />} />
        <Route path="/venue-dashboard/profile" element={<VenueOwnerProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/account-type" replace />} />
    </Routes>
  );
}
