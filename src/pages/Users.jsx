import React, { useState, useEffect, useCallback } from 'react';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import userService from '../services/userService';
import roleGroupService from '../services/roleGroupService';
import Navbar from '../components/Navbar';
import FilterPanel from '../components/FilterPanel';

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Modal đổi vai trò ──────────────────────────────────────── */
function EditRoleModal({ open, onClose, onSave, user, roleGroups }) {
  const [roleGroupId, setRoleGroupId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && user) { setRoleGroupId(user.roleGroupId || ''); setError(''); }
  }, [open, user]);

  const handleSave = async () => {
    if (!roleGroupId) { setError('Vui lòng chọn vai trò.'); return; }
    setSaving(true); setError('');
    try { await onSave(user.id, roleGroupId); onClose(); }
    catch (e) { setError(e.response?.data?.message || 'Có lỗi xảy ra.'); }
    finally { setSaving(false); }
  };

  if (!open || !user) return null;
  return (
    <div className="dialog-overlay" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="dialog">
        <div className="dialog-header">
          <h2>Đổi vai trò — {user.fullName || user.username}</h2>
          <button className="dialog-close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="dialog-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
          <label className="dialog-field">
            Vai trò trong dòng họ
            <select className="input" value={roleGroupId} onChange={e => setRoleGroupId(e.target.value)}>
              <option value="">Chọn vai trò</option>
              {roleGroups.map(rg => <option key={rg.id} value={rg.id}>{rg.name}</option>)}
            </select>
          </label>
        </div>
        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" disabled={saving || !roleGroupId} onClick={handleSave}>
            {saving ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Trang chính ────────────────────────────────────────────── */
export default function Users() {
  const { hasPermission } = useFamilyTree();
  const canManage = hasPermission('user.manage');

  const [users, setUsers] = useState([]);
  const [roleGroups, setRoleGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftFilterStatus, setDraftFilterStatus] = useState(filterStatus);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [userData, groupData] = await Promise.all([userService.getUsers(), roleGroupService.getRoleGroups()]);
      setUsers(userData); setRoleGroups(groupData);
    } catch (e) {
      setError(e.response?.data?.message || 'Không thể tải danh sách người dùng.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const matchSearch = !search
      || u.fullName?.toLowerCase().includes(search.toLowerCase())
      || u.username?.toLowerCase().includes(search.toLowerCase())
      || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all'
      || (filterStatus === 'active' && u.isActive)
      || (filterStatus === 'locked' && !u.isActive);
    return matchSearch && matchStatus;
  });

  const handleUpdateRole = async (membershipId, roleGroupId) => {
    await userService.updateUserRole(membershipId, roleGroupId);
    setMessage('Đã cập nhật vai trò thành công.');
    setTimeout(() => setMessage(''), 3000);
    await load();
  };

  const handleToggleStatus = async (u) => {
    const action = u.isActive ? 'khóa' : 'kích hoạt';
    if (!window.confirm(`Xác nhận ${action} tài khoản "${u.fullName || u.username}"?`)) return;
    try {
      const result = await userService.updateUserStatus(u.userId, !u.isActive);
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3000);
      await load();
    } catch (e) { setError(e.response?.data?.message || `Không thể ${action} tài khoản.`); }
  };

  const handleRemove = async (u) => {
    if (!window.confirm(`Xóa "${u.fullName || u.username}" khỏi dòng họ? Hành động này không thể hoàn tác.`)) return;
    try {
      const result = await userService.removeUser(u.id);
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3000);
      await load();
    } catch (e) { setError(e.response?.data?.message || 'Không thể xóa người dùng.'); }
  };

  const resetFilter = () => {
    setDraftSearch('');
    setDraftFilterStatus('all');
    setSearch('');
    setFilterStatus('all');
    setFilterOpen(false);
  };

  const applyFilter = () => {
    setSearch(draftSearch);
    setFilterStatus(draftFilterStatus);
    setFilterOpen(false);
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">

        <div className="content-header-row">
          <div className="section-header">
            <h1 className="section-title">Quản lý người dùng</h1>
            <p className="section-sub">Danh sách tài khoản trong dòng họ hiện tại.</p>
          </div>
          <div className="content-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={load}><IconRefresh /> Làm mới</button>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {message && <div className="alert alert-success" style={{ marginBottom: 16 }}>{message}</div>}

        <div className="card" style={{ padding: 14, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => setFilterOpen(!filterOpen)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconSearch />Lọc</span>
            </button>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '.84rem' }}>
              {search ? `Từ khóa: ${search}` : 'Tất cả'}
              {filterStatus !== 'all' ? ` · ${filterStatus === 'active' ? 'Hoạt động' : 'Đã khóa'}` : ''}
            </span>
          </div>
        </div>

        <FilterPanel open={filterOpen} onClose={() => setFilterOpen(false)} onReset={resetFilter} onApply={applyFilter}>
          <div className="filter-grid">
            <label className="filter-field full">
              <span>Từ khóa</span>
              <input className="input" value={draftSearch} onChange={e => setDraftSearch(e.target.value)} placeholder="Tên, username, email..." />
            </label>
            <label className="filter-field">
              <span>Trạng thái</span>
              <select className="input" value={draftFilterStatus} onChange={e => setDraftFilterStatus(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="locked">Đã khóa</option>
              </select>
            </label>
          </div>
        </FilterPanel>

        {/* Bảng */}
        <div className="card" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Đang tải danh sách...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Người dùng</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Vai trò</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Ngày tham gia</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-alt)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700 }}>{u.fullName || '—'}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>@{u.username}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}><span className="chip">{u.roleGroupName || '—'}</span></td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: '.85rem' }}>
                      {new Date(u.joinedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="chip" style={{ background: u.isActive ? 'var(--color-success)' : 'var(--color-error)', color: '#fff' }}>
                        {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button className="btn btn-secondary btn-sm" disabled={!canManage} title="Đổi vai trò" onClick={() => setEditingUser(u)}>
                          <IconEdit />
                        </button>
                        <button className="btn btn-secondary btn-sm" disabled={!canManage} onClick={() => handleToggleStatus(u)}
                          style={{ color: u.isActive ? 'var(--color-warning)' : 'var(--color-success)', fontSize: '.8rem' }}>
                          {u.isActive ? 'Khóa' : 'Mở khóa'}
                        </button>
                        <button className="btn btn-sm" disabled={!canManage} onClick={() => handleRemove(u)} style={{ color: 'var(--color-error)' }}>
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              {search || filterStatus !== 'all' ? 'Không tìm thấy người dùng phù hợp.' : 'Dòng họ chưa có thành viên nào.'}
            </div>
          )}
        </div>

      </main>

      <EditRoleModal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdateRole}
        user={editingUser}
        roleGroups={roleGroups}
      />
    </div>
  );
}
