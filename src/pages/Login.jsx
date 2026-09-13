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
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconHeritageLogo = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.2)" />
    <circle cx="20" cy="20" r="14" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.8" />
    <path d="M20 8 L20 32 M12 16 L20 8 M28 16 L20 8 M10 26 L20 18 M30 26 L20 18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <circle cx="20" cy="8" r="2" fill="#FFFFFF" />
    <circle cx="10" cy="26" r="2" fill="#FFFFFF" />
    <circle cx="30" cy="26" r="2" fill="#FFFFFF" />
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
      {/* Phân lập CSS hoàn toàn: Desktop dùng CSS gốc, Mobile dùng CSS tùy chỉnh */}
      <style>{`
        @media (min-width: 768px) {
          .mobile-only { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
          .auth-page {
            display: flex !important;
            flex-direction: column !important;
            min-height: 100dvh !important;
            background-color: #FAF7F1 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow-x: hidden !important;
          }
          .auth-visual {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            background: linear-gradient(160deg, #B84D20 0%, #8E3A16 100%) !important;
            padding: 24px 20px 36px 20px !important;
            text-align: center !important;
            position: relative !important;
            border-bottom-left-radius: 28px !important;
            border-bottom-right-radius: 28px !important;
            box-shadow: 0 6px 20px rgba(184, 77, 32, 0.25) !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .auth-visual-content {
            position: relative !important;
            z-index: 1 !important;
            width: 100% !important;
            max-width: 380px !important;
            margin: 0 auto !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .mobile-brand-header {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            margin-bottom: 10px !important;
          }
          .mobile-brand-title {
            font-size: 1.1rem !important;
            font-weight: 800 !important;
            color: #FFFFFF !important;
            letter-spacing: 0.03em !important;
          }
          .auth-visual-title {
            font-size: 1.35rem !important;
            font-weight: 800 !important;
            color: #FFFFFF !important;
            margin: 0 0 6px 0 !important;
            line-height: 1.25 !important;
          }
          .auth-visual-sub {
            font-size: 0.78rem !important;
            color: rgba(255, 255, 255, 0.88) !important;
            line-height: 1.4 !important;
            margin: 0 auto 16px auto !important;
            max-width: 300px !important;
          }
          .mobile-stats-row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            background: rgba(255, 255, 255, 0.12) !important;
            backdrop-filter: blur(8px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 14px !important;
            padding: 8px 12px !important;
            box-sizing: border-box !important;
          }
          .mobile-stat-item {
            text-align: center !important;
            flex: 1 !important;
          }
          .mobile-stat-number {
            font-size: 1.05rem !important;
            font-weight: 800 !important;
            color: #FFFFFF !important;
            line-height: 1.1 !important;
          }
          .mobile-stat-label {
            font-size: 0.68rem !important;
            color: rgba(255, 255, 255, 0.8) !important;
            margin-top: 2px !important;
          }
          .auth-form-side {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: center !important;
            padding: 0 16px 24px 16px !important;
            margin-top: -18px !important;
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
            padding: 20px 18px !important;
            box-shadow: 0 8px 24px rgba(43, 33, 27, 0.06) !important;
            box-sizing: border-box !important;
          }
          .auth-logo {
            color: #B84D20 !important;
            font-size: 0.72rem !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            margin-bottom: 2px !important;
          }
          .auth-headline {
            color: #2B211B !important;
            font-size: 1.25rem !important;
            font-weight: 800 !important;
            margin: 0 0 4px 0 !important;
          }
          .auth-subline {
            color: #756A61 !important;
            font-size: 0.78rem !important;
            line-height: 1.4 !important;
            margin-bottom: 14px !important;
          }
          .form-group {
            margin-bottom: 12px !important;
          }
          .form-label {
            color: #2B211B !important;
            font-size: 0.8rem !important;
            font-weight: 600 !important;
          }
          .form-input-wrapper {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            background-color: #FAF7F1 !important;
            border: 1px solid #E7DED4 !important;
            border-radius: 12px !important;
            height: 46px !important;
            transition: all 0.2s ease !important;
          }
          .form-input-wrapper:focus-within {
            border-color: #B84D20 !important;
            background-color: #FFFFFF !important;
            box-shadow: 0 0 0 3px rgba(184, 77, 32, 0.12) !important;
          }
          .form-input-icon {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding-left: 12px !important;
            color: #756A61 !important;
          }
          .form-input-icon svg {
            width: 18px !important;
            height: 18px !important;
          }
          .form-input {
            width: 100% !important;
            height: 100% !important;
            background: transparent !important;
            border: none !important;
            outline: none !important;
            padding: 0 12px 0 10px !important;
            font-size: 0.875rem !important;
            color: #2B211B !important;
          }
          .form-input.has-suffix {
            padding-right: 42px !important;
          }
          .form-input-suffix {
            position: absolute !important;
            right: 4px !important;
            background: transparent !important;
            border: none !important;
            color: #756A61 !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 6px !important;
            min-width: 40px !important;
            min-height: 40px !important;
          }
          .form-input-suffix svg {
            width: 18px !important;
            height: 18px !important;
          }
          #btn-login {
            width: 100% !important;
            height: 46px !important;
            background-color: #B84D20 !important;
            color: #FFFFFF !important;
            border: none !important;
            border-radius: 12px !important;
            font-size: 0.9rem !important;
            font-weight: 700 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            cursor: pointer !important;
            margin-top: 8px !important;
            box-shadow: 0 4px 12px rgba(184, 77, 32, 0.25) !important;
          }
          .divider-label {
            display: none !important;
          }
          .mobile-forgot-link {
            font-size: 0.78rem !important;
            color: #B84D20 !important;
            font-weight: 600 !important;
            text-decoration: none !important;
          }
          .mobile-register-box {
            text-align: center !important;
            margin-top: 14px !important;
            font-size: 0.82rem !important;
            color: #756A61 !important;
          }
          .mobile-register-link {
            color: #B84D20 !important;
            font-weight: 700 !important;
            text-decoration: none !important;
          }
        }
      `}</style>

      {/* Hero Header Section */}
      <aside className="auth-visual" aria-hidden="true">
        <div className="auth-visual-content">
          {/* Logo riêng cho Desktop */}
          <div className="desktop-only" style={{ marginBottom: "24px" }}>
            <IconHeritageLogo />
          </div>

          {/* Header riêng cho Mobile */}
          <div className="mobile-brand-header mobile-only">
            <IconHeritageLogo />
            <span className="mobile-brand-title">Lạc Việt</span>
          </div>

          <h2 className="auth-visual-title">Ký ức dòng họ</h2>
          <p className="auth-visual-sub">
            Gia phả số hóa giúp các thế hệ con cháu kết nối, tìm về cội nguồn và gìn giữ văn hóa tổ tiên.
          </p>

          {/* Khối Thống kê riêng cho Mobile */}
          <div className="mobile-stats-row mobile-only">
            <div className="mobile-stat-item">
              <div className="mobile-stat-number">500+</div>
              <div className="mobile-stat-label">Dòng họ</div>
            </div>
            <div className="mobile-stat-item">
              <div className="mobile-stat-number">10K+</div>
              <div className="mobile-stat-label">Thành viên</div>
            </div>
            <div className="mobile-stat-item">
              <div className="mobile-stat-number">50+</div>
              <div className="mobile-stat-label">Tỉnh thành</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Login Card Section */}
      <div className="auth-form-side">
        <div className="auth-card">
          <p className="auth-logo">Lạc Việt Gia Phả</p>
          <h1 className="auth-headline">Đăng nhập</h1>
          <p className="auth-subline">Chào mừng trở lại! Nhập thông tin để tiếp tục quản lý gia phả.</p>
          
          {error && (
            <div className="alert alert-error" role="alert" aria-live="assertive" style={{ padding: "8px 12px", marginBottom: "12px", fontSize: "0.8rem" }}>
              <IconAlert /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IconUser /></span>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="Nhập email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>Mật khẩu</label>
                <Link to="/forgot-password" className="mobile-forgot-link">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IconLock /></span>
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  className="form-input has-suffix"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  className="form-input-suffix"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showPw ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <button type="submit" id="btn-login" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? (
                <span className="spinner" aria-label="Đang xử lí ..." />
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <IconArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="divider-label">hoặc</div>

          <div className="mobile-register-box">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="mobile-register-link">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}