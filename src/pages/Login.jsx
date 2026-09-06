import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(""); setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.mustChangePassword) {
        navigate("/change-password");
      } else if (data.joinRequests?.some(request => request.status === 'Pending' || request.status === 'Rejected')) {
        navigate("/onboarding");
      } else if (!data.familyTrees || data.familyTrees.length === 0) {
        navigate("/onboarding");
      } else {
        navigate("/select-tree");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" role="main">
      <aside className="auth-visual" aria-hidden="true">
        <div className="auth-visual-content">
          <div style={{ marginBottom: "24px" }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect width="56" height="56" rx="16" fill="rgba(255,255,255,0.12)" />
              <path d="M28 10 L28 46 M18 20 L28 10 M38 20 L28 10 M14 34 L28 22 M42 34 L28 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="28" cy="10" r="3" fill="white" />
              <circle cx="14" cy="34" r="3" fill="white" />
              <circle cx="42" cy="34" r="3" fill="white" />
              <circle cx="28" cy="46" r="3" fill="white" />
            </svg>
          </div>
          <p className="auth-visual-title">Lưu giữ<br />ký ức dòng họ</p>
          <p className="auth-visual-sub">
            Gia phả số hóa giúp các thế hệ con cháu kết nối,<br />
            tìm về cội nguồn và gìn giữ văn hóa tổ tiên.
          </p>
          <div style={{ marginTop: "48px", display: "flex", gap: "24px" }}>
            {[["500+", "Dòng họ"], ["10K+", "Thành viên"], ["50+", "Tỉnh thành"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>{n}</div>
                <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <div className="auth-form-side">
        <div className="auth-card">
          <p className="auth-logo">Lạc Việt Gia Phả</p>
          <h1 className="auth-headline">Đăng nhập</h1>
          <p className="auth-subline">Chào mừng trở lại! Nhập thông tin để tiếp tục quản lý gia phả.</p>
          {error && (
            <div className="alert alert-error" role="alert" aria-live="assertive">
              <IconAlert /><span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IconUser /></span>
                <input id="login-email" type="email" className="form-input" placeholder="Nhập email..."
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required aria-required="true" />
              </div>
            </div>
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>Mật khẩu</label>
                <Link to="/forgot-password" style={{ fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 500 }}>Quên mật khẩu?</Link>
              </div>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IconLock /></span>
                <input id="login-password" type={showPw ? "text" : "password"} className="form-input has-suffix"
                  placeholder="Nhap mat khau..." value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" required aria-required="true" />
                <button type="button" className="form-input-suffix" onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "An mat khau" : "Hien mat khau"}>
                  {showPw ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>
            <button type="submit" id="btn-login" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? <span className="spinner" aria-label="Dang xu ly..." /> : "Dang nhap"}
            </button>
          </form>
          <div className="divider-label">hoac</div>
          <div style={{ textAlign: "center", fontSize: "0.9375rem", color: "var(--color-text-secondary)" }}>
            Chưa có tài khoản?{" "}
            <Link to="/register" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}