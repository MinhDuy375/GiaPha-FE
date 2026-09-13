import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
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

export default function Register() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email || !form.password) return;
    setError(""); setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại.");
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
            box-sizing: border-box !important;
            justify-content: flex-start !important;
          }
          .auth-visual {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            background: linear-gradient(160deg, #B84D20 0%, #8E3A16 100%) !important;
            padding: 28px 16px 45px 16px !important;
            text-align: center !important;
            position: relative !important;
            border-bottom-left-radius: 28px !important;
            border-bottom-right-radius: 28px !important;
            box-shadow: 0 4px 16px rgba(184, 77, 32, 0.25) !important;
            width: 100% !important;
            box-sizing: border-box !important;
            flex-shrink: 0 !important;
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
            gap: 8px !important;
            margin-bottom: 6px !important;
          }
          .mobile-brand-title {
            font-size: 1.05rem !important;
            font-weight: 800 !important;
            color: #FFFFFF !important;
            letter-spacing: 0.02em !important;
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
            margin-top: -28px !important;
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
            padding: 16px 16px 14px 16px !important;
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
            margin-bottom: 12px !important;
          }
          .reg-fields-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          .form-group {
            margin-bottom: 0 !important;
          }
          .form-label {
            color: #2B211B !important;
            font-size: 0.75rem !important;
            font-weight: 600 !important;
            margin-bottom: 4px !important;
            display: block !important;
          }
          .form-input-wrapper {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            background-color: #FAF7F1 !important;
            border: 1px solid #E7DED4 !important;
            border-radius: 10px !important;
            height: 42px !important;
            transition: all 0.2s ease !important;
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
          .form-input.has-suffix {
            padding-right: 38px !important;
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
            padding: 4px !important;
            min-width: 36px !important;
            min-height: 36px !important;
          }
          .form-input-suffix svg {
            width: 16px !important;
            height: 16px !important;
          }
          #btn-register {
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
            gap: 6px !important;
            cursor: pointer !important;
            margin-top: 12px !important;
            box-shadow: 0 4px 12px rgba(184, 77, 32, 0.2) !important;
          }
          .divider-label {
            display: none !important;
          }
          .mobile-login-box {
            text-align: center !important;
            margin-top: 10px !important;
            font-size: 0.78rem !important;
            color: #756A61 !important;
          }
          .mobile-login-link {
            color: #B84D20 !important;
            font-weight: 700 !important;
            text-decoration: none !important;
          }
        }
      `}</style>

      {/* Hero Banner Section */}
      <aside className="auth-visual" aria-hidden="true">
        <div className="auth-visual-content">
          {/* Logo riêng cho Desktop */}
          <div className="desktop-only" style={{ marginBottom: "24px" }}>
            <IconHeritageLogo />
          </div>

          {/* Header riêng cho Mobile */}
          <div className="mobile-brand-header mobile-only">
            <IconHeritageLogo />
            <span className="mobile-brand-title">Lạc Việt Gia Phả</span>
          </div>

          <h2 className="auth-visual-title">Khởi tạo hành trình</h2>
          <p className="auth-visual-sub">
            Tạo tài khoản chỉ trong vài phút để bắt đầu số hóa và lưu giữ ký ức cho dòng họ của bạn.
          </p>

          {/* Danh sách tính năng cho Desktop */}
          <div className="desktop-only" style={{ marginTop: "32px", width: "100%" }}>
            {["Lưu trữ lịch sử dòng họ", "Kết nối nhiều thế hệ", "Xuất PDF gia phả đẹp", "Quản lý quyền hạn linh hoạt"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", color: "rgba(255,255,255,0.85)", fontSize: "0.9375rem" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Form Card Section */}
      <div className="auth-form-side">
        <div className="auth-card">
          <p className="auth-logo">Lạc Việt Gia Phả</p>
          <h1 className="auth-headline">Tạo tài khoản</h1>
          <p className="auth-subline">Điền thông tin bên dưới để bắt đầu gìn giữ ký ức dòng họ.</p>

          {error && (
            <div className="alert alert-error" role="alert" aria-live="assertive" style={{ padding: "6px 10px", marginBottom: "8px", fontSize: "0.75rem" }}>
              <IconAlert /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="status" aria-live="polite" style={{ padding: "6px 10px", marginBottom: "8px", fontSize: "0.75rem" }}>
              <IconCheck /><span>Đăng ký thành công! Đang chuyển hướng...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="reg-fields-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-fullname">Tên gọi của bạn *</label>
                <div className="form-input-wrapper">
                  <span className="form-input-icon"><IconUser /></span>
                  <input id="reg-fullname" type="text" className="form-input" placeholder="Nguyễn Văn A" value={form.fullName} onChange={set("fullName")} autoComplete="name" required aria-required="true" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email *</label>
                <div className="form-input-wrapper">
                  <span className="form-input-icon"><IconMail /></span>
                  <input id="reg-email" type="email" className="form-input" placeholder="you@email.com" value={form.email} onChange={set("email")} autoComplete="email" required aria-required="true" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Mật khẩu *</label>
                <div className="form-input-wrapper">
                  <span className="form-input-icon"><IconLock /></span>
                  <input id="reg-password" type={showPw ? "text" : "password"} className="form-input has-suffix"
                    placeholder="Tối thiểu 6 ký tự..." value={form.password} onChange={set("password")} autoComplete="new-password" required aria-required="true" />
                  <button type="button" className="form-input-suffix" onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                    {showPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" id="btn-register" className="btn btn-primary btn-full btn-lg" disabled={loading || success}>
              {loading ? <span className="spinner" aria-label="Đang xử lý..." /> : "Tạo tài khoản"}
            </button>
          </form>

          <div className="divider-label">hoặc</div>

          <div className="mobile-login-box">
            Đã có tài khoản?{" "}
            <Link to="/login" className="mobile-login-link">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}