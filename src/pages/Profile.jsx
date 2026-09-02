import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import authService from '../services/authService';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user, login } = useAuth(); // We might need to update the context user
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toast, setToast] = useState(null);

  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || '');

  // Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return setError('Họ tên không được để trống.');

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await userService.updateProfile(fullName);

      // Update local storage user (we can just merge)
      const updatedUser = { ...user, fullName: res.user.fullName };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      showToast('Cập nhật hồ sơ thành công!');
      // Force reload or auth context update to reflect in navbar immediately
      // A quick hack is to reload window, or better to expose a `setUser` in AuthContext
      // Since we don't have setUser in AuthContext right now, we can just update local state
      // but to reflect in Navbar it needs context update. Let's just reload for simplicity
      // or we can just window.location.reload();
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp.');
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authService.changePassword(oldPassword, newPassword);
      showToast('Đổi mật khẩu thành công! Bạn có thể dùng mật khẩu mới từ lần đăng nhập sau.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10,
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#22c55e',
          color: '#fff', fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      <Navbar />

      <main className="page-content" style={{ maxWidth: 800, margin: '0 auto', paddingTop: 40 }}>

        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'var(--color-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 700,
            boxShadow: '0 10px 25px rgba(var(--color-primary-rgb, 180,80,30), 0.3)'
          }}>
            {(user?.fullName || user?.username)?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>
              Hồ sơ cá nhân
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          {/* Cập nhật thông tin */}
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>Thông tin chung</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Họ và tên hiển thị</label>
                <div className="form-input-wrapper">
                  <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên..."
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tên đăng nhập / Email</label>
                <div className="form-input-wrapper">
                  <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.username || user?.email}
                    disabled
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
                  />
                </div>
                <div className="form-helper">Tên đăng nhập không thể thay đổi.</div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} id="btn-update-profile">
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>

          {/* Đổi mật khẩu */}
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>Đổi mật khẩu</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Mật khẩu hiện tại</label>
                <div className="form-input-wrapper">
                  <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <input
                    type="password"
                    className="form-input"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label">Mật khẩu mới</label>
                  <div className="form-input-wrapper">
                    <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                    <input
                      type="password"
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Xác nhận mật khẩu mới</label>
                  <div className="form-input-wrapper">
                    <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <input
                      type="password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-secondary" disabled={loading} id="btn-change-pwd">
                {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
