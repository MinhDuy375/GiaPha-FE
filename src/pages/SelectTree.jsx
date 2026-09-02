import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFamilyTree } from "../contexts/FamilyTreeContext";
import { useAuth } from "../contexts/AuthContext";
import familyTreeService from "../services/familyTreeService";

const IconTree = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12M12 12 5 7M12 12l7-5M5 7V4M19 7V4"/>
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconFamily = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const roleChipClass = (role) => {
  if (role === "Admin") return "chip chip-primary";
  if (role === "Editor") return "chip chip-amber";
  return "chip chip-green";
};

export default function SelectTree() {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
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
      const data = await familyTreeService.getMyTrees();
      setTrees(data);
    } catch {
      setError("Không thể tải danh sách gia phả.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (treeId) => {
    try {
      await selectTree(treeId);
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
      setNewName(""); setNewDesc("");
      fetchTrees();
    } catch {
      setError("Không thể tạo gia phả mới.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="page">
      {/* Navbar */}
      <nav className="navbar" aria-label="Main navigation">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22V12M12 12 5 7M12 12l7-5M5 7V4M19 7V4"/>
            </svg>
            Lac Viet Gia Pha
          </div>
          <div className="navbar-actions">
            <div className="navbar-user">
              <div className="navbar-avatar" aria-label={"User " + user?.username}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 500 }}>{user?.username}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout} aria-label="Dang xuat">
              <IconLogout /> Dang xuat
            </button>
          </div>
        </div>
      </nav>

      <main className="page-content">
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Chon dong ho
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1.2, marginBottom: "16px" }}>
            Ban thuoc dong ho nao?
          </h1>
          <p style={{ fontSize: "1.0625rem", color: "var(--color-text-secondary)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
            Moi dong ho la mot khong gian rieng biet. Chon gia pha de vao lam viec hoac tao moi.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" style={{ maxWidth: "560px", margin: "0 auto 32px" }}>
            <IconAlert /><span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <div className="spinner spinner-primary" style={{ width: "40px", height: "40px", margin: "0 auto 16px", borderWidth: "3px" }} aria-label="Dang tai..." />
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>Dang tai danh sach gia pha...</p>
          </div>
        ) : (
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            {/* Section label */}
            {trees.length > 0 && (
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                Gia pha cua ban ({trees.length})
              </p>
            )}

            {/* Tree list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              {trees.map((tree) => (
                <div
                  key={tree.familyTreeId}
                  className="tree-card"
                  role="button"
                  tabIndex={0}
                  aria-label={"Mo gia pha " + tree.name}
                  onClick={() => handleSelect(tree.familyTreeId)}
                  onKeyDown={(e) => e.key === "Enter" && handleSelect(tree.familyTreeId)}
                >
                  <div className="tree-icon" aria-hidden="true"><IconFamily /></div>
                  <div className="tree-info">
                    <div className="tree-name">{tree.name}</div>
                    <div className="tree-meta">
                      <span className={roleChipClass(tree.role)}>{tree.role}</span>
                    </div>
                  </div>
                  <div className="tree-arrow" aria-hidden="true"><IconArrow /></div>
                </div>
              ))}
            </div>

            {/* Create new */}
            <button
              className="btn btn-secondary btn-full"
              style={{ height: "52px", justifyContent: "center", borderStyle: "dashed" }}
              onClick={() => setOpenModal(true)}
              id="btn-create-tree"
              aria-haspopup="dialog"
            >
              <IconPlus /> Tao gia pha moi
            </button>

            {trees.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.9375rem", marginTop: "24px" }}>
                Ban chua co gia pha nao. Hay tao gia pha dau tien!
              </p>
            )}
          </div>
        )}
      </main>

      {/* Create Tree Modal */}
      {openModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.target === e.currentTarget && setOpenModal(false)}>
          <div className="modal">
            <div className="modal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 className="modal-title" id="modal-title">Tao gia pha moi</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenModal(false)} aria-label="Dong hop thoai" style={{ padding: "8px" }}>
                <IconX />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "20px", lineHeight: 1.6 }}>
                  Nhap ten dong ho de khoi tao gia pha va moi con chau tham gia.
                </p>
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-tree-name">Ten gia pha / Dong ho *</label>
                  <input id="modal-tree-name" type="text" className="form-input" style={{ paddingLeft: "16px" }}
                    placeholder="VD: Gia pha ho Nguyen Van, Gia toc Tran..." value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="modal-tree-desc">Mo ta (Tuy chon)</label>
                  <textarea id="modal-tree-desc" className="form-textarea"
                    placeholder="Nguon goc, que quan, lich su dong ho..."
                    value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setOpenModal(false)}>Huy</button>
                <button type="submit" className="btn btn-primary" disabled={createLoading || !newName.trim()} id="btn-confirm-create">
                  {createLoading ? <span className="spinner" /> : "Tao gia pha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}