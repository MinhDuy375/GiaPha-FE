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
const IconTree = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22V12M12 12 5 7M12 12l7-5M5 7V4M19 7V4M5 7l-2 0M19 7l2 0"/>
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

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", defaultFamilyTreeName: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email || !form.password) return;
    setError(""); setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.defaultFamilyTreeName);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      setError(err.response?.data?.message || "Dang ky that bai. Vui long kiem tra lai.");
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
              <path d="M28 10 L28 46 M18 20 L28 10 M38 20 L28 10 M14 34 L28 22 M42 34 L28 22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="28" cy="10" r="3" fill="white"/>
              <circle cx="14" cy="34" r="3" fill="white"/>
              <circle cx="42" cy="34" r="3" fill="white"/>
              <circle cx="28" cy="46" r="3" fill="white"/>
            </svg>
          </div>
          <p className="auth-visual-title">Bat dau hanh trinh<br/>tim ve coi nguon</p>
          <p className="auth-visual-sub">
            Tao tai khoan trong vai phut. He thong se tu dong khoi tao<br/>
            mot cay gia pha dau tien cho dong ho cua ban.
          </p>
          <div style={{ marginTop: "40px" }}>
            {["Luu tru lich su dong ho", "Ket noi nhieu the he", "Xuat PDF gia pha dep", "Quan ly quyen han linh hoat"].map((item) => (
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

      <div className="auth-form-side">
        <div className="auth-card">
          <p className="auth-logo">Lac Viet Gia Pha</p>
          <h1 className="auth-headline">Tao tai khoan</h1>
          <p className="auth-subline">Dien thong tin ben duoi de khoi tao hanh trinh giu gin ky uc dong ho.</p>

          {error && (
            <div className="alert alert-error" role="alert" aria-live="assertive">
              <IconAlert /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="status" aria-live="polite">
              <IconCheck /><span>Dang ky thanh cong! Dang chuyen huong...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="reg-username">Ten tai khoan *</label>
                <div className="form-input-wrapper">
                  <span className="form-input-icon"><IconUser /></span>
                  <input id="reg-username" type="text" className="form-input" placeholder="username" value={form.username} onChange={set("username")} autoComplete="username" required aria-required="true" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="reg-email">Email *</label>
                <div className="form-input-wrapper">
                  <span className="form-input-icon"><IconMail /></span>
                  <input id="reg-email" type="email" className="form-input" placeholder="you@email.com" value={form.email} onChange={set("email")} autoComplete="email" required aria-required="true" />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label" htmlFor="reg-password">Mat khau *</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IconLock /></span>
                <input id="reg-password" type={showPw ? "text" : "password"} className="form-input has-suffix"
                  placeholder="Toi thieu 6 ky tu..." value={form.password} onChange={set("password")} autoComplete="new-password" required aria-required="true" />
                <button type="button" className="form-input-suffix" onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "An mat khau" : "Hien mat khau"}>
                  {showPw ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-tree">Ten gia pha (Tuy chon)</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IconTree /></span>
                <input id="reg-tree" type="text" className="form-input" placeholder="VD: Gia pha ho Nguyen Van..."
                  value={form.defaultFamilyTreeName} onChange={set("defaultFamilyTreeName")} />
              </div>
              <p className="form-helper">He thong se tu tao 1 gia pha mac dinh neu ban bo trong.</p>
            </div>

            <button type="submit" id="btn-register" className="btn btn-primary btn-full btn-lg" disabled={loading || success}>
              {loading ? <span className="spinner" aria-label="Dang xu ly..." /> : "Tao tai khoan"}
            </button>
          </form>

          <div className="divider-label">hoac</div>
          <div style={{ textAlign: "center", fontSize: "0.9375rem", color: "var(--color-text-secondary)" }}>
            Da co tai khoan?{" "}
            <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Dang nhap</Link>
          </div>
        </div>
      </div>
    </div>
  );
}