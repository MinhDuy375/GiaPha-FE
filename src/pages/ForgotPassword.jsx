import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(""); setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
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
              <rect width="56" height="56" rx="16" fill="rgba(255,255,255,0.12)"/>
              <path d="M28 14 C20 14 14 20 14 28 C14 36 20 42 28 42 C36 42 42 36 42 28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M28 28 L28 18 M28 18 L33 23 M28 18 L23 23" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="auth-visual-title">Khôi phục<br/>tài khoản</p>
          <p className="auth-visual-sub">
            Nhập email đã đăng ký, hệ thống sẽ gửi<br/>
            mật khẩu tạm thời để bạn đăng nhập lại.
          </p>
          <div style={{ marginTop: "40px", padding: "20px", background: "rgba(255,255,255,0.08)", borderRadius: "12px" }}>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
              💡 <strong>Lưu ý:</strong> Sau khi nhận được mật khẩu tạm thời, hãy đăng nhập và đổi ngay sang mật khẩu mới của bạn.
            </p>
          </div>
        </div>
      </aside>

      <div className="auth-form-side">
        <div className="auth-card">
          <p className="auth-logo">Lạc Việt Gia Phả</p>
          <h1 className="auth-headline">Quên mật khẩu</h1>
          <p className="auth-subline">Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mật khẩu tạm thời cho bạn.</p>

          {error && (
            <div className="alert alert-error" role="alert" aria-live="assertive">
              <IconAlert /><span>{error}</span>
            </div>
          )}

          {success ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(34,197,94,0.3)"
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "12px" }}>
                Đã gửi email!
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "28px" }}>
                Nếu email <strong>{email}</strong> tồn tại trong hệ thống, bạn sẽ nhận được mật khẩu tạm thời trong vài phút.
              </p>
              <Link to="/login" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                color: "var(--color-primary)", fontWeight: 600, fontSize: "0.9375rem",
                textDecoration: "none"
              }}>
                <IconArrowLeft />
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Địa chỉ Email</label>
                <div className="form-input-wrapper">
                  <span className="form-input-icon"><IconMail /></span>
                  <input
                    id="forgot-email" type="email" className="form-input"
                    placeholder="Nhập email đã đăng ký..."
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email" required aria-required="true"
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" id="btn-forgot-password" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" aria-label="Đang xử lý..." /> : "Gửi mật khẩu tạm thời"}
              </button>
            </form>
          )}

          {!success && (
            <>
              <div className="divider-label">hoặc</div>
              <div style={{ textAlign: "center", fontSize: "0.9375rem", color: "var(--color-text-secondary)" }}>
                <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-primary)", fontWeight: 500 }}>
                  <IconArrowLeft />
                  Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
