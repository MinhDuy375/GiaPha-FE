import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFamilyTree } from "../contexts/FamilyTreeContext";
import { useAuth } from "../contexts/AuthContext";
import familyTreeService from "../services/familyTreeService";

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconFamily = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const roleChipClass = (role) => {
  const value = (role || "").toLowerCase();
  if (value.includes("admin") || value.includes("quản trị")) return "chip chip-primary";
  if (value.includes("editor") || value.includes("biên tập")) return "chip chip-amber";
  return "chip chip-green";
};

const requestStatus = (status) => {
  const value = String(status ?? "");
  if (value === "0" || value.toLowerCase() === "pending") return { label: "Chờ duyệt", className: "chip chip-amber" };
  if (value === "2" || value.toLowerCase() === "rejected") return { label: "Từ chối", className: "chip chip-muted" };
  return { label: value || "Đang xử lý", className: "chip chip-muted" };
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

  const displayName = user?.fullName || user?.username || user?.email || "";

  return (
    <div className="page select-tree-page">
      <nav className="navbar" aria-label="Main navigation">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <img src="/chimlactrans.png" alt="" className="navbar-logo" style={{ width: 30 }} />
            Lạc Việt Gia Phả
          </div>
          <div className="navbar-actions">
            <div className="navbar-user">
              <div className="navbar-avatar" aria-label={"User " + displayName}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 500 }}>{displayName}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout} aria-label="Đăng xuất">
              <IconLogout /> Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      <main className="page-content">
        <div className="select-tree-hero">
          <p className="select-tree-kicker">Đổi dòng họ</p>
          <h1>Chọn gia phả để làm việc</h1>
          <p>Mỗi dòng họ là một không gian riêng. Vào gia phả hiện có, tạo mới hoặc gửi yêu cầu tham gia.</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" style={{ maxWidth: 720, margin: "0 auto 28px" }}>
            <IconAlert /><span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <div className="spinner spinner-primary" style={{ width: 40, height: 40, margin: "0 auto 16px", borderWidth: 3 }} aria-label="Đang tải..." />
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>Đang tải danh sách gia phả...</p>
          </div>
        ) : (
          <div className="select-tree-shell">
            {trees.length > 0 && (
              <p className="select-tree-section-label">Gia phả của bạn ({trees.length})</p>
            )}

            <div className="select-tree-list">
              {trees.map((tree) => (
                <div
                  key={tree.familyTreeId}
                  className="tree-card"
                  role="button"
                  tabIndex={0}
                  aria-label={"Mở gia phả " + tree.name}
                  onClick={() => handleSelect(tree)}
                  onKeyDown={(e) => e.key === "Enter" && handleSelect(tree)}
                >
                  <div className="tree-icon" aria-hidden="true"><IconFamily /></div>
                  <div className="tree-info">
                    <div className="tree-name">{tree.name}</div>
                    {tree.description && (
                      <div className="tree-meta" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "normal" }}>
                        {tree.description}
                      </div>
                    )}
                    <div className="tree-meta">
                      <span className={roleChipClass(tree.role)}>{tree.role}</span>
                    </div>
                  </div>
                  <div className="tree-arrow" aria-hidden="true"><IconArrow /></div>
                </div>
              ))}
            </div>

            <div className="select-tree-actions">
              <button className="select-tree-action" onClick={() => setOpenModal(true)} id="btn-create-tree" aria-haspopup="dialog">
                <span className="select-tree-action-icon"><IconPlus /></span>
                <span>
                  <strong>Tạo gia phả mới</strong>
                  <span>Khởi tạo dòng họ và mời con cháu tham gia</span>
                </span>
              </button>
              <button
                className="select-tree-action"
                onClick={() => { setOpenJoinModal(true); setJoinSuccess(""); setJoinError(""); setJoinCode(""); }}
                id="btn-join-tree"
                aria-haspopup="dialog"
              >
                <span className="select-tree-action-icon join"><IconLink /></span>
                <span>
                  <strong>Tham gia gia phả</strong>
                  <span>Nhập mã 6 ký tự do quản trị viên chia sẻ</span>
                </span>
              </button>
            </div>

            {trees.length === 0 && (
              <p className="select-tree-empty">Bạn chưa thuộc gia phả nào. Hãy tạo mới hoặc gửi yêu cầu tham gia.</p>
            )}

            {joinRequests.length > 0 && (
              <div className="select-tree-requests">
                <p className="select-tree-section-label">Yêu cầu tham gia</p>
                {joinRequests.map((request) => {
                  const status = requestStatus(request.statusText || request.status);
                  return (
                    <div className="select-tree-request" key={request.familyTreeId + String(request.createdAt)}>
                      <div>
                        <strong>{request.familyTreeName}</strong>
                        <small>Gửi lúc {request.createdAt ? new Date(request.createdAt).toLocaleDateString("vi-VN") : "—"}</small>
                      </div>
                      <span className={status.className}>{status.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {openModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.target === e.currentTarget && setOpenModal(false)}>
          <div className="modal">
            <div className="modal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 className="modal-title" id="modal-title">Tạo gia phả mới</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenModal(false)} aria-label="Đóng hộp thoại" style={{ padding: 8 }}>
                <IconX />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
                  Nhập tên dòng họ để khởi tạo gia phả và mời con cháu tham gia.
                </p>
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-tree-name">Tên gia phả / Dòng họ *</label>
                  <input id="modal-tree-name" type="text" className="form-input" style={{ paddingLeft: 16 }}
                    placeholder="VD: Gia phả họ Nguyễn Văn, Gia tộc Trần..." value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="modal-tree-desc">Mô tả (tùy chọn)</label>
                  <textarea id="modal-tree-desc" className="form-textarea"
                    placeholder="Nguồn gốc, quê quán, lịch sử dòng họ..."
                    value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setOpenModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={createLoading || !newName.trim()} id="btn-confirm-create">
                  {createLoading ? <span className="spinner" /> : "Tạo gia phả"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openJoinModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="join-modal-title"
          onClick={(e) => e.target === e.currentTarget && setOpenJoinModal(false)}>
          <div className="modal">
            <div className="modal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 className="modal-title" id="join-modal-title">Tham gia gia phả</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenJoinModal(false)} aria-label="Đóng hộp thoại" style={{ padding: 8 }}>
                <IconX />
              </button>
            </div>
            <form onSubmit={handleJoin}>
              <div className="modal-body">
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
                  Nhập mã tham gia 6 ký tự được quản trị viên chia sẻ để vào gia phả.
                </p>
                {joinError && (
                  <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>
                    <IconAlert /><span>{joinError}</span>
                  </div>
                )}
                {joinSuccess && (
                  <div className="alert alert-success" role="alert" style={{ marginBottom: 16, background: "#f0fdf4", borderColor: "#86efac", color: "#166534" }}>
                    <IconCheck /><span>{joinSuccess}</span>
                  </div>
                )}
                {!joinSuccess && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="join-code-input">Mã tham gia *</label>
                    <input
                      id="join-code-input"
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: 16, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600, fontSize: "1.1rem" }}
                      placeholder="VD: A1B2C3"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      autoFocus
                      required
                    />
                    <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: 6 }}>
                      Mã gồm 6 ký tự, không phân biệt chữ hoa/thường.
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setOpenJoinModal(false)}>Hủy</button>
                {!joinSuccess && (
                  <button type="submit" className="btn btn-primary" disabled={joinLoading || joinCode.trim().length < 6} id="btn-confirm-join">
                    {joinLoading ? <span className="spinner" /> : "Tham gia"}
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
