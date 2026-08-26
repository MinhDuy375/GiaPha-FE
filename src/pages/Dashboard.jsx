import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFamilyTree } from "../contexts/FamilyTreeContext";

const IconFamily = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconTree = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12M12 12 5 7M12 12l7-5M5 7V4M19 7V4"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93"/>
  </svg>
);
const IconSwap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const features = [
  {
    icon: <IconTree />, iconClass: "", title: "Cay Gia Pha",
    desc: "Xem so do phat do truc quan theo tung the he. Phong to, thu nho va tuong tac truc tiep tren cay.",
    perm: "tree.view", action: "Xem gia pha",
  },
  {
    icon: <IconFamily />, iconClass: "", title: "Quan ly Thanh Vien",
    desc: "Them, sua, xoa thong tin ca nhan: tieu su, ngay sinh, nghe nghiep, hinh anh.",
    perm: "member.view", action: "Xem thanh vien",
  },
  {
    icon: <IconDownload />, iconClass: "feature-icon--teal", title: "Nhap / Xuat Du lieu",
    desc: "Nhap hang loat tu Excel/GEDCOM hoac xuat gia pha ra PDF / hinh anh chat luong cao.",
    perm: "data.import", action: "Nhap xuat",
  },
  {
    icon: <IconCheck />, iconClass: "feature-icon--teal", title: "Phe Duyet Dong Gop",
    desc: "Xem xet va duyet cac de xuat bo sung, sua doi tu con chau truoc khi cap nhat chinh thuc.",
    perm: "data.approve", action: "Xet duyet",
  },
  {
    icon: <IconUsers />, iconClass: "feature-icon--amber", title: "Thanh Vien Dong Ho",
    desc: "Moi thanh vien moi, quan ly quyen tham gia va thu hoi quyen truy cap.",
    perm: "membership.manage", action: "Quan ly",
  },
  {
    icon: <IconSettings />, iconClass: "feature-icon--amber", title: "Phan Quyen & Cai dat",
    desc: "Cau hinh vai tro Admin / Editor / Viewer va chinh sach quyen han trong dong ho.",
    perm: "role.manage", action: "Cai dat",
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { role, permissions, clearSelectedTree } = useFamilyTree();
  const navigate = useNavigate();

  const has = (perm) => permissions?.includes(perm);

  const roleChipClass = role === "Admin" ? "chip chip-primary" : role === "Editor" ? "chip chip-amber" : "chip chip-green";

  const handleSwitchTree = () => {
    clearSelectedTree();
    navigate("/select-tree");
  };

  return (
    <div className="page">
      {/* Navbar */}
      <nav className="navbar" aria-label="Main navigation">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22V12M12 12 5 7M12 12l7-5M5 7V4M19 7V4"/>
            </svg>
            Lac Viet Gia Pha
          </div>
          <div className="navbar-actions">
            <div className="navbar-user">
              <div className="navbar-avatar" aria-label={"User " + user?.username}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{user?.username}</span>
              <span className={roleChipClass}>{role}</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleSwitchTree} id="btn-switch-tree">
              <IconSwap /> Doi dong ho
            </button>
            <button className="btn btn-ghost btn-sm" onClick={logout} aria-label="Dang xuat">
              <IconLogout />
            </button>
          </div>
        </div>
      </nav>

      <main className="page-content">
        {/* Welcome banner */}
        <div style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, #8c3212 60%, #3b2d1a 100%)",
          borderRadius: "var(--radius-xl)",
          padding: "36px 40px",
          marginBottom: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.65)", fontWeight: 500, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Bang Dieu Khien
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: "12px" }}>
              Chao mung tro lai, {user?.username}!
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.5, maxWidth: "480px" }}>
              Quan ly dong ho, them thanh vien va giu gin ky uc to tien cua ban.
            </p>
          </div>
          <div style={{ position: "relative", background: "rgba(255,255,255,0.12)", borderRadius: "var(--radius-lg)", padding: "20px 28px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)", marginBottom: "4px" }}>Vai tro hien tai</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>{role}</div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)", marginTop: "4px" }}>{permissions?.length || 0} quyen han</div>
          </div>
        </div>

        {/* Features heading */}
        <div className="section-header">
          <h2 className="section-title">Tinh nang he thong</h2>
          <p className="section-sub">Cac chuc nang duoc phan quyen theo vai tro cua ban trong dong ho.</p>
        </div>

        {/* Feature grid */}
        <div className="grid-3" style={{ marginBottom: "48px" }}>
          {features.map((feat) => {
            const allowed = has(feat.perm);
            return (
              <div key={feat.perm} className={"feature-card" + (allowed ? "" : " feature-card--disabled")}>
                <div className={"feature-icon " + feat.iconClass} aria-hidden="true">
                  {feat.icon}
                </div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
                <button
                  className={"btn btn-sm " + (allowed ? "btn-primary" : "btn-secondary")}
                  disabled={!allowed}
                  aria-label={(allowed ? feat.action : "Khong co quyen: ") + feat.title}
                  id={"btn-feat-" + feat.perm.replace(".", "-")}
                  style={!allowed ? { cursor: "not-allowed" } : {}}
                >
                  {allowed ? feat.action : "Khong du quyen"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Permissions summary */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
            Danh sach quyen han trong phien nay
          </h3>
          <div className="perm-list" role="list" aria-label="Danh sach quyen han">
            {permissions?.length > 0 ? permissions.map((perm) => (
              <span key={perm} className="perm-tag" role="listitem">{perm}</span>
            )) : (
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Khong co quyen han nao.</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}