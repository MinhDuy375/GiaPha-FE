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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <style>{`
        @media (min-width: 768px) {
          .mobile-only { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
          .auth-page {
            display: flex !important;
            flex-direction: column !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            background-color: #FAF7F1 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
            justify-content: flex-start !important;
          }
          .auth-visual {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            background: linear-gradient(160deg, #B84D20 0%, #8E3A16 100%) !important;
            padding: 24px 16px 42px 16px !important;
            text-align: center !important;
            border-bottom-left-radius: 28px !important;
            border-bottom-right-radius: 28px !important;
            box-shadow: 0 4px 16px rgba(184, 77, 32, 0.25) !important;
            width: 100% !important;
            flex-shrink: 0 !important;
          }
          .auth-visual-content {
            width: 100% !important;
            max-width: 380px !important;
            margin: 0 auto !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .auth-visual-title {
            font-size: 1.25rem !important;
            font-weight: 800 !important;
            color: #FFFFFF !important;
            margin: 0 0 4px 0 !important;
            line-height: 1.25 !important;
          }
          .auth-visual-sub {
            font-size: 0.76rem !important;
            color: rgba(255, 255, 255, 0.9) !important;
            line-height: 1.35 !important;
            margin: 0 auto !important;
            max-width: 310px !important;
          }
          .auth-form-side {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: center !important;
            padding: 0 16px 16px 16px !important;
            margin-top: -26px !important;
            z-index: 2 !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .auth-card {
            width: 100% !important;
            max-width: 380px !important;
            background: #FFFFFF !important;
            border-radius: 20px !important;
            border: 1px solid #E7DED4 !important;
            padding: 18px 16px 14px 16px !important;
            box-shadow: 0 8px 24px rgba(43, 33, 27, 0.06) !important;
            box-sizing: border-box !important;
          }
          .auth-logo {
            color: #B84D20 !important;
            font-size: 0.7rem !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.04em !important;
            margin-bottom: 2px !important;
          }
          .auth-headline {
            color: #2B211B !important;
            font-size: 1.2rem !important;
            font-weight: 800 !important;
            margin: 0 0 2px 0 !important;
          }
          .auth-subline {
            color: #756A61 !important;
            font-size: 0.75rem !important;
            line-height: 1.35 !important;
            margin-bottom: 14px !important;
          }
          .form-input-wrapper {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            background-color: #FAF7F1 !important;
            border: 1px solid #E7DED4 !important;
            border-radius: 10px !important;
            height: 42px !important;
          }
          .form-input-wrapper:focus-within {
            border-color: #B84D20 !important;
            background-color: #FFFFFF !important;
            box-shadow: 0 0 0 3px rgba(184, 77, 32, 0.12) !important;
          }
          .form-input-icon {
            position: absolute !important;
            left: 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: #756A61 !important;
            pointer-events: none !important;
          }
          .form-input-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
          .form-input {
            width: 100% !important;
            height: 100% !important;
            background: transparent !important;
            border: none !important;
            outline: none !important;
            padding: 0 10px 0 34px !important;
            font-size: 0.8125rem !important;
            color: #2B211B !important;
          }
          #btn-forgot-password {
            width: 100% !important;
            height: 42px !important;
            background-color: #B84D20 !important;
            color: #FFFFFF !important;
            border: none !important;
            border-radius: 10px !important;
            font-size: 0.875rem !important;
            font-weight: 700 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-top: 14px !important;
            box-shadow: 0 4px 12px rgba(184, 77, 32, 0.2) !important;
          }
          .divider-label { display: none !important; }
          /* Tối ưu kích thước nút Quay lại đăng nhập gọn gàng */
          .mobile-back-box {
            text-align: center !important;
            margin-top: 10px !important;
          }
          .mobile-back-link {
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
            color: #B84D20 !important;
            font-weight: 600 !important;
            font-size: 0.75rem !important;
            text-decoration: none !important;
          }
          .mobile-back-link svg {
            width: 14px !important;
            height: 14px !important;
          }
        }
      `}</style>

      {/* Hero Banner Section */}
      <aside className="auth-visual" aria-hidden="true">
        <div className="auth-visual-content">
          <div className="desktop-only" style={{ marginBottom: "24px" }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect width="56" height="56" rx="16" fill="rgba(255,255,255,0.12)"/>
              <path d="M28 14 C20 14 14 20 14 28 C14 36 20 42 28 42 C36 42 42 36 42 28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M28 28 L28 18 M28 18 L33 23 M28 18 L23 23" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <p className="auth-visual-title">Khôi phục<br className="desktop-only" />tài khoản</p>
          <p className="auth-visual-sub">
            Nhập email đã đăng ký, hệ thống sẽ gửi<br className="desktop-only" />
            mật khẩu tạm thời để bạn đăng nhập lại.
          </p>

          <div className="desktop-only" style={{ marginTop: "40px", padding: "20px", background: "rgba(255,255,255,0.08)", borderRadius: "12px" }}>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
              💡 <strong>Lưu ý:</strong> Sau khi nhận được mật khẩu tạm thời, hãy đăng nhập và đổi ngay sang mật khẩu mới của bạn.
            </p>
          </div>
        </div>
      </aside>

      {/* Form Card Section */}
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
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(34,197,94,0.3)"
              }}>
                <IconCheck />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary, #2B211B)", marginBottom: "6px" }}>
                Đã gửi email!
              </h3>
              <p style={{ color: "var(--color-text-secondary, #756A61)", fontSize: "0.8125rem", lineHeight: 1.45, marginBottom: "16px" }}>
                Nếu email <strong>{email}</strong> tồn tại trong hệ thống, bạn sẽ nhận được mật khẩu tạm thời trong vài phút.
              </p>
              <Link to="/login" className="mobile-back-link" style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                color: "var(--color-primary, #B84D20)", fontWeight: 600, fontSize: "0.875rem",
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
              <div className="mobile-back-box">
                <Link to="/login" className="mobile-back-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-primary, #B84D20)", fontWeight: 500, textDecoration: "none" }}>
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