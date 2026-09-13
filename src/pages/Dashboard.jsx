import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFamilyTree } from "../contexts/FamilyTreeContext";
import Navbar from "../components/Navbar";
import eventService from "../services/eventService";
import roleGroupService from "../services/roleGroupService";
import { formatLunarDate } from "../utils/lunarCalendar";

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: 'var(--color-primary)' }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const menuRoutes = {
  tree_view: '/family-tree',
  member_list: '/members',
  kinship: '/kinship',
  gallery: '/gallery',
  events: '/events',
  membership: '/membership',
  role_group: '/permissions',
  relationships: '/relationships',
  statistics: '/statistics',
  user: '/users'
};

const featureMeta = {
  tree_view: { desc: "Xem sơ đồ phát đồ trực quan theo từng thế hệ.", colorClass: "" },
  member_list: { desc: "Thêm, sửa, xóa thông tin cá nhân: tiểu sử, ngày sinh, nghề nghiệp, hình ảnh.", colorClass: "" },
  relationships: { desc: "Quản lý quan hệ cha mẹ, con nuôi và vợ chồng trong cây.", colorClass: "feature-icon--amber" },
  statistics: { desc: "Theo dõi số lượng thành viên, thế hệ, giới tính và năm sinh.", colorClass: "feature-icon--teal" },
  events: { desc: "Theo dõi ngày giỗ, sinh nhật và các sự kiện quan trọng.", colorClass: "feature-icon--amber" },
  kinship: { desc: "Xác định cách xưng hô và liên kết giữa hai thành viên.", colorClass: "feature-icon--teal" },
  gallery: { desc: "Lưu giữ ảnh, câu chuyện và ghi chú về những kỷ niệm.", colorClass: "feature-icon--amber" },
  membership: { desc: "Tham gia gia tộc bằng mã, duyệt yêu cầu thành viên.", colorClass: "feature-icon--teal" },
  user: { desc: "Xem danh sách, đổi vai trò, khóa/mở khóa tài khoản.", colorClass: "feature-icon--amber" },
  role_group: { desc: "Cấu hình các nhóm quyền và ma trận phân quyền.", colorClass: "feature-icon--amber" },
};

function MenuIcon({ name }) {
  const paths = {
    tree: 'M12 22V12M12 12 5 7M12 12l7-5M5 7V4M19 7V4',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    calendar: 'M4 5h16v15H4zM8 3v4M16 3v4M4 10h16',
    link: 'M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07L11 5M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1-1',
    images: 'M4 5h16v14H4zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4M4 16l4-4 3 3 2-2 7 6',
    'user-plus': 'M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M16 11h6',
    chart: 'M4 19V5M4 19h16M8 16v-4M12 16V8M16 16V4',
    switch: 'M16 3l4 4-4 4M20 7H10M8 21l-4-4 4-4M4 17h10',
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name] || paths.tree} /></svg>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { role, permissions, selectTree } = useFamilyTree();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [navigation, setNavigation] = useState([]);

  const has = (perm) => permissions?.includes(perm);

  useEffect(() => {
    const treeId = localStorage.getItem('currentFamilyTreeId');
    const treeName = localStorage.getItem('currentFamilyTreeName');
    if (treeId) selectTree(treeId, treeName).catch(() => { });
  }, []);

  useEffect(() => {
    roleGroupService.getNavigation().then(setNavigation).catch(() => setNavigation([]));
  }, []);

  useEffect(() => {
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
            {upcomingEvents.length ? upcomingEvents.map(event => (
              <div key={event.id} className="dashboard-event-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px dashed var(--color-border)' }}>
                <div style={{ padding: 8, background: 'var(--color-primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconCalendar />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="dashboard-event-title" style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>{event.title}</div>
                  <div className="dashboard-event-meta" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {new Date(event.eventDate).toLocaleDateString('vi-VN')} · Âm lịch: {formatLunarDate(event.eventDate)}
                  </div>
                </div>
              </div>
            )) : <div className="dashboard-empty-event">Chưa có sự kiện sắp tới.</div>}
          </div>
        </div>

        <div className="section-header">
          <h2 className="section-title">Tính năng hệ thống</h2>
          <p className="section-sub">Các chức năng được cấu hình theo luồng nghiệp vụ.</p>
        </div>
        <div className="dashboard-feature-grid">
          {navigation.map((menu) => {
            const allowed = menu.permissions?.some(p => permissions?.includes(p));
            const to = menuRoutes[menu.alias];
            const meta = featureMeta[menu.alias] || { desc: "Chức năng dòng họ", colorClass: "" };
            
            return (
              <div
                key={menu.id}
                className={"feature-card" + (allowed && to ? "" : " feature-card--disabled")}
                role={allowed && to ? "button" : undefined}
                tabIndex={allowed && to ? 0 : undefined}
                onClick={() => allowed && to && navigate(to)}
                onKeyDown={(e) => { if (e.key === 'Enter' && allowed && to) navigate(to); }}
                style={{ cursor: allowed && to ? 'pointer' : 'default' }}
              >
                <div className={"feature-icon " + meta.colorClass} aria-hidden="true">
                  <MenuIcon name={menu.icon} />
                </div>
                <h3 className="feature-title">{menu.name}</h3>
                <p className="feature-desc">{meta.desc}</p>
                <div className={allowed && to ? 'feature-access-open' : 'feature-access-denied'}>
                  {allowed && to ? `Mở ${menu.name} →` : "Không đủ quyền"}
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}