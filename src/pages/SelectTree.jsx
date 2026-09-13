import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFamilyTree } from "../contexts/FamilyTreeContext";
import { useAuth } from "../contexts/AuthContext";
import familyTreeService from "../services/familyTreeService";

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconFamily = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const roleChipClass = (role) => {
  const value = (role || "").toLowerCase();
  if (value.includes("admin") || value.includes("quản trị")) return "st-chip st-chip-admin";
  if (value.includes("editor") || value.includes("biên tập")) return "st-chip st-chip-editor";
  return "st-chip st-chip-member";
};

const requestStatus = (status) => {
  const value = String(status ?? "");
  if (value === "0" || value.toLowerCase() === "pending") return { label: "Chờ duyệt", className: "st-chip st-chip-amber" };
  if (value === "2" || value.toLowerCase() === "rejected") return { label: "Từ chối", className: "st-chip st-chip-muted" };
  return { label: value || "Đang xử lý", className: "st-chip st-chip-muted" };
};

export default function SelectTree() {
  const [trees, setTrees] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState("");
  const [joinError, setJoinError] = useState("");
  const { selectTree, clearSelectedTree } = useFamilyTree();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearSelectedTree();
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    setLoading(true);
    try {
      const [treeData, requestData] = await Promise.all([
        familyTreeService.getMyTrees(),
        familyTreeService.getMyJoinRequests().catch(() => []),
      ]);
      setTrees(treeData);
      setJoinRequests(Array.isArray(requestData) ? requestData : []);
    } catch {
      setError("Không thể tải danh sách gia phả.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (tree) => {
    try {
      await selectTree(tree.familyTreeId, tree.name);
      navigate("/");
    } catch {
      setError("Có lỗi xảy ra khi truy cập dòng họ này.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreateLoading(true);
    try {
      await familyTreeService.createTree(newName, newDesc);
      setOpenModal(false);
      setNewName("");
      setNewDesc("");
      fetchTrees();
    } catch {
      setError("Không thể tạo gia phả mới.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinLoading(true);
    setJoinError("");
    setJoinSuccess("");
    try {
      const result = await familyTreeService.joinTree(joinCode);
      if (result.status === "Pending" || result.message) {
        setJoinSuccess(result.message || "Yêu cầu tham gia đã được gửi. Chờ quản trị viên duyệt.");
        setJoinCode("");
        fetchTrees();
      } else {
        setOpenJoinModal(false);
        setJoinCode("");
        setJoinSuccess("");
        fetchTrees();
      }
    } catch (err) {
      setJoinError(err.response?.data?.message || "Mã tham gia không hợp lệ hoặc đã xảy ra lỗi.");
    } finally {
      setJoinLoading(false);
    }
  };

  const displayName = user?.fullName || user?.username || user?.email || "Nguoidung";

  return (
    <div className="select-tree-page" role="main">
      <style>{`
        /* --- CHUNG & RESET CHUẨN --- */
        .select-tree-page {
          min-height: 100vh;
          background-color: #FAF7F1;
          color: #2B211B;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .st-navbar {
          background-color: #FFFFFF;
          border-bottom: 1px solid #E7DED4;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .st-navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 64px;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }
        .st-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 1.1rem;
          color: #B84D20;
          text-decoration: none;
        }
        .st-brand img {
          height: 32px;
          width: auto;
        }
        .st-nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .st-user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .st-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #B84D20;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 2px 6px rgba(184, 77, 32, 0.2);
        }
        .st-user-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: #2B211B;
        }
        .st-btn-logout {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid #E7DED4;
          color: #756A61;
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .st-btn-logout:hover {
          background-color: #F3ECE2;
          color: #B84D20;
          border-color: #B84D20;
        }

        /* Chips */
        .st-chip {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .st-chip-admin { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }
        .st-chip-editor { background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }
        .st-chip-member { background: #F0FDF4; color: #16A34A; border: 1px solid #86EFAC; }
        .st-chip-amber { background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }
        .st-chip-muted { background: #F3F4F6; color: #6B7280; border: 1px solid #E5E7EB; }

        /* Modal Overlay */
        .st-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(43, 33, 27, 0.55);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .st-modal {
          background: #FFFFFF;
          border-radius: 18px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid #E7DED4;
          overflow: hidden;
          animation: stModalFadeIn 0.25s ease-out;
        }
        @keyframes stModalFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .st-modal-header {
          padding: 18px 20px;
          border-bottom: 1px solid #E7DED4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FAF7F1;
        }
        .st-modal-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #2B211B;
          margin: 0;
        }
        .st-modal-close {
          background: transparent;
          border: none;
          color: #756A61;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 6px;
        }
        .st-modal-close:hover { background: #E7DED4; color: #2B211B; }
        .st-modal-body { padding: 20px; }
        .st-modal-footer {
          padding: 14px 20px;
          border-top: 1px solid #E7DED4;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          background: #FAF7F1;
        }

        /* Form elements inside modals */
        .st-field-group { margin-bottom: 16px; }
        .st-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #2B211B;
          margin-bottom: 6px;
        }
        .st-input, .st-textarea {
          width: 100%;
          box-sizing: border-box;
          background: #FFFFFF;
          border: 1px solid #E7DED4;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.9rem;
          color: #2B211B;
          outline: none;
          transition: all 0.2s ease;
        }
        .st-input:focus, .st-textarea:focus {
          border-color: #B84D20;
          box-shadow: 0 0 0 3px rgba(184, 77, 32, 0.12);
        }
        .st-btn-primary {
          background: #B84D20;
          color: #FFFFFF;
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .st-btn-primary:hover:not(:disabled) { background: #A03E16; }
        .st-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .st-btn-secondary {
          background: #FFFFFF;
          color: #2B211B;
          border: 1px solid #E7DED4;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
        }
        .st-btn-secondary:hover { background: #FAF7F1; }

        /* Alert Box */
        .st-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 20px;
        }
        .st-alert-error { background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; }
        .st-alert-success { background: #F0FDF4; border: 1px solid #86EFAC; color: #166534; }

        /* --- DESKTOP STYLES (>= 768px) --- */
        @media (min-width: 768px) {
          .mobile-only { display: none !important; }

          .st-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 24px 60px 24px;
            width: 100%;
            box-sizing: border-box;
          }
          .st-hero {
            text-align: center;
            margin-bottom: 36px;
          }
          .st-kicker {
            color: #B84D20;
            font-size: 0.8rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 6px;
          }
          .st-hero h1 {
            font-size: 2rem;
            font-weight: 800;
            margin: 0 0 10px 0;
            color: #2B211B;
          }
          .st-hero p {
            color: #756A61;
            font-size: 0.95rem;
            margin: 0;
            max-width: 580px;
            margin-left: auto;
            margin-right: auto;
          }
          .st-section-title {
            font-size: 0.85rem;
            font-weight: 700;
            color: #756A61;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 14px;
          }
          
          /* Card grid */
          .st-tree-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }
          .st-card {
            background: #FFFFFF;
            border: 1px solid #E7DED4;
            border-radius: 16px;
            padding: 20px;
            display: flex;
            align-items: flex-start;
            gap: 16px;
            cursor: pointer;
            transition: all 0.22s ease;
            box-shadow: 0 2px 8px rgba(43, 33, 27, 0.03);
            position: relative;
          }
          .st-card:hover {
            border-color: #B84D20;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(184, 77, 32, 0.1);
          }
          .st-card-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(184, 77, 32, 0.08);
            color: #B84D20;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .st-card-body { flex: 1; min-width: 0; }
          .st-card-title {
            font-size: 1.05rem;
            font-weight: 700;
            color: #2B211B;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .st-card-desc {
            font-size: 0.83rem;
            color: #756A61;
            line-height: 1.4;
            margin-bottom: 10px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .st-card-arrow {
            color: #B84D20;
            align-self: center;
            opacity: 0.5;
            transition: opacity 0.2s, transform 0.2s;
          }
          .st-card:hover .st-card-arrow { opacity: 1; transform: translateX(3px); }

          /* Actions Grid */
          .st-actions-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }
          .st-action-card {
            background: #FFFFFF;
            border: 2px dashed #D6C9BC;
            border-radius: 16px;
            padding: 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            width: 100%;
          }
          .st-action-card:hover {
            border-color: #B84D20;
            background: #FFFDF9;
          }
          .st-action-icon {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            background: #FAF7F1;
            color: #B84D20;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .st-action-text strong {
            display: block;
            font-size: 0.95rem;
            color: #2B211B;
            margin-bottom: 2px;
          }
          .st-action-text span {
            font-size: 0.8rem;
            color: #756A61;
          }

          /* Requests */
          .st-requests-box {
            background: #FFFFFF;
            border: 1px solid #E7DED4;
            border-radius: 16px;
            padding: 20px;
          }
          .st-request-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #FAF7F1;
          }
          .st-request-item:last-child { border-bottom: none; }
        }

        /* --- MOBILE STYLES (< 767px) --- */
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }

          .st-navbar-inner {
            padding: 0 16px;
            height: 56px;
          }
          .st-user-name { display: none; }
          .st-container {
            padding: 16px 16px 32px 16px;
            flex: 1;
            box-sizing: border-box;
          }
          .st-hero {
            text-align: left;
            margin-bottom: 20px;
            background: #FFFFFF;
            padding: 16px;
            border-radius: 14px;
            border: 1px solid #E7DED4;
          }
          .st-kicker {
            color: #B84D20;
            font-size: 0.72rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 2px;
          }
          .st-hero h1 {
            font-size: 1.3rem;
            font-weight: 800;
            margin: 0 0 4px 0;
          }
          .st-hero p {
            font-size: 0.8rem;
            color: #756A61;
            margin: 0;
            line-height: 1.35;
          }
          .st-section-title {
            font-size: 0.78rem;
            font-weight: 700;
            color: #756A61;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .st-tree-grid {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
          }
          .st-card {
            background: #FFFFFF;
            border: 1px solid #E7DED4;
            border-radius: 14px;
            padding: 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          }
          .st-card-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: rgba(184, 77, 32, 0.08);
            color: #B84D20;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .st-card-body { flex: 1; min-width: 0; }
          .st-card-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: #2B211B;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .st-card-desc {
            font-size: 0.78rem;
            color: #756A61;
            margin-bottom: 6px;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .st-card-arrow { color: #B84D20; }

          .st-actions-grid {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
          }
          .st-action-card {
            background: #FFFFFF;
            border: 1px solid #E7DED4;
            border-radius: 14px;
            padding: 12px 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            text-align: left;
            width: 100%;
            box-sizing: border-box;
          }
          .st-action-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: #FAF7F1;
            color: #B84D20;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .st-action-text strong {
            display: block;
            font-size: 0.88rem;
            color: #2B211B;
          }
          .st-action-text span {
            font-size: 0.75rem;
            color: #756A61;
          }

          .st-requests-box {
            background: #FFFFFF;
            border: 1px solid #E7DED4;
            border-radius: 14px;
            padding: 14px;
          }
          .st-request-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #FAF7F1;
          }
          .st-request-item:last-child { border-bottom: none; }
        }
      `}</style>

      {/* Header Navigation */}
      <nav className="st-navbar" aria-label="Thanh điều hướng">
        <div className="st-navbar-inner">
          <div className="st-brand">
            <img src="/chimlactrans.png" alt="Lạc Việt Gia Phả" />
            <span>Lạc Việt Gia Phả</span>
          </div>
          <div className="st-nav-actions">
            <div className="st-user-info">
              <div className="st-avatar" aria-label={"Người dùng " + displayName}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="st-user-name">{displayName}</span>
            </div>
            <button className="st-btn-logout" onClick={logout} aria-label="Đăng xuất">
              <IconLogout /> <span className="desktop-only">Đăng xuất</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="st-container">
        <div className="st-hero">
          <p className="st-kicker">Không gian dòng họ</p>
          <h1>Chọn gia phả làm việc</h1>
          <p>Truy cập vào các gia phả bạn tham gia, tạo dòng họ mới hoặc nhập mã để gửi yêu cầu tham gia.</p>
        </div>

        {error && (
          <div className="st-alert st-alert-error" role="alert">
            <IconAlert />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid #E7DED4",
                borderTopColor: "#B84D20",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 14px"
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#756A61", fontSize: "0.9rem" }}>Đang tải danh sách gia phả...</p>
          </div>
        ) : (
          <>
            {/* List of trees */}
            {trees.length > 0 && (
              <div>
                <p className="st-section-title">Gia phả của bạn ({trees.length})</p>
                <div className="st-tree-grid">
                  {trees.map((tree) => (
                    <div
                      key={tree.familyTreeId}
                      className="st-card"
                      role="button"
                      tabIndex={0}
                      aria-label={"Mở gia phả " + tree.name}
                      onClick={() => handleSelect(tree)}
                      onKeyDown={(e) => e.key === "Enter" && handleSelect(tree)}
                    >
                      <div className="st-card-icon">
                        <IconFamily />
                      </div>
                      <div className="st-card-body">
                        <div className="st-card-title">{tree.name}</div>
                        {tree.description && <div className="st-card-desc">{tree.description}</div>}
                        <div>
                          <span className={roleChipClass(tree.role)}>{tree.role}</span>
                        </div>
                      </div>
                      <div className="st-card-arrow">
                        <IconArrow />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Grid */}
            <p className="st-section-title">Tùy chọn khác</p>
            <div className="st-actions-grid">
              <button
                className="st-action-card"
                onClick={() => setOpenModal(true)}
                id="btn-create-tree"
              >
                <div className="st-action-icon">
                  <IconPlus />
                </div>
                <div className="st-action-text">
                  <strong>Tạo gia phả mới</strong>
                  <span>Khởi tạo dòng họ & mời con cháu</span>
                </div>
              </button>

              <button
                className="st-action-card"
                onClick={() => {
                  setOpenJoinModal(true);
                  setJoinSuccess("");
                  setJoinError("");
                  setJoinCode("");
                }}
                id="btn-join-tree"
              >
                <div className="st-action-icon">
                  <IconLink />
                </div>
                <div className="st-action-text">
                  <strong>Tham gia gia phả</strong>
                  <span>Nhập mã 6 ký tự được chia sẻ</span>
                </div>
              </button>
            </div>

            {trees.length === 0 && (
              <p style={{ textAlign: "center", color: "#756A61", fontSize: "0.88rem", margin: "20px 0" }}>
                Bạn chưa thuộc gia phả nào. Hãy chọn Tạo gia phả mới hoặc Tham gia gia phả phía trên.
              </p>
            )}

            {/* Pending Requests */}
            {joinRequests.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p className="st-section-title">Yêu cầu tham gia đã gửi</p>
                <div className="st-requests-box">
                  {joinRequests.map((request) => {
                    const status = requestStatus(request.statusText || request.status);
                    return (
                      <div className="st-request-item" key={request.familyTreeId + String(request.createdAt)}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#2B211B" }}>
                            {request.familyTreeName}
                          </div>
                          <small style={{ color: "#756A61", fontSize: "0.75rem" }}>
                            Gửi lúc: {request.createdAt ? new Date(request.createdAt).toLocaleDateString("vi-VN") : "—"}
                          </small>
                        </div>
                        <span className={status.className}>{status.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Create Tree */}
      {openModal && (
        <div
          className="st-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setOpenModal(false)}
        >
          <div className="st-modal">
            <div className="st-modal-header">
              <h2 className="st-modal-title">Tạo gia phả mới</h2>
              <button className="st-modal-close" onClick={() => setOpenModal(false)} aria-label="Đóng">
                <IconX />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="st-modal-body">
                <p style={{ fontSize: "0.85rem", color: "#756A61", marginTop: 0, marginBottom: 16 }}>
                  Khởi tạo không gian lưu trữ cho dòng họ. Bạn sẽ trở thành Quản trị viên của gia phả này.
                </p>
                <div className="st-field-group">
                  <label className="st-label" htmlFor="modal-tree-name">
                    Tên gia phả / Dòng họ *
                  </label>
                  <input
                    id="modal-tree-name"
                    type="text"
                    className="st-input"
                    placeholder="VD: Gia phả họ Nguyễn Văn, Gia tộc Trần..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="st-field-group" style={{ marginBottom: 0 }}>
                  <label className="st-label" htmlFor="modal-tree-desc">
                    Mô tả (tùy chọn)
                  </label>
                  <textarea
                    id="modal-tree-desc"
                    className="st-textarea"
                    placeholder="Nguồn gốc, quê quán, nhà thờ tổ..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <div className="st-modal-footer">
                <button type="button" className="st-btn-secondary" onClick={() => setOpenModal(false)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="st-btn-primary"
                  disabled={createLoading || !newName.trim()}
                  id="btn-confirm-create"
                >
                  {createLoading ? "Đang tạo..." : "Tạo gia phả"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Join Tree */}
      {openJoinModal && (
        <div
          className="st-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setOpenJoinModal(false)}
        >
          <div className="st-modal">
            <div className="st-modal-header">
              <h2 className="st-modal-title">Tham gia gia phả</h2>
              <button className="st-modal-close" onClick={() => setOpenJoinModal(false)} aria-label="Đóng">
                <IconX />
              </button>
            </div>
            <form onSubmit={handleJoin}>
              <div className="st-modal-body">
                <p style={{ fontSize: "0.85rem", color: "#756A61", marginTop: 0, marginBottom: 16 }}>
                  Nhập mã chia sẻ 6 ký tự do Quản trị viên dòng họ cung cấp.
                </p>

                {joinError && (
                  <div className="st-alert st-alert-error">
                    <IconAlert />
                    <span>{joinError}</span>
                  </div>
                )}
                {joinSuccess && (
                  <div className="st-alert st-alert-success">
                    <IconCheck />
                    <span>{joinSuccess}</span>
                  </div>
                )}

                {!joinSuccess && (
                  <div className="st-field-group" style={{ marginBottom: 0 }}>
                    <label className="st-label" htmlFor="join-code-input">
                      Mã tham gia *
                    </label>
                    <input
                      id="join-code-input"
                      type="text"
                      className="st-input"
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        fontWeight: 700,
                        textAlign: "center",
                        fontSize: "1.1rem"
                      }}
                      placeholder="A1B2C3"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      autoFocus
                      required
                    />
                  </div>
                )}
              </div>
              <div className="st-modal-footer">
                <button type="button" className="st-btn-secondary" onClick={() => setOpenJoinModal(false)}>
                  Đóng
                </button>
                {!joinSuccess && (
                  <button
                    type="submit"
                    className="st-btn-primary"
                    disabled={joinLoading || joinCode.trim().length < 6}
                    id="btn-confirm-join"
                  >
                    {joinLoading ? "Đang xử lý..." : "Gửi yêu cầu"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}