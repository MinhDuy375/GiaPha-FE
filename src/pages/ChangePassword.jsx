import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import familyTreeService from "../services/familyTreeService";

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function PasswordStrength({ password }) {
  const checks = [
    { label: "Ít nhất 8 ký tự", ok: password.length >= 8 },
    { label: "Có chữ hoa", ok: /[A-Z]/.test(password) },
    { label: "Có chữ số", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["#ef4444", "#f97316", "#22c55e"];
  const labels = ["Yếu", "Trung bình", "Mạnh"];

  if (!password) return null;
  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            flex: 1, height: "4px", borderRadius: "2px",
            background: i < score ? colors[score - 1] : "var(--color-border)",
            transition: "background 0.3s ease"
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: score > 0 ? colors[score - 1] : "var(--color-text-secondary)", fontWeight: 600 }}>
          {score > 0 ? labels[score - 1] : ""}
        </span>
        <div style={{ display: "flex", gap: "12px" }}>
          {checks.map(c => (
            <span key={c.label} style={{ fontSize: "0.7rem", color: c.ok ? "#22c55e" : "var(--color-text-tertiary)", display: "flex", alignItems: "center", gap: "3px" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.ok ? "#22c55e" : "var(--color-text-tertiary)"} strokeWidth="3">
                {c.ok ? <polyline points="20 6 9 17 4 12" /> : <line x1="18" y1="6" x2="6" y2="18" />}
              </svg>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { changePassword, user } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    setError(""); setLoading(true);
    try {
      await changePassword(form.oldPassword, form.newPassword);
      const trees = await familyTreeService.getMyTrees();
      navigate(Array.isArray(trees) && trees.length > 0 ? "/select-tree" : "/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" role="main">
      <aside className="auth-visual" aria-hidden="true">
        <div className="auth-visual-content">
          <div style={{ marginBottom: "24px" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <p className="auth-visual-title">Bảo mật<br />tài khoản</p>
          <p className="auth-visual-sub">
            Bạn đang dùng mật khẩu tạm thời.<br />
            Hãy đặt mật khẩu mới để bảo vệ tài khoản.
          </p>
          <div style={{ marginTop: "40px" }}>
            {[
              "Không chia sẻ mật khẩu với người khác",
              "Dùng ít nhất 8 ký tự, kết hợp chữ và số",
              "Đặt mật khẩu khác với các tài khoản khác",
            ].map((tip) => (
              <div key={tip} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "14px", color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="auth-form-side">
        <div className="auth-card">
          <p className="auth-logo">Lạc Việt Gia Phả</p>
          <h1 className="auth-headline">Đặt mật khẩu mới</h1>
          <p className="auth-subline">
            Xin chào <strong>{user?.fullName || user?.username}</strong>! Vui lòng đặt mật khẩu mới để tiếp tục.
          </p>

          {error && (
            <div className="alert alert-error" role="alert" aria-live="assertive">
              <IconAlert /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="cp-old">Mật khẩu tạm thời *</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IconLock /></span>
                <input id="cp-old" type={showOld ? "text" : "password"} className="form-input has-suffix"
                  placeholder="Nhập mật khẩu tạm thời..."
                  value={form.oldPassword} onChange={set("oldPassword")}
                  autoComplete="current-password" required />
                <button type="button" className="form-input-suffix" onClick={() => setShowOld(!showOld)}
                  aria-label={showOld ? "Ẩn" : "Hiện"}>
                  {showOld ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cp-new">Mật khẩu mới *</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IconLock /></span>
                <input id="cp-new" type={showNew ? "text" : "password"} className="form-input has-suffix"
                  placeholder="Tối thiểu 8 ký tự..."
                  value={form.newPassword} onChange={set("newPassword")}
                  autoComplete="new-password" required />
                <button type="button" className="form-input-suffix" onClick={() => setShowNew(!showNew)}
                  aria-label={showNew ? "Ẩn" : "Hiện"}>
                  {showNew ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              <PasswordStrength password={form.newPassword} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cp-confirm">Xác nhận mật khẩu mới *</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IconLock /></span>
                <input id="cp-confirm" type="password" className="form-input"
                  placeholder="Nhập lại mật khẩu mới..."
                  value={form.confirmPassword} onChange={set("confirmPassword")}
                  autoComplete="new-password" required />
              </div>
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <IconAlert /> Mật khẩu xác nhận không khớp
                </p>
              )}
            </div>

            <button type="submit" id="btn-change-password" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" aria-label="Đang xử lý..." /> : "Xác nhận đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
