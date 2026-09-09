import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFamilyTree } from "../contexts/FamilyTreeContext";
import Navbar from "../components/Navbar";
import eventService from "../services/eventService";
import { formatLunarDate } from "../utils/lunarCalendar";

const IconFamily = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconTree = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12M12 12 5 7M12 12l7-5M5 7V4M19 7V4" />
  </svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const features = [
  { icon: <IconTree />, iconClass: "", title: "Cây Gia Phả", desc: "Xem sơ đồ phát đồ trực quan theo từng thế hệ. Phóng to, thu nhỏ và tương tác trực tiếp trên cây.", perm: "tree_view.view", to: "/family-tree" },
  { icon: <IconFamily />, iconClass: "", title: "Quản lý Thành Viên", desc: "Thêm, sửa, xóa thông tin cá nhân: tiểu sử, ngày sinh, nghề nghiệp, hình ảnh.", perm: "member_list.view", to: "/members" },
  { icon: <IconUsers />, iconClass: "feature-icon--amber", title: "Quản lý Quan hệ", desc: "Quản lý quan hệ cha mẹ, con nuôi và vợ chồng trong cây gia phả.", perm: "member_list.view", to: "/relationships" },
  { icon: <IconTree />, iconClass: "feature-icon--teal", title: "Thống kê Dòng họ", desc: "Theo dõi số lượng thành viên, thế hệ, giới tính và phân bố năm sinh.", perm: "tree_view.view", to: "/statistics" },
  { icon: <IconCheck />, iconClass: "feature-icon--amber", title: "Sự kiện Dòng họ", desc: "Theo dõi ngày giỗ, sinh nhật và các sự kiện quan trọng của dòng họ.", perm: "event.view", to: "/events" },
  { icon: <IconUsers />, iconClass: "feature-icon--teal", title: "Tra cứu Danh xưng", desc: "Xác định cách xưng hô và liên kết giữa hai thành viên trong dòng tộc.", perm: "kinship.view", to: "/kinship" },
  { icon: <IconFamily />, iconClass: "feature-icon--amber", title: "Thư viện Dòng họ", desc: "Lưu giữ ảnh, câu chuyện và ghi chú về những kỷ niệm của dòng họ.", perm: "gallery.view", to: "/gallery" },
  { icon: <IconUsers />, iconClass: "feature-icon--teal", title: "Tham gia Gia tộc", desc: "Tham gia gia tộc bằng mã, quản lý các gia tộc của bạn và duyệt yêu cầu thành viên.", perm: "membership.view", to: "/membership" },
  { icon: <IconDownload />, iconClass: "feature-icon--teal", title: "Nhập / Xuất Dữ liệu", desc: "Nhập hàng loạt từ Excel/GEDCOM hoặc xuất gia phả ra PDF / hình ảnh chất lượng cao.", perm: "tree_view.export", to: "/import-export" },
  { icon: <IconCheck />, iconClass: "feature-icon--teal", title: "Phê Duyệt Đóng Góp", desc: "Xem xét và duyệt các đề xuất bổ sung, sửa đổi từ con cháu trước khi cập nhật chính thức.", perm: "membership.manage", to: null },
  { icon: <IconShield />, iconClass: "feature-icon--amber", title: "Quản lý Người dùng", desc: "Xem danh sách, đổi vai trò, khóa/mở khóa và quản lý tài khoản trong dòng họ.", perm: "user.view", to: "/users" },
  { icon: <IconSettings />, iconClass: "feature-icon--amber", title: "Phân Quyền & Cài đặt", desc: "Cấu hình các nhóm quyền và ma trận phân quyền chuyên nghiệp cho dòng họ.", perm: "role_group.view", to: "/permissions" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { role, permissions, selectTree } = useFamilyTree();
  const navigate = useNavigate();
  const [events, setEvents] = React.useState([]);

  const has = (perm) => permissions?.includes(perm);

  const roleChipClass = role === 'Quản trị viên' ? 'chip chip-primary' : role === 'Người biên tập' ? 'chip chip-amber' : 'chip chip-green';

  // Tự động refresh permissions khi mount
  React.useEffect(() => {
    const treeId = localStorage.getItem('currentFamilyTreeId');
    if (treeId) selectTree(treeId).catch(() => { });
  }, []);

  React.useEffect(() => {
    if (!has('event.view')) return;
    eventService.getEvents().then(setEvents).catch(() => setEvents([]));
  }, [permissions]);

  const today = new Date();
  const upcomingEvents = events.filter(e => new Date(e.eventDate) >= new Date(today.getFullYear(), today.getMonth(), today.getDate())).slice(0, 4);

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">

        <div className="dashboard-top-grid">
          <div className="card dashboard-date-card">
            <div className="dashboard-label">Hôm nay</div>
            <div className="dashboard-date-text">{today.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
            <div className="dashboard-lunar-text">Âm lịch: {formatLunarDate(today)}</div>
          </div>
          <div className="card dashboard-event-card">
            <div className="dashboard-label">Sự kiện hôm nay và sắp tới</div>
            {upcomingEvents.length ? upcomingEvents.map(event => <div key={event.id} className="dashboard-event-row"><span className="dashboard-event-title">{event.title}</span><span className="dashboard-event-meta">{new Date(event.eventDate).toLocaleDateString('vi-VN')}<br /><small>Âm: {formatLunarDate(event.eventDate)}</small></span></div>) : <div className="dashboard-empty-event">Chưa có sự kiện sắp tới.</div>}
          </div>
        </div>

        <div className="section-header">
          <h2 className="section-title">Tính năng hệ thống</h2>
          <p className="section-sub">Các chức năng được phân quyền theo vai trò của bạn trong dòng họ.</p>
        </div>
        <div className="dashboard-feature-grid">
          {features.map((feat) => {
            const allowed = has(feat.perm);
            return (
              <div
                key={`${feat.perm}-${feat.to || feat.title}`}
                className={"feature-card" + (allowed ? "" : " feature-card--disabled")}
                role={allowed && feat.to ? "button" : undefined}
                tabIndex={allowed && feat.to ? 0 : undefined}
                onClick={() => allowed && feat.to && navigate(feat.to)}
                onKeyDown={(e) => { if (e.key === 'Enter' && allowed && feat.to) navigate(feat.to); }}
                style={{ cursor: allowed && feat.to ? 'pointer' : 'default' }}
              >
                <div className={"feature-icon " + feat.iconClass} aria-hidden="true">{feat.icon}</div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
                <div className={allowed ? 'feature-access-open' : 'feature-access-denied'}>
                  {allowed ? `Mở ${feat.title} →` : "Không đủ quyền"}
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}