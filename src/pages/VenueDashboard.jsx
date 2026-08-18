import { CalendarCheck, ClipboardList, CalendarDays, Bell } from "lucide-react";
import { useLanguage } from "../lib/language.jsx";

const mockEventRequests = [
  { id: "VR-218", title: "Royal Wedding Reception", titleAr: "حفل زفاف ملكي", organizer: "Al-Noor Events", organizerAr: "النور للفعاليات", date: "2026-07-15", status: "Pending", statusAr: "قيد المراجعة" },
  { id: "VR-217", title: "Corporate Gala 2026", titleAr: "حفل الشركات 2026", organizer: "Vision Group", organizerAr: "مجموعة الرؤية", date: "2026-07-22", status: "Pending", statusAr: "قيد المراجعة" },
  { id: "VR-215", title: "Graduation Ceremony", titleAr: "حفل تخرّج", organizer: "Future Academy", organizerAr: "أكاديمية المستقبل", date: "2026-08-04", status: "Pending", statusAr: "قيد المراجعة" },
];

const mockUpcoming = [
  { id: "EV-501", title: "Hassan & Mariam Wedding", titleAr: "زفاف حسن ومريم", date: "2026-06-28", time: "7:00 PM" },
  { id: "EV-498", title: "TechCo Annual Summit", titleAr: "قمة TechCo السنوية", date: "2026-07-03", time: "10:00 AM" },
  { id: "EV-495", title: "Engagement of Layla", titleAr: "خطوبة ليلى", date: "2026-07-12", time: "8:30 PM" },
];

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="dashboard-card stat-card">
      <div className="stat-icon" style={{ background: accent }}>
        <Icon size={22} />
      </div>
      <div className="stat-meta">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

export default function VenueDashboard() {
  const { language } = useLanguage();
  const ar = language === "ar";

  const stats = [
    { icon: CalendarCheck, label: ar ? "الفعاليات القادمة" : "Upcoming Events", value: 8, accent: "linear-gradient(135deg,#22819a,#1b6a80)" },
    { icon: ClipboardList, label: ar ? "طلبات الفعاليات المعلقة" : "Pending Event Requests", value: 5, accent: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { icon: CalendarDays, label: ar ? "المواعيد المتاحة" : "Available Dates", value: 14, accent: "linear-gradient(135deg,#7c5bf6,#6a47ea)" },
    { icon: Bell, label: ar ? "الإشعارات غير المقروءة" : "Unread Notifications", value: 3, accent: "linear-gradient(135deg,#ef4444,#dc2626)" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-xl">{ar ? "مرحبًا بك في Eventak" : "Welcome to Eventak"}</h1>
        <p className="mt-2 subtle">
          {ar ? "نظرة عامة على نشاط صالتك وحجوزاتك القادمة" : "Overview of your venue activity and upcoming bookings"}
        </p>
      </div>

      <div className="stat-grid">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="overview-grid mt-6">
        <div className="dashboard-card">
          <div className="card-head">
            <h3 className="card-title">{ar ? "أحدث طلبات الفعاليات" : "Recent Event Requests"}</h3>
            <a className="link-primary small" href="#">{ar ? "عرض الكل" : "View all"}</a>
          </div>
          <ul className="list-stack">
            {mockEventRequests.map((r) => (
              <li key={r.id} className="list-item">
                <div>
                  <div className="list-title">{ar ? r.titleAr : r.title}</div>
                  <div className="list-sub">{ar ? r.organizerAr : r.organizer} · {r.id}</div>
                </div>
                <div className="list-meta">
                  <span className="status-pill">{ar ? r.statusAr : r.status}</span>
                  <div className="list-sub xsmall">{r.date}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card">
          <div className="card-head">
            <h3 className="card-title">{ar ? "الفعاليات القادمة" : "Upcoming Events"}</h3>
            <a className="link-primary small" href="#">{ar ? "عرض الكل" : "View all"}</a>
          </div>
          <ul className="list-stack">
            {mockUpcoming.map((r) => (
              <li key={r.id} className="list-item">
                <div>
                  <div className="list-title">{ar ? r.titleAr : r.title}</div>
                  <div className="list-sub">{r.id} · {r.time}</div>
                </div>
                <div className="list-meta">
                  <div className="list-sub xsmall">{r.date}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
